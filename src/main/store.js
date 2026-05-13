// ─── MAIN PROCESS STORE ───
// JSON file storage with safeStorage encryption
const { app, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(app.getPath('userData'), 'db');
const BACKUP_DIR = path.join(app.getPath('userData'), 'backups');

// Ensure directories exist
function ensureDirs() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// ─── ENCRYPTION HELPERS ───
function isEncryptionAvailable() {
  return safeStorage && safeStorage.isEncryptionAvailable();
}

function encryptData(data) {
  const json = JSON.stringify(data, null, 2);
  if (isEncryptionAvailable()) {
    const buf = safeStorage.encryptString(json);
    return buf.toString('base64');
  }
  // Fallback: store as plaintext with warning prefix
  return 'PLAIN:' + json;
}

function decryptData(raw) {
  if (!raw) return null;
  if (raw.startsWith('PLAIN:')) {
    return JSON.parse(raw.slice(6));
  }
  if (isEncryptionAvailable()) {
    try {
      const buf = Buffer.from(raw, 'base64');
      const json = safeStorage.decryptString(buf);
      return JSON.parse(json);
    } catch (e) {
      console.error('[Store] Decrypt failed:', e.message);
      return null;
    }
  }
  // Try plain JSON
  try { return JSON.parse(raw); } catch (e) { return null; }
}

// ─── FILE OPERATIONS ───
function readJSON(filename) {
  ensureDirs();
  const filePath = path.join(DB_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return decryptData(raw);
  } catch (e) {
    console.error(`[Store] Read ${filename} failed:`, e.message);
    return null;
  }
}

function writeJSON(filename, data) {
  ensureDirs();
  const filePath = path.join(DB_DIR, filename);
  try {
    const encrypted = encryptData(data);
    fs.writeFileSync(filePath, encrypted, 'utf8');
    return true;
  } catch (e) {
    console.error(`[Store] Write ${filename} failed:`, e.message);
    return false;
  }
}

// ─── CONVERSATIONS ───
const CONV_FILE = 'conversations.enc.json';

function getConversations() {
  return readJSON(CONV_FILE) || [];
}

function saveConversation(conv) {
  const list = getConversations();
  const idx = list.findIndex(c => c.id === conv.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...conv, updatedAt: Date.now() };
  } else {
    conv.createdAt = conv.createdAt || Date.now();
    conv.updatedAt = Date.now();
    list.unshift(conv);
  }
  return writeJSON(CONV_FILE, list);
}

function deleteConversation(id) {
  const list = getConversations().filter(c => c.id !== id);
  return writeJSON(CONV_FILE, list);
}

function searchConversations(query) {
  if (!query || !query.trim()) return getConversations();
  const q = query.toLowerCase();
  return getConversations().filter(c => {
    if (c.title && c.title.toLowerCase().includes(q)) return true;
    if (c.question && c.question.toLowerCase().includes(q)) return true;
    if (c.messages) {
      return c.messages.some(m => m.content && m.content.toLowerCase().includes(q));
    }
    return false;
  });
}

// ─── TEMPLATES ───
const TPL_FILE = 'templates.json';

const BUILTIN_TEMPLATES = [
  { id: 'tpl-trans-cn2en', name: '中译英专家', category: '翻译', body: '你是一位资深翻译专家，请将以下中文翻译为地道、流畅的英文，保留原意和风格：\n\n{{text}}', variables: [{ key: 'text', label: '待翻译文本', default: '' }], isBuiltin: true },
  { id: 'tpl-trans-en2cn', name: '英译中专家', category: '翻译', body: '你是一位资深翻译专家，请将以下英文翻译为准确、流畅的中文：\n\n{{text}}', variables: [{ key: 'text', label: '待翻译文本', default: '' }], isBuiltin: true },
  { id: 'tpl-trans-academic', name: '学术论文翻译', category: '翻译', body: '你是学术翻译专家，请将以下学术文本翻译为{{target}}，确保术语准确，保留学术风格：\n\n{{text}}', variables: [{ key: 'text', label: '待翻译文本', default: '' }, { key: 'target', label: '目标语言', default: '中文' }], isBuiltin: true },
  { id: 'tpl-code-review', name: '代码审查', category: '代码', body: '请对以下 {{language}} 代码进行审查，从以下维度分析：\n1. 代码质量与可读性\n2. 潜在 Bug 或安全隐患\n3. 性能优化建议\n4. 最佳实践建议\n\n```{{language}}\n{{code}}\n```', variables: [{ key: 'language', label: '编程语言', default: '' }, { key: 'code', label: '代码', default: '' }], isBuiltin: true },
  { id: 'tpl-bug-analyze', name: 'Bug 分析', category: '代码', body: '以下 {{language}} 代码出现了问题。请分析可能的原因，并给出修复建议：\n\n错误现象：{{symptom}}\n\n```{{language}}\n{{code}}\n```', variables: [{ key: 'language', label: '编程语言', default: '' }, { key: 'symptom', label: '错误现象', default: '' }, { key: 'code', label: '代码', default: '' }], isBuiltin: true },
  { id: 'tpl-refactor', name: '重构建议', category: '代码', body: '请对以下代码进行重构，提高可读性、可维护性和性能，并解释每处改动的理由：\n\n```{{language}}\n{{code}}\n```', variables: [{ key: 'language', label: '编程语言', default: '' }, { key: 'code', label: '代码', default: '' }], isBuiltin: true },
  { id: 'tpl-unit-test', name: '单元测试生成', category: '代码', body: '为以下 {{language}} 函数/方法生成完整的单元测试用例，覆盖正常情况、边界条件和异常情况：\n\n```{{language}}\n{{code}}\n```', variables: [{ key: 'language', label: '编程语言', default: '' }, { key: 'code', label: '代码', default: '' }], isBuiltin: true },
  { id: 'tpl-code-explain', name: '代码解释', category: '代码', body: '请详细解释以下 {{language}} 代码的功能和逻辑：\n\n```{{language}}\n{{code}}\n```', variables: [{ key: 'language', label: '编程语言', default: '' }, { key: 'code', label: '代码', default: '' }], isBuiltin: true },
  { id: 'tpl-official-doc', name: '公文写作', category: '写作', body: '你是公文写作专家，请撰写一份关于「{{topic}}」的正式公文/通知，语言规范、格式正确。要求：{{requirements}}', variables: [{ key: 'topic', label: '主题', default: '' }, { key: 'requirements', label: '具体要求', default: '' }], isBuiltin: true },
  { id: 'tpl-marketing', name: '营销文案', category: '写作', body: '你是一位资深营销文案写手，请为「{{product}}」撰写一篇吸引人的营销文案。\n\n目标受众：{{audience}}\n风格：{{style}}\n字数：约 {{wordCount}} 字', variables: [{ key: 'product', label: '产品/服务', default: '' }, { key: 'audience', label: '目标受众', default: '' }, { key: 'style', label: '文案风格', default: '简洁有力' }, { key: 'wordCount', label: '字数', default: '300' }], isBuiltin: true },
  { id: 'tpl-email-polish', name: '邮件润色', category: '写作', body: '请帮我润色以下邮件，使其更专业、更礼貌，同时保持原意：\n\n{{email}}', variables: [{ key: 'email', label: '原始邮件', default: '' }], isBuiltin: true },
  { id: 'tpl-learn-coach', name: '学习教练', category: '学习', body: '你是我的学习教练。我想学习「{{topic}}」。\n\n我的背景：{{background}}\n学习目标：{{goal}}\n可用时间：{{timePerWeek}}/周\n\n请为我制定一个学习计划，并推荐学习资源。', variables: [{ key: 'topic', label: '学习主题', default: '' }, { key: 'background', label: '现有背景', default: '零基础' }, { key: 'goal', label: '学习目标', default: '' }, { key: 'timePerWeek', label: '每周可用时间', default: '5小时' }], isBuiltin: true },
  { id: 'tpl-summarize', name: '内容总结', category: '学习', body: '请对以下内容进行总结，提取核心要点：\n\n{{content}}\n\n要求：{{requirements}}', variables: [{ key: 'content', label: '待总结内容', default: '' }, { key: 'requirements', label: '总结要求', default: '简洁清晰，不超过 300 字' }], isBuiltin: true },
  { id: 'tpl-brainstorm', name: '头脑风暴', category: '学习', body: '请就「{{topic}}」主题进行头脑风暴，从多个角度提出创意和想法。重点关注：{{focus}}', variables: [{ key: 'topic', label: '主题', default: '' }, { key: 'focus', label: '重点关注', default: '创新性和可行性' }], isBuiltin: true },
  { id: 'tpl-product-review', name: '产品评审', category: '产品', body: '请对以下产品/方案进行多维度评审：\n\n产品描述：{{description}}\n\n评审维度：\n1. 用户价值\n2. 技术可行性\n3. 商业可行性\n4. 风险与挑战\n5. 改进建议', variables: [{ key: 'description', label: '产品描述', default: '' }], isBuiltin: true },
];

function getTemplates() {
  const list = readJSON(TPL_FILE) || [];
  if (list.length === 0) {
    // Seed built-in templates on first read
    const seeded = BUILTIN_TEMPLATES.map(t => ({ ...t, createdAt: Date.now(), updatedAt: Date.now(), sortOrder: 0 }));
    writeJSON(TPL_FILE, seeded);
    return seeded;
  }
  return list;
}

function saveTemplate(tpl) {
  const list = getTemplates();
  const idx = list.findIndex(t => t.id === tpl.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...tpl, updatedAt: Date.now() };
  } else {
    tpl.createdAt = tpl.createdAt || Date.now();
    tpl.updatedAt = Date.now();
    tpl.isBuiltin = false;
    list.push(tpl);
  }
  return writeJSON(TPL_FILE, list);
}

function deleteTemplate(id) {
  const list = getTemplates().filter(t => !t.isBuiltin || t.id !== id);
  return writeJSON(TPL_FILE, list);
}

// ─── COMPARISONS ───
const CMP_FILE = 'comparisons.enc.json';

function getComparisons() {
  return readJSON(CMP_FILE) || [];
}

function saveComparison(cmp) {
  const list = getComparisons();
  const idx = list.findIndex(c => c.id === cmp.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...cmp };
  } else {
    cmp.createdAt = cmp.createdAt || Date.now();
    list.unshift(cmp);
  }
  return writeJSON(CMP_FILE, list);
}

// ─── SETTINGS ───
const SET_FILE = 'settings.json';

function getSettings() {
  return readJSON(SET_FILE) || {
    theme: 'dark',
    locale: 'zh-CN',
    metrics: { enabled: true, intervalMs: 5000 },
    sleep: { enabled: true, idleMinutes: 5 },
    backup: { enabled: true, retainDays: 7 },
    exportDir: '',
    shortcuts: {},
  };
}

function saveSettings(partial) {
  const current = getSettings();
  const merged = { ...current, ...partial };
  return writeJSON(SET_FILE, merged);
}

// ─── BACKUP ───
function createBackup() {
  ensureDirs();
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = path.join(BACKUP_DIR, `backup-${ts}.json`);
  try {
    const data = {
      conversations: getConversations(),
      templates: getTemplates(),
      comparisons: getComparisons(),
      settings: getSettings(),
      backedUpAt: Date.now(),
    };
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf8');
    // Clean old backups (keep last 7)
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();
    files.slice(7).forEach(f => {
      try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch (e) { /* ignore */ }
    });
    console.log('[Backup] Created:', backupFile);
    return { success: true, file: backupFile };
  } catch (e) {
    console.error('[Backup] Failed:', e.message);
    return { success: false, error: e.message };
  }
}

function listBackups() {
  ensureDirs();
  try {
    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse()
      .map(f => ({ id: f, file: path.join(BACKUP_DIR, f) }));
  } catch (e) {
    return [];
  }
}

function restoreBackup(id) {
  const filePath = path.join(BACKUP_DIR, id);
  if (!fs.existsSync(filePath)) return { success: false, error: 'Backup not found' };
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.conversations) writeJSON(CONV_FILE, data.conversations);
    if (data.templates) writeJSON(TPL_FILE, data.templates);
    if (data.comparisons) writeJSON(CMP_FILE, data.comparisons);
    if (data.settings) writeJSON(SET_FILE, data.settings);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ─── PRIVACY CLEANUP ───
const { session } = require('electron');

async function clearPrivacy(panelId) {
  try {
    const partition = panelId.includes('-') ? `persist:clone-${panelId}` : 'persist:aisession';
    const ses = session.fromPartition(partition);
    await ses.clearStorageData({
      storages: ['cookies', 'localstorage', 'cacheservice', 'indexdb', 'websql', 'serviceworkers'],
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

module.exports = {
  getConversations, saveConversation, deleteConversation, searchConversations,
  getTemplates, saveTemplate, deleteTemplate,
  getComparisons, saveComparison,
  getSettings, saveSettings,
  createBackup, listBackups, restoreBackup,
  clearPrivacy,
  isEncryptionAvailable,
};
