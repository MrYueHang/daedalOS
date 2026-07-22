import { basename, join } from "path";
import { useEffect, useRef } from "react";
import { useFileSystem } from "contexts/fileSystem";
import { useSession } from "contexts/session";
import { DESKTOP_PATH, HOME } from "utils/constants";
import {
  type AppManifest,
  createManifestShortcut,
  getShortcutFileName,
  hasValidManifestChecksum,
  isInstallableManifest,
  parseAppCatalog,
  parseAppInstallations,
  sha256Text,
} from "utils/lichtreichAppCatalog";

type InstalledAppState = {
  manifest_version: string;
  shortcut_checksum: string;
  shortcut_path: string;
};

type AppSyncState = {
  catalog_version: string;
  evidence_at: string;
  installed: Record<string, InstalledAppState>;
};

const STATE_DIRECTORY = `${HOME}/.lichtreich`;
const STATE_FILE_NAME = "desktop-apps.v01.json";
const STATE_FILE = `${STATE_DIRECTORY}/${STATE_FILE_NAME}`;
const CONTROL_PLANE_URL =
  process.env.NEXT_PUBLIC_LICHTREICH_CONTROL_PLANE_URL || "";

const emitStatus = (
  status: "error" | "ready" | "syncing" | "unknown"
): void => {
  window.dispatchEvent(
    new CustomEvent("lichtreich:app-sync", { detail: { status } })
  );
};

const readState = async (
  readFile: (path: string) => Promise<Buffer>
): Promise<AppSyncState | undefined> => {
  try {
    const value = JSON.parse(
      (await readFile(STATE_FILE)).toString()
    ) as unknown;

    if (
      typeof value === "object" &&
      value !== null &&
      "installed" in value &&
      typeof value.installed === "object" &&
      value.installed !== null
    ) {
      return value as AppSyncState;
    }
  } catch {
    // First sync or unreadable state. The server remains authoritative.
  }

  return undefined;
};

const getEndpoint = (path: string): string => {
  const baseUrl = new URL(CONTROL_PLANE_URL);

  if (
    baseUrl.protocol !== "https:" ||
    (baseUrl.hostname !== "lichtreich.info" &&
      !baseUrl.hostname.endsWith(".lichtreich.info"))
  ) {
    throw new Error("Untrusted LICHTREICH control-plane URL.");
  }

  return new URL(path, `${baseUrl.origin}/`).toString();
};

const fetchJson = async (
  url: string,
  signal: AbortSignal
): Promise<unknown> => {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) throw new Error(`App sync returned ${response.status}.`);

  return response.json() as Promise<unknown>;
};

const useLichtreichAppSync = (): void => {
  const { createPath, deletePath, readFile, rootFs, updateFolder } =
    useFileSystem();
  const { sessionLoaded } = useSession();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!CONTROL_PLANE_URL || !rootFs || !sessionLoaded || syncedRef.current) {
      return undefined;
    }

    syncedRef.current = true;
    const controller = new AbortController();

    const syncApps = async (): Promise<void> => {
      emitStatus("syncing");

      const [catalogValue, installationsValue] = await Promise.all([
        fetchJson(getEndpoint("/api/v1/apps/catalog"), controller.signal),
        fetchJson(getEndpoint("/api/v1/apps/installations"), controller.signal),
      ]);
      const catalog = parseAppCatalog(catalogValue);
      const installations = parseAppInstallations(installationsValue);

      if (!catalog || !installations) {
        throw new Error("Invalid LICHTREICH app-sync response.");
      }

      const manifests = new Map<string, AppManifest>();

      await Promise.all(
        catalog.apps.map(async (app) => {
          if (
            isInstallableManifest(app) &&
            (await hasValidManifestChecksum(app))
          ) {
            manifests.set(app.id, app);
          }
        })
      );

      const previousState = await readState(readFile);
      const usedFileNames = new Set<string>();
      const installedEntries = await Promise.all(
        installations.installations.map(
          async (
            installation
          ): Promise<[string, InstalledAppState] | undefined> => {
            const manifest = manifests.get(installation.app_id);

            if (
              !manifest ||
              manifest.version !== installation.manifest_version
            ) {
              return undefined;
            }

            let fileName = getShortcutFileName(manifest);

            if (usedFileNames.has(fileName)) {
              fileName = `${fileName.slice(0, -4)} (${manifest.id}).url`;
            }
            usedFileNames.add(fileName);

            const shortcut = createManifestShortcut(manifest);
            const shortcutPath = join(DESKTOP_PATH, fileName);
            const writtenName = await createPath(
              fileName,
              DESKTOP_PATH,
              Buffer.from(shortcut),
              0,
              true
            );

            if (!writtenName) return undefined;

            await updateFolder(DESKTOP_PATH, writtenName);

            return [
              manifest.id,
              {
                manifest_version: manifest.version,
                shortcut_checksum: await sha256Text(shortcut),
                shortcut_path: shortcutPath,
              },
            ];
          }
        )
      );
      const nextInstalled = Object.fromEntries(
        installedEntries.filter(
          (entry): entry is [string, InstalledAppState] => Boolean(entry)
        )
      );

      await Promise.all(
        Object.entries(previousState?.installed || {}).map(
          async ([appId, previous]) => {
            if (nextInstalled[appId]) return;

            try {
              const currentShortcut = (
                await readFile(previous.shortcut_path)
              ).toString();

              if (
                previous.shortcut_checksum ===
                (await sha256Text(currentShortcut))
              ) {
                await deletePath(previous.shortcut_path);
                await updateFolder(
                  DESKTOP_PATH,
                  undefined,
                  basename(previous.shortcut_path)
                );
              }
            } catch {
              // Preserve locally changed or already removed shortcuts.
            }
          }
        )
      );

      const nextState: AppSyncState = {
        catalog_version: catalog.catalog_version,
        evidence_at: catalog.evidence_at,
        installed: nextInstalled,
      };

      await createPath(
        STATE_FILE_NAME,
        STATE_DIRECTORY,
        Buffer.from(JSON.stringify(nextState)),
        0,
        true
      );
      emitStatus("ready");
    };

    syncApps().catch(() => {
      if (!controller.signal.aborted) emitStatus("unknown");
    });

    return () => {
      controller.abort();
    };
  }, [createPath, deletePath, readFile, rootFs, sessionLoaded, updateFolder]);
};

export default useLichtreichAppSync;
