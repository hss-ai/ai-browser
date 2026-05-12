const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

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

app.whenReady().then(() => {
  // Set a realistic user agent
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  session.defaultSession.setUserAgent(userAgent);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
