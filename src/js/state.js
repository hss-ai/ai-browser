// ─── GLOBAL STATE ───
let broadcastOn = false;
// activePanels 存储所有可见面板的 panelId，主面板 id 等于 type，副本为 type-N
let activePanels = new Set(PRIMARY_ORDER);
let currentLayout = 4;
let cloneCounter = { chatgpt: 1, claude: 1, gemini: 1, deepseek: 1, zhipu: 1 };

// ─── DATA MODELS (FR-D01) ───
// Conversation: { id, paneId, aiType, title, question, tags:[], favorite, rating?, messages:[{role,content,ts,source}], createdAt, updatedAt }
// Comparison: { id, question, entries:[{paneId,aiType,conversationId,latencyMs,answer,rating?}], summary?, createdAt }
// Template: { id, name, category, target, body, variables:[{key,label,default?}], isBuiltin, createdAt, updatedAt }
// Settings: { theme, locale, shortcuts:{}, metrics:{enabled,intervalMs}, sleep:{enabled,idleMinutes}, backup:{enabled,retainDays}, exportDir }

// Helpers to create data objects
function createConversationId() { return 'conv-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); }
function createComparisonId() { return 'cmp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); }
function createTemplateId() { return 'tpl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8); }

function buildConversation(paneId, aiType, question, messages) {
  return {
    id: createConversationId(),
    paneId, aiType,
    title: (question || '').slice(0, 60) || 'Untitled',
    question: question || '',
    tags: [],
    favorite: false,
    messages: messages || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function buildComparison(question, entries) {
  return {
    id: createComparisonId(),
    question: question || '',
    entries: entries || [],
    summary: null,
    createdAt: Date.now(),
  };
}

function buildComparisonEntry(paneId, aiType, conversationId, latencyMs, answer, rating) {
  return { paneId, aiType, conversationId, latencyMs: latencyMs || 0, answer: answer || '', rating: rating || null };
}

// ─── NAVIGATION STATE ───
let compareViewOpen = false;
let historyDrawerOpen = false;
let templatePanelOpen = false;
let workflowPanelOpen = false;

// FR-E02: Lazy load tracking
let panelLastVisible = {}; // panelId -> timestamp
let panelSleepTimer = null;
let sleepConfig = { enabled: true, idleMinutes: 5 };

// FR-C01: Extraction results cache
let extractionResults = {}; // comparisonId -> { paneId: { answer, latencyMs } }
let activeExtractions = {}; // paneId -> Promise (ongoing extractions)

// GLM E2: Clipboard history
let clipboardHistory = []; // max 20 items

// GLM E3: Mini mode
let miniModeActive = false;

// ─── MODEL CONFIG (GLM D1) ───
let customModels = {}; // { id: { name, url, icon, host, inject:(q)=>..., enabled } }

function getModelConfig(type) {
  // Check custom models first
  if (customModels[type]) return customModels[type];
  // Fall back to built-in AI_TYPES
  return AI_TYPES[type] || null;
}

function getAllModelTypes() {
  const builtin = Object.keys(AI_TYPES);
  const custom = Object.keys(customModels);
  return [...builtin, ...custom];
}
