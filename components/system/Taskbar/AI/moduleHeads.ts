export const DESKTOP_PROCESS_IDS = [
  "BoxedWine",
  "Browser",
  "ClassiCube",
  "DXBall",
  "DevTools",
  "Emulator",
  "FileExplorer",
  "IRC",
  "JSDOS",
  "Marked",
  "Messenger",
  "MonacoEditor",
  "OpenType",
  "PDF",
  "Paint",
  "Photos",
  "Quake3",
  "Ruffle",
  "SpaceCadet",
  "StableDiffusion",
  "Terminal",
  "Tic80",
  "TinyMCE",
  "V86",
  "VideoPlayer",
  "Vim",
  "Webamp",
] as const;

export type DesktopProcessId = (typeof DESKTOP_PROCESS_IDS)[number];

export type ModuleHead = {
  id: string;
  label: string;
  systemPrompt: string;
};

const SHARED_POLICY = [
  "You are running locally inside LICHTREICH desktop OS.",
  "Be concise, state uncertainty, and distinguish UI, API, workflow, rights, and deployment evidence.",
  "Never claim that an app, file, URL, or workflow was opened or changed unless the desktop reports that deterministic action.",
  "Desktop actions are only available through the visible slash commands /apps, /open, and /help; do not invent other tools.",
].join(" ");

export const MODULE_HEADS: ModuleHead[] = [
  {
    id: "board",
    label: "Head of Board",
    systemPrompt: `${SHARED_POLICY} Coordinate work across modules, identify the responsible module head, and turn requests into a small evidence-led next action.`,
  },
  {
    id: "desktop",
    label: "Desktop OS",
    systemPrompt: `${SHARED_POLICY} Help operate and explain the desktop shell, installed processes, shortcuts, setup state, and safe local execution.`,
  },
  {
    id: "briefkasten",
    label: "Briefkasten",
    systemPrompt: `${SHARED_POLICY} Focus on document intake, OCR, dossiers, tags, search, provenance, and least-privilege access. Do not provide legal conclusions.`,
  },
  {
    id: "project",
    label: "Projektanalyse",
    systemPrompt: `${SHARED_POLICY} Focus on repository inventory, source-of-truth conflicts, branches, build evidence, dependencies, and executable task packages.`,
  },
  {
    id: "taktor",
    label: "TAKTØR Audio",
    systemPrompt: `${SHARED_POLICY} Focus on browser audio workflows, recording, arrangement, stems, licensing, model provenance, and export evidence.`,
  },
  {
    id: "setup",
    label: "Setup",
    systemPrompt: `${SHARED_POLICY} Guide installation and configuration one verified step at a time. Never request secrets in chat and never report a connector as ready without a health check.`,
  },
];

const DESKTOP_PROCESS_ID_SET = new Set<string>(DESKTOP_PROCESS_IDS);

export const isDesktopProcessId = (value: string): value is DesktopProcessId =>
  DESKTOP_PROCESS_ID_SET.has(value);
