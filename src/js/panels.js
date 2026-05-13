// ─── PANEL CONTROLS ───
function reloadPanel(panelId) {
  const wv = document.getElementById(`wv-${panelId}`);
  const overlay = document.getElementById(`overlay-${panelId}`);
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.style.pointerEvents = 'none';
    const panel = document.getElementById(`panel-${panelId}`);
    const type = panel ? panel.dataset.type : panelId;
    const name = AI_TYPES[type] ? AI_TYPES[type].name : panelId;
    overlay.querySelector('.overlay-text').innerHTML = `${name}<br><small>正在加载…</small>`;
  }
  if (wv) wv.reload();
}

function focusPanel(panelId) {
  const wv = document.getElementById(`wv-${panelId}`);
  if (wv) wv.focus();
}

// 主面板的开关（根据 type）
function togglePanel(type) {
  const pill = document.querySelector(`.status-pill[data-ai="${type}"]`);
  const panel = document.getElementById(`panel-${type}`);
  if (!panel) return;
  if (activePanels.has(type) && activePanels.size > 1) {
    activePanels.delete(type);
    pill.classList.remove('active');
    panel.classList.add('hidden');
  } else if (!activePanels.has(type)) {
    activePanels.add(type);
    pill.classList.add('active');
    panel.classList.remove('hidden');
  }
  autoBroadcastCheck();
}

// ─── CLONE / CLOSE ───
function clonePanel(type) {
  if (!AI_TYPES[type]) return;
  cloneCounter[type] = (cloneCounter[type] || 1) + 1;
  const idx = cloneCounter[type];
  const panelId = `${type}-${idx}`;
  const cfg = AI_TYPES[type];

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.id = `panel-${panelId}`;
  panel.dataset.ai = type;
  panel.dataset.type = type;
  panel.dataset.primary = '0';
  panel.innerHTML = `
    <div class="panel-header">
      <div class="ai-logo">${cfg.icon}</div>
      <div class="panel-title">${cfg.name} <span class="panel-badge">#${idx}</span></div>
      <div class="panel-url-wrap" onclick="focusPanel('${panelId}')">
        <div class="panel-url">${cfg.host}</div>
      </div>
      <button class="panel-btn" title="新增副本（独立账号）" onclick="clonePanel('${type}')" aria-label="新增${cfg.name}副本">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button class="panel-btn" title="刷新" onclick="reloadPanel('${panelId}')" aria-label="刷新${cfg.name}">
        <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      </button>
      <button class="panel-btn" title="关闭副本" onclick="closeClone('${panelId}')" aria-label="关闭${cfg.name}副本">
        <svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>
    </div>
    <div class="panel-loading"><div class="panel-loading-bar"></div></div>
    <div class="panel-skeleton hidden">
      <div class="skel-block w-60 h-14"></div>
      <div class="skel-block w-full h-14"></div>
      <div class="skel-block w-80 h-14"></div>
      <div class="skel-block w-full h-40"></div>
      <div class="skel-block w-40 h-14"></div>
    </div>
    <div class="panel-overlay" id="overlay-${panelId}">
      <div class="overlay-icon">${cfg.overlayIcon}</div>
      <div class="overlay-text">${cfg.name} #${idx}<br><small>正在加载（独立账号）…</small></div>
    </div>
    <webview
      id="wv-${panelId}"
      src="${cfg.url}"
      partition="persist:clone-${panelId}"
      preload="./js/fingerprint-core.js"
      webpreferences="contextIsolation=no"
      useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      allowpopups
    ></webview>
    <div class="resize-handle" onmousedown="startResize(event, '${panelId}')"></div>
  `;
  document.getElementById('panels-container').appendChild(panel);
  activePanels.add(panelId);
  // 绑定事件需等 webview 插入 DOM
  setTimeout(() => {
    bindWebviewEvents(panelId);
    // 注入指纹保护到新副本
    const wvEl = document.getElementById(`wv-${panelId}`);
    if (wvEl) injectFingerprintForClone(wvEl, panelId);
  }, 0);
  showToast(`➕ 已新增 ${cfg.name} #${idx}（独立会话）`);
}

function closeClone(panelId) {
  const panel = document.getElementById(`panel-${panelId}`);
  if (!panel || panel.dataset.primary === '1') return;
  panel.remove();
  activePanels.delete(panelId);
}

// ─── ADD MENU ───
function toggleAddMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('add-menu');
  if (menu.classList.contains('open')) {
    menu.classList.remove('open');
    return;
  }
  menu.innerHTML = PRIMARY_ORDER.map(type => {
    const cfg = AI_TYPES[type];
    return `<div class="add-item" onclick="clonePanel('${type}'); toggleAddMenu();">
      <div class="ai-logo" style="background: rgba(124,106,247,0.12); color: var(--accent);">${cfg.icon}</div>
      <span>新增 ${cfg.name} 副本</span>
    </div>`;
  }).join('');
  menu.classList.add('open');
  document.addEventListener('click', closeAddMenuOnce, { once: true });
}

function closeAddMenuOnce() {
  document.getElementById('add-menu').classList.remove('open');
}

// ─── LAYOUT ─── 只作用于主面板的显示个数
function setLayout(n) {
  currentLayout = n;
  document.querySelectorAll('#titlebar .layout-btns .layout-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === n - 2);
  });
  const show = PRIMARY_ORDER.slice(0, n);
  const hide = PRIMARY_ORDER.slice(n);
  show.forEach(type => {
    activePanels.add(type);
    const p = document.getElementById(`panel-${type}`);
    if (p) p.classList.remove('hidden');
    const pill = document.querySelector(`.status-pill[data-ai="${type}"]`);
    if (pill) pill.classList.add('active');
  });
  hide.forEach(type => {
    activePanels.delete(type);
    const p = document.getElementById(`panel-${type}`);
    if (p) p.classList.add('hidden');
    const pill = document.querySelector(`.status-pill[data-ai="${type}"]`);
    if (pill) pill.classList.remove('active');
  });
  // Auto-enable broadcast when showing multiple panels
  autoBroadcastCheck();
}

// ─── RESIZE ───
let resizing = null;
let resizeStartX = 0;
let resizeStartFlex = 0;
let resizeNextPanel = null;
let resizeNextStartFlex = 0;

function startResize(e, panelId) {
  e.preventDefault();
  resizing = panelId;
  resizeStartX = e.clientX;
  const panel = document.getElementById(`panel-${panelId}`);
  resizeStartFlex = parseFloat(getComputedStyle(panel).flexGrow) || 1;
  // 找到右侧相邻的可见面板
  const allPanels = Array.from(document.querySelectorAll('#panels-container > .panel:not(.hidden)'));
  const idx = allPanels.findIndex(p => p.id === `panel-${panelId}` || p.dataset.ai === panelId || p.dataset.type === panelId);
  if (idx >= 0 && idx < allPanels.length - 1) {
    resizeNextPanel = allPanels[idx + 1];
    resizeNextStartFlex = parseFloat(getComputedStyle(resizeNextPanel).flexGrow) || 1;
  }
  // 锁定 body 光标和选择
  document.body.classList.add('resizing');
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
}

function onResize(e) {
  if (!resizing) return;
  const container = document.getElementById('panels-container');
  const dx = e.clientX - resizeStartX;
  const ratio = dx / container.offsetWidth;
  const panel = document.getElementById(`panel-${resizing}`);
  if (!panel) return;

  // 限制最小/最大 flex
  const newFlex = Math.max(0.3, Math.min(5, resizeStartFlex + ratio * 3));
  panel.style.flex = newFlex;
  panel.style.transition = 'none';

  // 同步调整相邻面板
  if (resizeNextPanel) {
    const nextNewFlex = Math.max(0.3, resizeNextStartFlex - ratio * 3);
    resizeNextPanel.style.flex = nextNewFlex;
    resizeNextPanel.style.transition = 'none';
  }
}

function stopResize() {
  if (!resizing) return;
  // 恢复过渡动画
  const panel = document.getElementById(`panel-${resizing}`);
  if (panel) panel.style.transition = '';
  if (resizeNextPanel) resizeNextPanel.style.transition = '';

  document.body.classList.remove('resizing');
  resizing = null;
  resizeNextPanel = null;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
}

// ─── RESPONSIVE LAYOUT ───
let responsiveLayoutActive = false;
let preResponsiveLayout = 4;

function checkResponsiveLayout() {
  const w = window.innerWidth;
  if (w < 640) {
    if (!responsiveLayoutActive || currentLayout > 2) {
      preResponsiveLayout = currentLayout;
      responsiveLayoutActive = true;
      // Let CSS handle single column via scroll
    }
  } else if (w < 960) {
    if (currentLayout > 2) {
      if (!responsiveLayoutActive) preResponsiveLayout = currentLayout;
      responsiveLayoutActive = true;
      setLayout(2);
    }
  } else {
    if (responsiveLayoutActive) {
      responsiveLayoutActive = false;
      setLayout(preResponsiveLayout);
    }
  }
}

window.addEventListener('resize', checkResponsiveLayout);
