export type AppManifest = {
  schema_version: "1.0";
  id: string;
  name: string;
  description: string;
  icon_url: string;
  launch_url: string;
  launch_mode: "browser_window";
  scopes: Array<"system" | "organisation" | "project" | "community" | "user">;
  required_capabilities: string[];
  audiences: Array<
    "public" | "authenticated" | "member" | "staff" | "admin" | "service"
  >;
  module_id: string;
  head_of_module_agent: string | null;
  health_url: string | null;
  version: string;
  repo_pointer: {
    repository: string;
    ref: string;
    path?: string;
  };
  status: "LINKED" | "INTEGRATED" | "STAGING" | "PRODUCTION";
  data_classes: Array<
    "public" | "internal" | "confidential" | "sensitive" | "restricted"
  >;
  install_policy: "system_default" | "opt_in" | "admin_only" | "hidden";
  default_install: boolean;
  installable: true;
  checksum: string;
  updated_at: string;
};

export type AppCatalog = {
  schema_version: "1.0";
  catalog_version: string;
  evidence_at: string;
  apps: unknown[];
};

export type AppInstallation = {
  app_id: string;
  manifest_version: string;
  receipt_id: string;
  status: "INSTALLED" | "SYSTEM_DEFAULT";
  surface: "desktop";
};

export type AppInstallations = {
  schema_version: "1.0";
  installations: AppInstallation[];
};

const ACTIVE_STATUSES = new Set([
  "LINKED",
  "INTEGRATED",
  "STAGING",
  "PRODUCTION",
]);
const CHECKSUM_PATTERN = /^sha256:[a-f0-9]{64}$/u;
const ID_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)+$/u;
const REPOSITORY_PATTERN = /^[^/]+\/[^/]+$/u;
const SCOPES = new Set([
  "system",
  "organisation",
  "project",
  "community",
  "user",
]);
const AUDIENCES = new Set([
  "public",
  "authenticated",
  "member",
  "staff",
  "admin",
  "service",
]);
const DATA_CLASSES = new Set([
  "public",
  "internal",
  "confidential",
  "sensitive",
  "restricted",
]);
const INSTALL_POLICIES = new Set([
  "system_default",
  "opt_in",
  "admin_only",
  "hidden",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isUniqueStringArray = (
  value: unknown,
  allowedValues?: Set<string>
): value is string[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(
    (entry) =>
      typeof entry === "string" &&
      entry.length > 0 &&
      (!allowedValues || allowedValues.has(entry))
  ) &&
  new Set(value).size === value.length;

const isTrustedLichtreichUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;

  try {
    const { hostname, protocol } = new URL(value);

    return (
      protocol === "https:" &&
      (hostname === "lichtreich.info" || hostname.endsWith(".lichtreich.info"))
    );
  } catch {
    return false;
  }
};

export const canonicalizeJson = (value: unknown): string => {
  if (
    value === null ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return JSON.stringify(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalizeJson(entry)).join(",")}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(value[key])}`)
      .join(",")}}`;
  }

  throw new TypeError("Unsupported value in canonical JSON.");
};

export const sha256Text = async (value: string): Promise<string> => {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  const hex = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `sha256:${hex}`;
};

export const getManifestChecksum = (manifest: object) =>
  sha256Text(canonicalizeJson({ ...manifest, checksum: null }));

export const isInstallableManifest = (value: unknown): value is AppManifest => {
  if (!isRecord(value)) return false;

  return (
    value.schema_version === "1.0" &&
    typeof value.id === "string" &&
    ID_PATTERN.test(value.id) &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.description === "string" &&
    value.description.trim().length > 0 &&
    isTrustedLichtreichUrl(value.icon_url) &&
    isTrustedLichtreichUrl(value.launch_url) &&
    value.launch_mode === "browser_window" &&
    isUniqueStringArray(value.scopes, SCOPES) &&
    Array.isArray(value.required_capabilities) &&
    value.required_capabilities.every(
      (capability) => typeof capability === "string" && capability.length > 0
    ) &&
    new Set(value.required_capabilities).size ===
      value.required_capabilities.length &&
    isUniqueStringArray(value.audiences, AUDIENCES) &&
    typeof value.module_id === "string" &&
    value.module_id.length > 0 &&
    (value.head_of_module_agent === null ||
      (typeof value.head_of_module_agent === "string" &&
        value.head_of_module_agent.length > 0)) &&
    (value.health_url === null || isTrustedLichtreichUrl(value.health_url)) &&
    typeof value.version === "string" &&
    value.version.length > 0 &&
    isRecord(value.repo_pointer) &&
    typeof value.repo_pointer.repository === "string" &&
    REPOSITORY_PATTERN.test(value.repo_pointer.repository) &&
    typeof value.repo_pointer.ref === "string" &&
    value.repo_pointer.ref.length > 0 &&
    (value.repo_pointer.path === undefined ||
      (typeof value.repo_pointer.path === "string" &&
        value.repo_pointer.path.length > 0)) &&
    typeof value.status === "string" &&
    ACTIVE_STATUSES.has(value.status) &&
    isUniqueStringArray(value.data_classes, DATA_CLASSES) &&
    typeof value.install_policy === "string" &&
    INSTALL_POLICIES.has(value.install_policy) &&
    typeof value.default_install === "boolean" &&
    value.installable === true &&
    typeof value.checksum === "string" &&
    CHECKSUM_PATTERN.test(value.checksum) &&
    typeof value.updated_at === "string" &&
    !Number.isNaN(Date.parse(value.updated_at))
  );
};

export const hasValidManifestChecksum = async (
  manifest: AppManifest
): Promise<boolean> =>
  manifest.checksum === (await getManifestChecksum(manifest));

export const parseAppCatalog = (value: unknown): AppCatalog | undefined => {
  if (!isRecord(value) || !Array.isArray(value.apps)) return undefined;
  if (
    value.schema_version !== "1.0" ||
    typeof value.catalog_version !== "string" ||
    typeof value.evidence_at !== "string"
  ) {
    return undefined;
  }

  return value as AppCatalog;
};

export const parseAppInstallations = (
  value: unknown
): AppInstallations | undefined => {
  if (
    !isRecord(value) ||
    value.schema_version !== "1.0" ||
    !Array.isArray(value.installations)
  ) {
    return undefined;
  }

  const validInstallations = value.installations.every(
    (installation) =>
      isRecord(installation) &&
      typeof installation.app_id === "string" &&
      ID_PATTERN.test(installation.app_id) &&
      typeof installation.manifest_version === "string" &&
      typeof installation.receipt_id === "string" &&
      (installation.status === "INSTALLED" ||
        installation.status === "SYSTEM_DEFAULT") &&
      installation.surface === "desktop"
  );

  return validInstallations ? (value as AppInstallations) : undefined;
};

const cleanShortcutValue = (value: string): string =>
  value.replace(/[\r\n]+/gu, " ").trim();

export const getShortcutFileName = (manifest: AppManifest): string => {
  const cleanName = manifest.name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 100);

  return `${cleanName || manifest.id}.url`;
};

export const createManifestShortcut = (manifest: AppManifest): string =>
  [
    "[InternetShortcut]",
    "BaseURL=Browser",
    `URL=${cleanShortcutValue(manifest.launch_url)}`,
    `Comment=${cleanShortcutValue(manifest.description)}`,
    `IconFile=${cleanShortcutValue(manifest.icon_url)}`,
    "",
  ].join("\n");
