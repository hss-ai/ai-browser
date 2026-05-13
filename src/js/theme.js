// ─── THEME ENGINE ───
const THEME_KEY = 'ai-browser-theme';
let systemMediaQuery = null;

function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch (e) {
    return 'dark';
  }
}

function setTheme(mode) {
  // mode: 'light' | 'dark' | 'system' | 'hc'
  if (!['light', 'dark', 'system', 'hc'].includes(mode)) {
    mode = 'dark';
  }

  // Clean up previous system listener
  if (systemMediaQuery) {
    systemMediaQuery.removeEventListener('change', onSystemChange);
    systemMediaQuery = null;
  }

  document.documentElement.dataset.theme = mode;
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch (e) { /* ignore */ }

  // Setup system listener if 'system' mode
  if (mode === 'system') {
    systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemMediaQuery.addEventListener('change', onSystemChange);
  }

  updateThemeToggleIcon(mode);
}

function onSystemChange(e) {
  // When system is selected, just update the data-theme attribute — CSS handles the rest
  // No-op: CSS media query in tokens.css handles the actual color switching
}

function updateThemeToggleIcon(mode) {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  // Update icon based on effective theme
  let effective = mode;
  if (mode === 'system') {
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  btn.title = getThemeLabel(mode);
  btn.innerHTML = effective === 'dark' || effective === 'hc'
    ? '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
    : '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

function getThemeLabel(mode) {
  const labels = { light: '亮色主题', dark: '暗色主题', system: '跟随系统', hc: '高对比度' };
  return labels[mode] || '暗色主题';
}

function cycleTheme() {
  const modes = ['dark', 'light', 'system', 'hc'];
  const current = getTheme();
  const idx = modes.indexOf(current);
  const next = modes[(idx + 1) % modes.length];
  setTheme(next);
  showToast('主题: ' + getThemeLabel(next));
}

// Initialize on load
(function initTheme() {
  const saved = getTheme();
  document.documentElement.dataset.theme = saved;
  if (saved === 'system') {
    systemMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemMediaQuery.addEventListener('change', onSystemChange);
  }
})();

// ─── SETTINGS MODAL ───
function toggleSettingsModal() {
  const overlay = document.getElementById('settings-modal-overlay');
  const isOpen = overlay.style.display === 'flex';
  if (isOpen) {
    closeSettingsModal();
  } else {
    // Sync radio with current theme
    const current = getTheme();
    const radio = document.querySelector(`input[name="settings-theme"][value="${current}"]`);
    if (radio) radio.checked = true;
    // Sync locale radio
    const localeRadio = document.querySelector(`input[name="settings-locale"][value="${currentLocale}"]`);
    if (localeRadio) localeRadio.checked = true;
    // Sync sleep config
    const sleepCheck = document.getElementById('settings-sleep-enabled');
    const sleepMin = document.getElementById('settings-sleep-minutes');
    if (sleepCheck) sleepCheck.checked = sleepConfig.enabled;
    if (sleepMin) sleepMin.value = sleepConfig.idleMinutes;
    overlay.style.display = 'flex';
    // Render dynamic sections
    renderShortcutEditor();
    renderModelList();
  }
}

function closeSettingsModal() {
  document.getElementById('settings-modal-overlay').style.display = 'none';
}

function toggleReducedMotion() {
  const checked = document.getElementById('settings-reduced-motion').checked;
  try {
    localStorage.setItem('ai-browser-reduced-motion', checked ? '1' : '0');
  } catch (e) { /* ignore */ }
  if (checked) {
    document.documentElement.style.setProperty('--motion-fast', '0ms');
    document.documentElement.style.setProperty('--motion-base', '0ms');
    document.documentElement.style.setProperty('--motion-slow', '0ms');
  } else {
    document.documentElement.style.removeProperty('--motion-fast');
    document.documentElement.style.removeProperty('--motion-base');
    document.documentElement.style.removeProperty('--motion-slow');
  }
  showToast(checked ? '动效已关闭' : '动效已开启');
}

function renderModelList() {
  const container = document.getElementById('model-list');
  if (!container) return;
  container.innerHTML = Object.entries(AI_TYPES).map(([key, cfg]) => `
    <div class="model-item">
      <span class="model-name">${cfg.name}</span>
      <span class="model-url">${cfg.url}</span>
      <span class="model-status">✅ 已启用</span>
    </div>
  `).join('');
}
