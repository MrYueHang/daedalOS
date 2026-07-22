import {
  type AppManifest,
  canonicalizeJson,
  createManifestShortcut,
  getManifestChecksum,
  getShortcutFileName,
  hasValidManifestChecksum,
  isInstallableManifest,
  parseAppInstallations,
} from "utils/lichtreichAppCatalog";

const manifest = {
  schema_version: "1.0",
  id: "system.project-analysis",
  name: "Projektanalyse",
  description: "Interne read-only Projektsicht",
  icon_url: "https://desktop.lichtreich.info/favicon.ico",
  launch_url: "https://analyse.lichtreich.info",
  launch_mode: "browser_window",
  scopes: ["system", "organisation"],
  required_capabilities: ["registry.read"],
  audiences: ["staff", "admin"],
  module_id: "system.registry",
  head_of_module_agent: "head.system.registry",
  health_url: "https://analyse.lichtreich.info/health",
  version: "1.0.0",
  repo_pointer: {
    repository: "MrYueHang/LICHTREICH_Cloud-Computer_true",
    ref: "main",
  },
  status: "PRODUCTION",
  data_classes: ["internal"],
  install_policy: "admin_only",
  default_install: false,
  installable: true,
  checksum: "",
  updated_at: "2026-07-22T20:00:00Z",
} as unknown as AppManifest;

describe("LICHTREICH app catalog", () => {
  test("canonicalizes object keys without changing array order", () => {
    expect(canonicalizeJson({ z: [2, 1], a: "x" })).toBe('{"a":"x","z":[2,1]}');
  });

  test("accepts only active, checksummed LICHTREICH browser apps", async () => {
    const checksum = await getManifestChecksum(manifest);
    const validManifest = { ...manifest, checksum };

    expect(isInstallableManifest(validManifest)).toBe(true);
    expect(await hasValidManifestChecksum(validManifest)).toBe(true);
    expect(
      isInstallableManifest({
        ...validManifest,
        launch_url: "https://example.com",
      })
    ).toBe(false);
    expect(
      isInstallableManifest({ ...validManifest, status: "DOCUMENTED" })
    ).toBe(false);
  });

  test("creates a safe daedalOS internet shortcut", async () => {
    const validManifest = {
      ...manifest,
      checksum: await getManifestChecksum(manifest),
    };

    expect(getShortcutFileName(validManifest)).toBe("Projektanalyse.url");
    expect(createManifestShortcut(validManifest)).toBe(
      "[InternetShortcut]\n" +
        "BaseURL=Browser\n" +
        "URL=https://analyse.lichtreich.info\n" +
        "Comment=Interne read-only Projektsicht\n" +
        "IconFile=https://desktop.lichtreich.info/favicon.ico\n"
    );
  });

  test("rejects incomplete installation receipts", () => {
    expect(
      parseAppInstallations({
        schema_version: "1.0",
        installations: [
          {
            app_id: "system.project-analysis",
            manifest_version: "1.0.0",
            receipt_id: "receipt_123",
            status: "INSTALLED",
            surface: "desktop",
          },
        ],
      })
    ).toBeDefined();
    expect(
      parseAppInstallations({
        schema_version: "1.0",
        installations: [{ app_id: "system.project-analysis" }],
      })
    ).toBeUndefined();
  });
});
