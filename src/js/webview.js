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
