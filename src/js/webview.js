// ─── RESPONSIVE CSS FOR ZHIPU WEBVIEW ───
// Injected after page load to make chatglm.cn adapt to narrow panels
const ZHIPU_RESPONSIVE_CSS = `
  /* ── Responsive adaptation for narrow webview panels ── */
  /* Prevent root horizontal overflow */
  html { overflow-x: hidden !important; }
  body { overflow-x: hidden !important; min-width: 0 !important; }

  /* Images and media — scale down to fit */
  img, video, svg, canvas {
    max-width: 100% !important;
    height: auto !important;
  }

  /* Pre-formatted / code blocks — wrap instead of overflow */
  pre, code {
    white-space: pre-wrap !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    max-width: 100% !important;
  }

  /* Tables — allow horizontal scroll on overflow */
  table {
    max-width: 100% !important;
    display: block !important;
    overflow-x: auto !important;
  }

  /* Ensure text inputs don't overflow */
  input[type="text"], input[type="search"], textarea {
    max-width: 100% !important;
  }
`;

// ─── WEBVIEW LOADING HOOKS (bind 一个 panelId) ───
function bindWebviewEvents(panelId) {
  const wv = document.getElementById(`wv-${panelId}`);
  const panel = document.getElementById(`panel-${panelId}`);
  const overlay = document.getElementById(`overlay-${panelId}`);
  if (!wv || !panel) return;

  wv.addEventListener('did-start-loading', () => {
    panel.classList.add('loading');
  });
  wv.addEventListener('did-stop-loading', () => {
    panel.classList.remove('loading');
    if (overlay) overlay.classList.add('hidden');
    // Inject responsive CSS into Zhipu webview
    if (panel.dataset.type === 'zhipu') {
      try { wv.insertCSS(ZHIPU_RESPONSIVE_CSS); } catch (e) { /* silent */ }
    }
  });
  wv.addEventListener('did-fail-load', (e) => {
    panel.classList.remove('loading');
    if (e.errorCode !== -3 && overlay) {
      overlay.querySelector('.overlay-text').innerHTML =
        `加载失败<br><small>点击刷新重试</small>`;
      overlay.style.pointerEvents = 'auto';
    }
  });
}
