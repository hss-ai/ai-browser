// ─── FINGERPRINT PROFILE LIBRARY ───
// 提供真实设备指纹模板 + 基于 seed 的确定性生成

const FINGERPRINT_TEMPLATES = [
  // ── Windows Desktop ──
  {
    os: 'Windows',
    platform: 'Win32',
    platformDetail: 'Windows NT 10.0; Win64; x64',
    oscpu: 'Windows NT 10.0; Win64; x64',
    vendor: '',
    hardwareConcurrency: 8,
    deviceMemory: 8,
    colorDepth: 24,
    pixelDepth: 24,
    screenWidth: 1920,
    screenHeight: 1080,
    availWidth: 1920,
    availHeight: 1040,
    maxTouchPoints: 0,
    language: 'zh-CN',
    languages: ['zh-CN', 'zh', 'en'],
    timezone: 'Asia/Shanghai',
    timezoneOffset: -480,
    webglVendor: 'Google Inc. (NVIDIA)',
    webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002504) Direct3D11 vs_5_0 ps_5_0)',
    webglUnmaskedVendor: 'NVIDIA Corporation',
    webglUnmaskedRenderer: 'NVIDIA GeForce RTX 3060/PCIe/SSE2',
    canvasNoise: 0.0002,
    audioNoise: 0.00003,
    fonts: ['Arial', 'Courier New', 'Times New Roman', 'Microsoft YaHei', 'SimSun'],
  },
  {
    os: 'Windows',
    platform: 'Win32',
    platformDetail: 'Windows NT 10.0; Win64; x64',
    oscpu: 'Windows NT 10.0; Win64; x64',
    vendor: '',
    hardwareConcurrency: 16,
    deviceMemory: 16,
    colorDepth: 24,
    pixelDepth: 24,
    screenWidth: 2560,
    screenHeight: 1440,
    availWidth: 2560,
    availHeight: 1400,
    maxTouchPoints: 0,
    language: 'en-US',
    languages: ['en-US', 'en'],
    timezone: 'America/Los_Angeles',
    timezoneOffset: 420,
    webglVendor: 'Google Inc. (NVIDIA)',
    webglRenderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 (0x00002786) Direct3D11 vs_5_0 ps_5_0)',
    webglUnmaskedVendor: 'NVIDIA Corporation',
    webglUnmaskedRenderer: 'NVIDIA GeForce RTX 4070/PCIe/SSE2',
    canvasNoise: 0.00015,
    audioNoise: 0.000025,
    fonts: ['Arial', 'Calibri', 'Times New Roman', 'Segoe UI', 'Consolas'],
  },
  {
    os: 'Windows',
    platform: 'Win32',
    platformDetail: 'Windows NT 10.0; Win64; x64',
    oscpu: 'Windows NT 10.0; Win64; x64',
    vendor: '',
    hardwareConcurrency: 12,
    deviceMemory: 32,
    colorDepth: 24,
    pixelDepth: 24,
    screenWidth: 3840,
    screenHeight: 2160,
    availWidth: 3840,
    availHeight: 2120,
    maxTouchPoints: 0,
    language: 'zh-CN',
    languages: ['zh-CN', 'en', 'ja'],
    timezone: 'Asia/Tokyo',
    timezoneOffset: -540,
    webglVendor: 'Google Inc. (AMD)',
    webglRenderer: 'ANGLE (AMD, AMD Radeon RX 7900 XTX (0x0000744C) Direct3D11 vs_5_0 ps_5_0)',
    webglUnmaskedVendor: 'AMD',
    webglUnmaskedRenderer: 'AMD Radeon RX 7900 XTX',
    canvasNoise: 0.00018,
    audioNoise: 0.000028,
    fonts: ['Arial', 'Microsoft JhengHei', 'Meiryo', 'Times New Roman', 'MS Gothic'],
  },

  // ── macOS Desktop ──
  {
    os: 'macOS',
    platform: 'MacIntel',
    platformDetail: 'Macintosh; Intel Mac OS X 10_15_7',
    oscpu: 'Intel Mac OS X 10_15_7',
    vendor: 'Apple Computer, Inc.',
    hardwareConcurrency: 8,
    deviceMemory: undefined,
    colorDepth: 30,
    pixelDepth: 30,
    screenWidth: 1680,
    screenHeight: 1050,
    availWidth: 1680,
    availHeight: 979,
    maxTouchPoints: 0,
    language: 'en-US',
    languages: ['en-US', 'en'],
    timezone: 'America/New_York',
    timezoneOffset: 300,
    webglVendor: 'WebKit',
    webglRenderer: 'WebKit WebGL',
    webglUnmaskedVendor: 'Apple',
    webglUnmaskedRenderer: 'Apple M1 Pro',
    canvasNoise: 0.00012,
    audioNoise: 0.00002,
    fonts: ['Helvetica', 'Times', 'Courier', 'Apple Color Emoji', 'SF Pro'],
  },
  {
    os: 'macOS',
    platform: 'MacIntel',
    platformDetail: 'Macintosh; Intel Mac OS X 10_15_7',
    oscpu: 'Intel Mac OS X 10_15_7',
    vendor: 'Apple Computer, Inc.',
    hardwareConcurrency: 10,
    deviceMemory: undefined,
    colorDepth: 30,
    pixelDepth: 30,
    screenWidth: 3024,
    screenHeight: 1964,
    availWidth: 3024,
    availHeight: 1890,
    maxTouchPoints: 0,
    language: 'zh-Hans-CN',
    languages: ['zh-Hans-CN', 'zh-Hans', 'en'],
    timezone: 'Asia/Shanghai',
    timezoneOffset: -480,
    webglVendor: 'WebKit',
    webglRenderer: 'WebKit WebGL',
    webglUnmaskedVendor: 'Apple',
    webglUnmaskedRenderer: 'Apple M2 Max',
    canvasNoise: 0.0001,
    audioNoise: 0.000015,
    fonts: ['PingFang SC', 'Helvetica', 'Times', 'SF Pro', 'Apple SD Gothic Neo'],
  },
  {
    os: 'macOS',
    platform: 'MacIntel',
    platformDetail: 'Macintosh; Intel Mac OS X 10_15_7',
    oscpu: 'Intel Mac OS X 10_15_7',
    vendor: 'Apple Computer, Inc.',
    hardwareConcurrency: 12,
    deviceMemory: undefined,
    colorDepth: 30,
    pixelDepth: 30,
    screenWidth: 2048,
    screenHeight: 1280,
    availWidth: 2048,
    availHeight: 1205,
    maxTouchPoints: 0,
    language: 'en-GB',
    languages: ['en-GB', 'en', 'fr'],
    timezone: 'Europe/London',
    timezoneOffset: -60,
    webglVendor: 'WebKit',
    webglRenderer: 'WebKit WebGL',
    webglUnmaskedVendor: 'Apple',
    webglUnmaskedRenderer: 'Apple M3 Pro',
    canvasNoise: 0.00013,
    audioNoise: 0.000022,
    fonts: ['Helvetica Neue', 'Courier', 'Times', 'Apple Color Emoji', 'SF Pro Display'],
  },

  // ── Linux Desktop ──
  {
    os: 'Linux',
    platform: 'Linux x86_64',
    platformDetail: 'X11; Linux x86_64',
    oscpu: 'Linux x86_64',
    vendor: '',
    hardwareConcurrency: 8,
    deviceMemory: 16,
    colorDepth: 24,
    pixelDepth: 24,
    screenWidth: 1920,
    screenHeight: 1080,
    availWidth: 1920,
    availHeight: 1080,
    maxTouchPoints: 0,
    language: 'en-US',
    languages: ['en-US', 'en'],
    timezone: 'Europe/Berlin',
    timezoneOffset: -120,
    webglVendor: 'Mozilla',
    webglRenderer: 'Mozilla',
    webglUnmaskedVendor: 'AMD',
    webglUnmaskedRenderer: 'AMD Radeon RX 6800 (RADV NAVI21)',
    canvasNoise: 0.00016,
    audioNoise: 0.000026,
    fonts: ['DejaVu Sans', 'Liberation Sans', 'Nimbus Sans', 'FreeSans', 'Ubuntu'],
  },
];

// Seeded PRNG (mulberry32)
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Deterministic shuffle
function shuffle(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Adjust screen dimensions slightly (preserves aspect ratio within 10%)
function jitterScreen(w, h, rand) {
  const factor = 0.9 + rand() * 0.2; // 0.9 ~ 1.1
  return {
    w: Math.round(w * factor),
    h: Math.round(h * factor),
  };
}

// Generate a complete, self-consistent fingerprint profile from a seed
function generateProfile(seed) {
  const rng = mulberry32(seed);
  // Select template deterministically
  const tplIdx = Math.floor(rng() * FINGERPRINT_TEMPLATES.length);
  const tpl = JSON.parse(JSON.stringify(FINGERPRINT_TEMPLATES[tplIdx])); // deep clone

  // Apply per-instance jitter to make profiles unique even from same template
  const screen = jitterScreen(tpl.screenWidth, tpl.screenHeight, rng);
  tpl.screenWidth = screen.w;
  tpl.screenHeight = screen.h;
  tpl.availWidth = Math.max(screen.w - 80, 800);
  tpl.availHeight = Math.max(screen.h - 80, 600);

  // Slight jitter to hardwareConcurrency (keep >= 4)
  const hcJitter = Math.floor(rng() * 3) - 1; // -1, 0, or +1
  tpl.hardwareConcurrency = Math.max(4, Math.min(32, tpl.hardwareConcurrency + hcJitter));

  // device memory slight variation
  if (tpl.deviceMemory !== undefined) {
    const dmOptions = [4, 8, 16, 32];
    tpl.deviceMemory = dmOptions[Math.floor(rng() * dmOptions.length)];
  }

  // Randomize canvas noise slightly
  tpl.canvasNoise = tpl.canvasNoise * (0.8 + rng() * 0.4);
  tpl.audioNoise = tpl.audioNoise * (0.8 + rng() * 0.4);

  // Shuffle language preferences
  tpl.languages = shuffle(tpl.languages, rng);

  // Timezone: small ±30min offset jitter from template
  const tzJitter = (Math.floor(rng() * 3) - 1) * 30; // -30, 0, +30
  if (tpl.timezoneOffset !== undefined) {
    tpl.timezoneOffset = tpl.timezoneOffset + tzJitter;
  }

  // Unique profile ID
  tpl.profileId = `fp-${seed.toString(16).padStart(8, '0')}`;
  tpl.createdAt = Date.now();

  return tpl;
}

// Generate a random seed from string input (partition name)
function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) || 1;
}

// For use in preload context (no Node), export a compatible version
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateProfile, seedFromString, FINGERPRINT_TEMPLATES };
}
