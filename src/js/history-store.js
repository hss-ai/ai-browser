// ─── HISTORY STORE (Renderer-side IPC) ───
// Wraps main process store IPC for conversations, comparisons, templates, settings

const { ipcRenderer } = require('electron');

// ─── CONVERSATIONS ───
async function listConversations(filter) {
  return ipcRenderer.invoke('history:list', filter || null);
}

async function saveConversation(conv) {
  return ipcRenderer.invoke('history:save', conv);
}

async function searchConversations(query) {
  return ipcRenderer.invoke('history:search', query);
}

async function deleteConversation(id) {
  return ipcRenderer.invoke('history:delete', id);
}

async function getConversation(id) {
  return ipcRenderer.invoke('history:get', id);
}

async function toggleStar(id) {
  const conv = await getConversation(id);
  if (!conv) return null;
  conv.favorite = !conv.favorite;
  await saveConversation(conv);
  return conv;
}

async function addTag(id, tag) {
  const conv = await getConversation(id);
  if (!conv) return null;
  if (!conv.tags) conv.tags = [];
  if (!conv.tags.includes(tag)) conv.tags.push(tag);
  await saveConversation(conv);
  return conv;
}

async function removeTag(id, tag) {
  const conv = await getConversation(id);
  if (!conv) return null;
  if (conv.tags) conv.tags = conv.tags.filter(t => t !== tag);
  await saveConversation(conv);
  return conv;
}

async function rateResponse(conversationId, messageIndex, rating) {
  const conv = await getConversation(conversationId);
  if (!conv || !conv.messages || !conv.messages[messageIndex]) return null;
  conv.messages[messageIndex].rating = rating;
  conv.rating = rating; // overall rating
  await saveConversation(conv);
  return conv;
}

// ─── COMPARISONS ───
async function listComparisons() {
  return ipcRenderer.invoke('compare:list');
}

async function saveComparison(cmp) {
  return ipcRenderer.invoke('compare:save', cmp);
}

// ─── TEMPLATES ───
async function listTemplates() {
  return ipcRenderer.invoke('templates:list');
}

async function saveTemplate(tpl) {
  return ipcRenderer.invoke('templates:save', tpl);
}

async function deleteTemplate(id) {
  return ipcRenderer.invoke('templates:delete', id);
}

// ─── SETTINGS ───
async function getAppSettings() {
  return ipcRenderer.invoke('settings:get');
}

async function saveAppSettings(partial) {
  return ipcRenderer.invoke('settings:set', partial);
}

// ─── BACKUP ───
async function createBackup() {
  return ipcRenderer.invoke('backup:create');
}

async function listBackups() {
  return ipcRenderer.invoke('backup:list');
}

async function restoreBackup(id) {
  return ipcRenderer.invoke('backup:restore', id);
}

// ─── EXPORT ───
async function exportMarkdown(data) {
  return ipcRenderer.invoke('export:md', data);
}

async function exportJSON(data) {
  return ipcRenderer.invoke('export:json', data);
}

async function importJSON() {
  return ipcRenderer.invoke('import:json');
}

// ─── PRIVACY CLEANUP ───
async function clearPrivacy(panelId) {
  return ipcRenderer.invoke('cleanup:clear', panelId);
}

// ─── METRICS ───
ipcRenderer.on('metrics:update', (_event, data) => {
  window._metricsData = data;
  updateMetricsDisplay(data);
});

async function startMetrics() {
  return ipcRenderer.invoke('metrics:start');
}

async function stopMetrics() {
  return ipcRenderer.invoke('metrics:stop');
}

// ─── MINI MODE ───
ipcRenderer.on('mini-mode-changed', (_event, active) => {
  miniModeActive = active;
  updateMiniModeUI(active);
});

// ─── CRASH RECOVERY ───
async function cacheLastQuery(query) {
  return ipcRenderer.invoke('cache-last-query', query);
}

async function getLastQuery() {
  return ipcRenderer.invoke('get-last-query');
}
