// ─── FINGERPRINT UI ───
// Controls fingerprint protection toggle and profile injection into webviews

let fpConfig = { enabled: true };

// ── Load / Save ──
function loadFpConfig() {
  try {
    const saved = localStorage.getItem('fingerprint-config');
    if (saved) fpConfig = JSON.parse(saved);
  } catch (e) { /* ignore */ }
}

function saveFpConfig() {
  localStorage.setItem('fingerprint-config', JSON.stringify(fpConfig));
}

// ── Inline profile generation (same logic as fingerprint-profiles.js, usable in renderer) ──
function mulberry32(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function buildProfile(seed) {
  const r = mulberry32(seed | 0);
  // Pick a realistic OS profile deterministically
  const osType = r() < 0.45 ? 'Windows' : (r() < 0.85 ? 'macOS' : 'Linux');

  const profiles = {
    Windows: {
      platform: 'Win32', platformDetail: 'Windows NT 10.0; Win64; x64',
      oscpu: 'Windows NT 10.0; Win64; x64', vendor: '',
      colorDepth: 24, pixelDepth: 24,
      maxTouchPoints: 0, language: 'zh-CN',
      languages: ['zh-CN', 'zh', 'en'],
      timezone: 'Asia/Shanghai', timezoneOffset: -480,
      webglVendor: 'Google Inc. (NVIDIA)',
      webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002504) Direct3D11 vs_5_0 ps_5_0)',
      webglUnmaskedVendor: 'NVIDIA Corporation',
      webglUnmaskedRenderer: 'NVIDIA GeForce RTX 3060/PCIe/SSE2',
      canvasNoise: 0.0002, audioNoise: 0.00003,
      fonts: ['Arial', 'Courier New', 'Times New Roman', 'Microsoft YaHei', 'SimSun'],
    },
    macOS: {
      platform: 'MacIntel', platformDetail: 'Macintosh; Intel Mac OS X 10_15_7',
      oscpu: 'Intel Mac OS X 10_15_7', vendor: 'Apple Computer, Inc.',
      colorDepth: 30, pixelDepth: 30,
      maxTouchPoints: 0, language: 'en-US',
      languages: ['en-US', 'en'],
      timezone: 'America/New_York', timezoneOffset: 300,
      webglVendor: 'WebKit', webglRenderer: 'WebKit WebGL',
      webglUnmaskedVendor: 'Apple', webglUnmaskedRenderer: 'Apple M2 Pro',
      canvasNoise: 0.0001, audioNoise: 0.000015,
      fonts: ['Helvetica', 'Times', 'Courier', 'Apple Color Emoji', 'SF Pro'],
    },
    Linux: {
      platform: 'Linux x86_64', platformDetail: 'X11; Linux x86_64',
      oscpu: 'Linux x86_64', vendor: '',
      colorDepth: 24, pixelDepth: 24,
      maxTouchPoints: 0, language: 'en-US',
      languages: ['en-US', 'en'],
      timezone: 'Europe/Berlin', timezoneOffset: -120,
      webglVendor: 'Mozilla', webglRenderer: 'Mozilla',
      webglUnmaskedVendor: 'AMD',
      webglUnmaskedRenderer: 'AMD Radeon RX 6800 (RADV NAVI21)',
      canvasNoise: 0.00016, audioNoise: 0.000026,
      fonts: ['DejaVu Sans', 'Liberation Sans', 'Nimbus Sans', 'FreeSans', 'Ubuntu'],
    },
  };

  const tpl = JSON.parse(JSON.stringify(profiles[osType]));
  // Screen: common resolutions
  const screens = [[1920, 1080], [2560, 1440], [1680, 1050], [3840, 2160], [1366, 768]];
  const sc = screens[Math.floor(r() * screens.length)];
  tpl.screenWidth = sc[0]; tpl.screenHeight = sc[1];
  tpl.availWidth = Math.max(sc[0] - 80, 800);
  tpl.availHeight = Math.max(sc[1] - 80, 600);

  // Hardware concurrency: 4-16
  tpl.hardwareConcurrency = [4, 6, 8, 10, 12, 16][Math.floor(r() * 6)];

  // Device memory for non-Mac
  if (osType !== 'macOS') {
    tpl.deviceMemory = [4, 8, 16, 32][Math.floor(r() * 4)];
  }

  // Jitter canvas/audio noise slightly
  tpl.canvasNoise = tpl.canvasNoise * (0.8 + r() * 0.4);
  tpl.audioNoise = tpl.audioNoise * (0.8 + r() * 0.4);

  tpl.profileId = 'fp-' + (seed >>> 0).toString(16).padStart(8, '0');
  tpl.seed = seed;
  tpl.os = osType;
  tpl.createdAt = Date.now();
  return tpl;
}

// ── Core hook code (cached after first read) ──
let _fpCoreCache = null;
function getFpCoreCode() {
  if (_fpCoreCache) return _fpCoreCache;
  try {
    const fs = require('fs');
    const path = require('path');
    _fpCoreCache = fs.readFileSync(path.join(__dirname, 'fingerprint-core.js'), 'utf8');
  } catch (e) {
    console.error('[Fingerprint] Cannot read fingerprint-core.js:', e.message);
    _fpCoreCache = '(function(){console.warn("Fingerprint core not loaded")})();';
  }
  return _fpCoreCache;
}

// ── Inject fingerprint into a single webview ──
function injectFingerprintInto(wv, partition) {
  if (!wv || !fpConfig.enabled) return;
  try {
    // Generate deterministic seed from partition name
    let seed = 0;
    const p = partition || 'persist:aisession';
    for (let i = 0; i < p.length; i++) {
      seed = ((seed << 5) - seed) + p.charCodeAt(i);
      seed |= 0;
    }
    seed = Math.abs(seed) || 42;

    const profile = buildProfile(seed);

    // Inject profile first, then hook code
    const profileScript = 'window.__FINGERPRINT_PROFILE__ = ' + JSON.stringify(profile) + ';';
    const coreCode = getFpCoreCode();

    wv.executeJavaScript(profileScript).then(() => {
      wv.executeJavaScript(coreCode).then(() => {
        console.log('[Fingerprint] Injected into', p, '→', profile.profileId);
      }).catch(() => {});
    }).catch(() => {});

    // Also inject on navigation to re-apply after page changes
    wv.addEventListener('did-navigate', () => {
      wv.executeJavaScript(profileScript).catch(() => {});
      wv.executeJavaScript(coreCode).catch(() => {});
    });

  } catch (e) {
    console.error('[Fingerprint] Injection error:', e.message);
  }
}

// ── Inject into all currently active webviews ──
function injectAllFingerprints() {
  document.querySelectorAll('webview').forEach(wv => {
    const panelId = wv.id.replace('wv-', '');
    const panel = document.getElementById('panel-' + panelId);
    const partition = wv.partition || (panel && panel.dataset.primary === '1'
      ? 'persist:aisession'
      : 'persist:clone-' + panelId);
    injectFingerprintInto(wv, partition);
  });
}

// ── Remove fingerprint from all webviews (reload to clear hooks) ──
function removeAllFingerprints() {
  document.querySelectorAll('webview').forEach(wv => {
    wv.reload();
  });
  showToast('指纹伪装已关闭，面板重新加载中…');
}

// ── Modal ──
function toggleFingerprintModal() {
  const overlay = document.getElementById('fingerprint-modal-overlay');
  const isOpen = overlay.style.display === 'flex';
  if (isOpen) {
    closeFingerprintModal();
  } else {
    document.getElementById('fingerprint-enabled').checked = fpConfig.enabled;
    toggleFingerprintEnabled();
    overlay.style.display = 'flex';
  }
}

function closeFingerprintModal() {
  document.getElementById('fingerprint-modal-overlay').style.display = 'none';
}

function toggleFingerprintEnabled() {
  // Visual feedback only; actual save happens on "保存"
}

function saveFingerprint() {
  fpConfig.enabled = document.getElementById('fingerprint-enabled').checked;
  saveFpConfig();

  const btn = document.getElementById('fingerprint-btn');
  btn.classList.toggle('active', fpConfig.enabled);

  if (fpConfig.enabled) {
    injectAllFingerprints();
    showToast('🔐 指纹伪装已启用 — 每个面板拥有独立指纹');
  } else {
    removeAllFingerprints();
  }

  closeFingerprintModal();
}

// ── Public API for panels.js to call when cloning ──
function injectFingerprintForClone(wvElement, panelId) {
  if (!fpConfig.enabled) return;
  const partition = 'persist:clone-' + panelId;
  injectFingerprintInto(wvElement, partition);
}
