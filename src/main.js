const { app, BrowserWindow, ipcMain, session, Tray, Menu, globalShortcut, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const store = require('./main/store.js');

let mainWindow;
let tray = null;
let isMiniMode = false;
let lastQuery = null; // FR-E04: cache last broadcast query for crash recovery
let lastQueryTime = 0;

// 持久化缓存目录 - 保存在用户文档目录
const userDataPath = path.join(app.getPath('documents'), 'AI-Browser-Cache');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// 设置持久化的 userData 存储路径（包含 cookies、session 等）
app.setPath('userData', userDataPath);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      allowRunningInsecureContent: false,
      // 使用持久化 partition，cookies 和 session 会自动保存
      partition: 'persist:aisession',
    },
  });

  // Allow all webview content to load
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders };
    // Remove frame-blocking headers so webviews can load AI sites
    delete headers['x-frame-options'];
    delete headers['X-Frame-Options'];
    if (headers['content-security-policy']) {
      delete headers['content-security-policy'];
    }
    if (headers['Content-Security-Policy']) {
      delete headers['Content-Security-Policy'];
    }
    callback({ responseHeaders: headers });
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── PROXY ───
let currentProxyConfig = null;

ipcMain.handle('set-proxy', async (_event, config) => {
  try {
    const { type, host, port, username, password } = config;
    let scheme = type;
    if (type === 'socks4') scheme = 'socks4';
    else if (type === 'socks5') scheme = 'socks5';
    let auth = '';
    if (username && password) {
      auth = `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }
    const proxyRules = `${scheme}://${auth}${host}:${port}`;
    await session.defaultSession.setProxy({ proxyRules });
    currentProxyConfig = config;
    console.log('[Proxy] Applied:', proxyRules);
    return { success: true };
  } catch (e) {
    console.error('[Proxy] Error:', e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('clear-proxy', async () => {
  try {
    await session.defaultSession.setProxy({ proxyRules: '' });
    currentProxyConfig = null;
    console.log('[Proxy] Cleared');
    return { success: true };
  } catch (e) {
    console.error('[Proxy] Error:', e);
    return { success: false, error: e.message };
  }
});

// ─── FINGERPRINT ───
const fingerprintSeeds = {}; // partition -> seed mapping
let fingerprintEnabled = false;

// Generate a deterministic seed from partition name
function getFingerprintSeed(partition) {
  if (!fingerprintSeeds[partition]) {
    // Create a seed from partition + random component
    const baseSeed = partition.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0);
    const randPart = Math.floor(Math.random() * 0xFFFFFFFF);
    fingerprintSeeds[partition] = Math.abs(baseSeed ^ randPart) || 1;
  }
  return fingerprintSeeds[partition];
}

ipcMain.handle('set-fingerprint', async (_event, enabled) => {
  fingerprintEnabled = !!enabled;
  console.log('[Fingerprint]', fingerprintEnabled ? 'Enabled' : 'Disabled');
  return { success: true, enabled: fingerprintEnabled };
});

ipcMain.handle('get-fingerprint-status', async () => {
  return { enabled: fingerprintEnabled, seeds: Object.keys(fingerprintSeeds).length };
});

ipcMain.handle('get-fingerprint-seed', async (_event, partition) => {
  const seed = getFingerprintSeed(partition || 'persist:aisession');
  return { seed, partition };
});

// ─── HISTORY / STORE IPC ───
ipcMain.handle('history:list', (_e, filter) => {
  const all = store.getConversations();
  if (!filter) return all.slice(0, 200);
  let result = all;
  if (filter.aiType) result = result.filter(c => c.aiType === filter.aiType);
  if (filter.favorite) result = result.filter(c => c.favorite);
  if (filter.tag) result = result.filter(c => c.tags && c.tags.includes(filter.tag));
  return result.slice(0, 200);
});

ipcMain.handle('history:save', (_e, conv) => {
  store.saveConversation(conv);
  return { success: true };
});

ipcMain.handle('history:delete', (_e, id) => {
  store.deleteConversation(id);
  return { success: true };
});

ipcMain.handle('history:search', (_e, query) => {
  return store.searchConversations(query).slice(0, 200);
});

ipcMain.handle('history:get', (_e, id) => {
  const all = store.getConversations();
  return all.find(c => c.id === id) || null;
});

// ─── TEMPLATES IPC ───
ipcMain.handle('templates:list', () => store.getTemplates());
ipcMain.handle('templates:save', (_e, tpl) => { store.saveTemplate(tpl); return { success: true }; });
ipcMain.handle('templates:delete', (_e, id) => { store.deleteTemplate(id); return { success: true }; });

// ─── COMPARISONS IPC ───
ipcMain.handle('compare:list', () => store.getComparisons());
ipcMain.handle('compare:save', (_e, cmp) => { store.saveComparison(cmp); return { success: true }; });

// ─── SETTINGS IPC ───
ipcMain.handle('settings:get', () => store.getSettings());
ipcMain.handle('settings:set', (_e, partial) => { store.saveSettings(partial); return { success: true }; });

// ─── BACKUP IPC ───
ipcMain.handle('backup:create', () => store.createBackup());
ipcMain.handle('backup:list', () => store.listBackups());
ipcMain.handle('backup:restore', (_e, id) => store.restoreBackup(id));

// ─── EXPORT IPC ───
ipcMain.handle('export:md', async (_e, data) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `ai-browser-export-${Date.now()}.md`,
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });
  if (!filePath) return { success: false, cancelled: true };
  try {
    fs.writeFileSync(filePath, data.content, 'utf8');
    return { success: true, filePath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('export:json', async (_e, data) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `ai-browser-data-${Date.now()}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (!filePath) return { success: false, cancelled: true };
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true, filePath };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('import:json', async () => {
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (!filePaths || filePaths.length === 0) return { success: false, cancelled: true };
  try {
    const raw = fs.readFileSync(filePaths[0], 'utf8');
    const data = JSON.parse(raw);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// ─── METRICS IPC (FR-E03) ───
let metricsInterval = null;

function startMetrics() {
  if (metricsInterval) return;
  metricsInterval = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    mainWindow.webContents.send('metrics:update', {
      mainRSS: Math.round(mem.rss / 1048576),
      mainHeap: Math.round(mem.heapUsed / 1048576),
      cpuUser: cpu.user,
      cpuSystem: cpu.system,
      ts: Date.now(),
    });
  }, 5000);
}

function stopMetrics() {
  if (metricsInterval) { clearInterval(metricsInterval); metricsInterval = null; }
}

ipcMain.handle('metrics:start', () => { startMetrics(); return { success: true }; });
ipcMain.handle('metrics:stop', () => { stopMetrics(); return { success: true }; });

// ─── CRASH RECOVERY (FR-E04) ───
ipcMain.handle('cache-last-query', (_e, query) => {
  lastQuery = query;
  lastQueryTime = Date.now();
  return { success: true };
});

ipcMain.handle('get-last-query', () => {
  // Valid for 10 minutes
  if (lastQuery && (Date.now() - lastQueryTime) < 600000) {
    return { success: true, query: lastQuery };
  }
  return { success: false };
});

// ─── PRIVACY CLEANUP IPC (FR-D07) ───
ipcMain.handle('cleanup:clear', async (_e, panelId) => {
  return await store.clearPrivacy(panelId);
});

// ─── DIAGNOSTICS IPC (FR-E08) ───
ipcMain.handle('diagnostics:export', async () => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `ai-browser-diagnostics-${Date.now()}.zip`,
    filters: [{ name: 'ZIP', extensions: ['zip'] }],
  });
  if (!filePath) return { success: false, cancelled: true };
  try {
    // Collect diagnostics
    const diag = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      arch: process.arch,
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome,
      memoryUsage: process.memoryUsage(),
      settings: store.getSettings(),
      conversationCount: store.getConversations().length,
    };
    // Write as JSON (simple approach, no zip dependency)
    fs.writeFileSync(filePath.replace('.zip', '.json'), JSON.stringify(diag, null, 2), 'utf8');
    return { success: true, filePath: filePath.replace('.zip', '.json') };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// ─── CRASH NOTIFICATION FROM RENDERER ───
ipcMain.on('pane-crashed', (_e, info) => {
  console.log('[Crash] Renderer reported pane crash:', info);
});

// ─── UPDATE INSTALL ───
ipcMain.on('update-install', () => {
  // Trigger quit and install (if using electron-updater)
  if (typeof autoUpdater !== 'undefined') {
    autoUpdater.quitAndInstall();
  }
});

// ─── AUTO BACKUP ───
function scheduleAutoBackup() {
  // Backup once on startup and every 24 hours
  store.createBackup();
  setInterval(() => {
    store.createBackup();
  }, 86400000);
}

// ─── SYSTEM TRAY + MINI MODE (GLM E3) ───
function createTray() {
  try {
    // Create a simple 16x16 tray icon
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { label: '显示/隐藏窗口', click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }},
      { label: '迷你模式', type: 'checkbox', checked: false, click: (item) => {
        toggleMiniMode(item.checked);
      }},
      { type: 'separator' },
      { label: '退出', click: () => { app.quit(); } },
    ]);
    tray.setToolTip('AI Browser');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (e) {
    console.log('[Tray] Failed to create tray:', e.message);
  }
}

function toggleMiniMode(enable) {
  isMiniMode = enable;
  if (enable) {
    mainWindow.setSize(400, 300);
    mainWindow.setAlwaysOnTop(true);
  } else {
    mainWindow.setSize(1600, 1000);
    mainWindow.setAlwaysOnTop(false);
  }
  mainWindow.webContents.send('mini-mode-changed', enable);
}

// Global shortcut: Ctrl+Shift+Space to toggle window visibility
function registerGlobalShortcuts() {
  try {
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (e) {
    console.log('[Shortcut] Failed to register global shortcut:', e.message);
  }
}

app.whenReady().then(() => {
  // Set a realistic user agent
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  session.defaultSession.setUserAgent(userAgent);

  createWindow();

  // Start services
  startMetrics();
  scheduleAutoBackup();
  createTray();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  stopMetrics();
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  stopMetrics();
  globalShortcut.unregisterAll();
});
