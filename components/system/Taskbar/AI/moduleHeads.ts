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

export const LICHTREICH_MODULES = [
  { id: "landing", label: "LICHTREICH", url: "https://lichtreich.info" },
  { id: "board", label: "Board", url: "https://board.lichtreich.info" },
  {
    id: "briefkasten",
    label: "Briefkasten",
    url: "https://briefkasten.lichtreich.info",
  },
  { id: "crm", label: "CRM", url: "https://crm.lichtreich.info" },
  {
    id: "formulare",
    label: "Formulare",
    url: "https://formulare.lichtreich.info",
  },
  {
    id: "herrkuenstler",
    label: "Herrkünstler",
    url: "https://herrkuenstler.lichtreich.info",
  },
  { id: "ingest", label: "Ingest", url: "https://ingest.lichtreich.info" },
  { id: "me", label: "Mein Bereich", url: "https://me.lichtreich.info" },
  { id: "n8n", label: "n8n", url: "https://n8n.lichtreich.info" },
  { id: "dms", label: "Papiere", url: "https://dms.lichtreich.info" },
  { id: "pdf", label: "PDF-Werkbank", url: "https://pdf.lichtreich.info" },
  { id: "society", label: "Society", url: "https://society.lichtreich.info" },
  {
    id: "whiteboard",
    label: "Whiteboard",
    url: "https://whiteboard.lichtreich.info",
  },
  {
    id: "metabase",
    label: "Zahlen",
    url: "https://metabase.lichtreich.info",
  },
  { id: "rag", label: "RAG", url: "https://rag.lichtreich.info" },
  {
    id: "orchestra",
    label: "Orchestra",
    url: "https://orchestra.lichtreich.info",
  },
  { id: "mandat", label: "Mandat", url: "https://mandat.lichtreich.info" },
  { id: "consult", label: "Consult", url: "https://consult.lichtreich.info" },
  { id: "dateien", label: "Dateien", url: "https://dateien.lichtreich.info" },
  { id: "projekte", label: "Projekte", url: "https://projekte.lichtreich.info" },
  { id: "subs", label: "Subdomains", url: "https://subs.lichtreich.info" },
  { id: "tickets", label: "Tickets", url: "https://tickets.lichtreich.info" },
  { id: "setup", label: "Setup", url: "https://setup.lichtreich.info" },
] as const;

export type ModuleHead = {
  id: string;
  label: string;
  systemPrompt: string;
};

const SHARED_POLICY = [
  "You are running locally inside LICHTREICH desktop OS.",
  "Be concise, state uncertainty, and distinguish UI, API, workflow, rights, and deployment evidence.",
  "Never claim that an app, file, URL, or workflow was opened or changed unless the desktop reports that deterministic action.",
  "Desktop actions are only available through the visible slash commands /apps, /modules, /module, /open, and /help; do not invent other tools.",
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
