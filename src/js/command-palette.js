// ─── COMMAND PALETTE ───
// Ctrl/Cmd+K to open, fuzzy search with Fuse.js

let Fuse;
try {
  Fuse = require('fuse.js');
} catch (e) {
  // Fallback: loaded via <script> tag or preload
  setTimeout(() => {
    if (typeof Fuse === 'undefined' && typeof window !== 'undefined') {
      Fuse = window.Fuse;
    }
  }, 500);
}

const COMMANDS = [
  // Layout
  { id: 'layout-2', title: '切换为 2 栏布局', category: '布局', keywords: 'layout two columns', run: () => setLayout(2) },
  { id: 'layout-3', title: '切换为 3 栏布局', category: '布局', keywords: 'layout three columns', run: () => setLayout(3) },
  { id: 'layout-4', title: '切换为 4 栏布局', category: '布局', keywords: 'layout four columns', run: () => setLayout(4) },
  { id: 'layout-5', title: '切换为 5 栏布局', category: '布局', keywords: 'layout five columns', run: () => setLayout(5) },

  // Panels
  { id: 'toggle-chatgpt', title: '切换 ChatGPT 面板', category: '面板', keywords: 'show hide gpt', run: () => togglePanel('chatgpt') },
  { id: 'toggle-claude', title: '切换 Claude 面板', category: '面板', keywords: 'show hide', run: () => togglePanel('claude') },
  { id: 'toggle-gemini', title: '切换 Gemini 面板', category: '面板', keywords: 'show hide', run: () => togglePanel('gemini') },
  { id: 'toggle-deepseek', title: '切换 DeepSeek 面板', category: '面板', keywords: 'show hide', run: () => togglePanel('deepseek') },
  { id: 'toggle-zhipu', title: '切换智谱清言面板', category: '面板', keywords: 'show hide zhipu', run: () => togglePanel('zhipu') },

  // Clone
  { id: 'clone-chatgpt', title: '新增 ChatGPT 副本', category: '副本', keywords: 'clone gpt new instance', run: () => clonePanel('chatgpt') },
  { id: 'clone-claude', title: '新增 Claude 副本', category: '副本', keywords: 'clone new instance', run: () => clonePanel('claude') },
  { id: 'clone-gemini', title: '新增 Gemini 副本', category: '副本', keywords: 'clone new instance', run: () => clonePanel('gemini') },
  { id: 'clone-deepseek', title: '新增 DeepSeek 副本', category: '副本', keywords: 'clone new instance', run: () => clonePanel('deepseek') },
  { id: 'clone-zhipu', title: '新增智谱清言副本', category: '副本', keywords: 'clone zhipu new instance', run: () => clonePanel('zhipu') },

  // Broadcast
  { id: 'toggle-broadcast', title: '切换广播模式', category: '广播', keywords: 'broadcast on off', run: () => toggleBroadcast() },
  { id: 'send-broadcast', title: '发送广播', category: '广播', keywords: 'send query broadcast', run: () => sendQuery() },
  { id: 'clear-input', title: '清空输入框', category: '广播', keywords: 'clear input reset', run: () => { document.getElementById('query-input').value = ''; } },

  // Theme
  { id: 'theme-dark', title: '切换暗色主题', category: '主题', keywords: 'dark theme', run: () => setTheme('dark') },
  { id: 'theme-light', title: '切换亮色主题', category: '主题', keywords: 'light theme', run: () => setTheme('light') },
  { id: 'theme-system', title: '跟随系统主题', category: '主题', keywords: 'system theme auto', run: () => setTheme('system') },
  { id: 'theme-hc', title: '切换高对比度主题', category: '主题', keywords: 'high contrast hc', run: () => setTheme('hc') },
  { id: 'cycle-theme', title: '循环切换主题', category: '主题', keywords: 'cycle next', run: () => cycleTheme() },

  // Settings & Tools
  { id: 'open-settings', title: '打开设置', category: '工具', keywords: 'settings preferences config', run: () => toggleSettingsModal() },
  { id: 'open-proxy', title: '代理设置', category: '工具', keywords: 'proxy network', run: () => toggleProxyModal() },
  { id: 'open-fingerprint', title: '指纹保护设置', category: '工具', keywords: 'fingerprint privacy', run: () => toggleFingerprintModal() },

  // Refresh
  { id: 'reload-chatgpt', title: '刷新 ChatGPT', category: '刷新', keywords: 'reload gpt', run: () => reloadPanel('chatgpt') },
  { id: 'reload-all', title: '刷新全部面板', category: '刷新', keywords: 'reload all refresh', run: () => { PRIMARY_ORDER.forEach(id => { if (activePanels.has(id)) reloadPanel(id); }); } },

  // Misc
  { id: 'focus-input', title: '聚焦输入框', category: '导航', keywords: 'focus input', run: () => document.getElementById('query-input').focus() },
];

let fuseInstance = null;
let paletteVisible = false;
let paletteSelectedIndex = 0;
let paletteResults = [];

function initFuse() {
  if (typeof Fuse === 'undefined') {
    // Fuse might not be loaded yet; retry later
    setTimeout(initFuse, 200);
    return;
  }
  fuseInstance = new Fuse(COMMANDS, {
    keys: [{ name: 'title', weight: 2 }, { name: 'keywords', weight: 1 }],
    threshold: 0.4,
    distance: 100,
  });
}

function toggleCommandPalette() {
  if (paletteVisible) {
    closeCommandPalette();
  } else {
    openCommandPalette();
  }
}

function openCommandPalette() {
  const overlay = document.getElementById('cmd-palette-overlay');
  if (!overlay) return createPaletteDOM();
  paletteVisible = true;
  overlay.style.display = 'flex';
  const input = document.getElementById('cmd-palette-input');
  input.value = '';
  input.focus();
  paletteResults = COMMANDS;
  paletteSelectedIndex = 0;
  renderPaletteResults();
}

function closeCommandPalette() {
  paletteVisible = false;
  const overlay = document.getElementById('cmd-palette-overlay');
  if (overlay) overlay.style.display = 'none';
}

function createPaletteDOM() {
  const overlay = document.createElement('div');
  overlay.id = 'cmd-palette-overlay';
  overlay.onclick = function(e) { if (e.target === overlay) closeCommandPalette(); };
  overlay.innerHTML = `
    <div id="cmd-palette">
      <div id="cmd-palette-header">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="cmd-palette-input" type="text" placeholder="输入命令…" autocomplete="off">
        <span id="cmd-palette-hint">ESC 关闭</span>
      </div>
      <div id="cmd-palette-results"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = document.getElementById('cmd-palette-input');
  input.addEventListener('input', onPaletteInput);
  input.addEventListener('keydown', onPaletteKeydown);

  initFuse();
  paletteVisible = true;
  overlay.style.display = 'flex';
  input.focus();
  paletteResults = COMMANDS;
  paletteSelectedIndex = 0;
  renderPaletteResults();
}

function onPaletteInput(e) {
  const q = e.target.value.trim();
  if (!q) {
    paletteResults = COMMANDS;
  } else if (fuseInstance) {
    paletteResults = fuseInstance.search(q).map(r => r.item);
  }
  paletteSelectedIndex = 0;
  renderPaletteResults();
}

function onPaletteKeydown(e) {
  if (e.key === 'Escape') {
    closeCommandPalette();
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    paletteSelectedIndex = Math.min(paletteSelectedIndex + 1, paletteResults.length - 1);
    renderPaletteResults();
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    paletteSelectedIndex = Math.max(paletteSelectedIndex - 1, 0);
    renderPaletteResults();
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    if (paletteResults[paletteSelectedIndex]) {
      const cmd = paletteResults[paletteSelectedIndex];
      closeCommandPalette();
      cmd.run();
    }
    return;
  }
}

function renderPaletteResults() {
  const container = document.getElementById('cmd-palette-results');
  if (!container) return;

  if (paletteResults.length === 0) {
    container.innerHTML = '<div class="cmd-palette-empty">无匹配命令</div>';
    return;
  }

  // Group by category
  const grouped = {};
  paletteResults.forEach(cmd => {
    if (!grouped[cmd.category]) grouped[cmd.category] = [];
    grouped[cmd.category].push(cmd);
  });

  let html = '';
  let globalIdx = 0;
  Object.entries(grouped).forEach(([cat, cmds]) => {
    html += `<div class="cmd-palette-group">${cat}</div>`;
    cmds.forEach(cmd => {
      const sel = globalIdx === paletteSelectedIndex ? ' selected' : '';
      html += `<div class="cmd-palette-item${sel}" data-idx="${globalIdx}" onmousedown="selectPaletteItem(${globalIdx})">${cmd.title}</div>`;
      globalIdx++;
    });
  });

  container.innerHTML = html;

  // Scroll selected into view
  const selEl = container.querySelector('.cmd-palette-item.selected');
  if (selEl) selEl.scrollIntoView({ block: 'nearest' });
}

function selectPaletteItem(idx) {
  if (paletteResults[idx]) {
    paletteResults[idx].run();
  }
  closeCommandPalette();
}

// Global keyboard handler for Ctrl/Cmd+K
document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    toggleCommandPalette();
  }
});

// Initialize Fuse on load
initFuse();
