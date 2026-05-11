// ─── GLOBAL STATE ───
let broadcastOn = false;
// activePanels 存储所有可见面板的 panelId，主面板 id 等于 type，副本为 type-N
let activePanels = new Set(PRIMARY_ORDER);
let currentLayout = 4;
let cloneCounter = { chatgpt: 1, claude: 1, gemini: 1, deepseek: 1, zhipu: 1 };
