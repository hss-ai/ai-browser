// ─── ZHIPU INIT SCRIPT ───
// Auto-click 联网 toggle after page loads
const ZHIPU_INIT_SCRIPT = `
  (function zhipuAutoWebSearch() {
    if (window.__ZHIPU_WEBSEARCH_DONE__) return;
    // 联网搜索开关选择器（兼容 chatglm.cn 多种 DOM 版本）
    const searchSelectors = [
      '[class*="web-search"]', '[class*="webSearch"]',
      '[class*="online-search"]', '[class*="onlineSearch"]',
      '[class*="search-toggle"]', '[class*="searchToggle"]',
      '[class*="internet"]',
    ];
    function findAndClick() {
      let toggle = null;
      // 策略1：按 class 名匹配
      for (const sel of searchSelectors) {
        toggle = document.querySelector(sel);
        if (toggle && toggle.offsetParent !== null) break;
      }
      // 策略2：按文本内容匹配
      if (!toggle) {
        const candidates = Array.from(document.querySelectorAll('button, [role="button"], [role="switch"], div, span, label'));
        toggle = candidates.find(el => {
          const text = (el.textContent || '').trim();
          return (text === '联网' || text === '联网搜索' || /联网/.test(text)) && el.offsetParent !== null;
        });
      }
      if (toggle) {
        // 检查是否已经开启（通常有 active/checked/on 类）
        const alreadyOn = toggle.classList.contains('active')
          || toggle.classList.contains('checked')
          || toggle.classList.contains('on')
          || toggle.getAttribute('aria-checked') === 'true'
          || toggle.getAttribute('data-active') === 'true'
          || (toggle.querySelector('input[type="checkbox"]') && toggle.querySelector('input[type="checkbox"]').checked);
        if (!alreadyOn) {
          toggle.click();
          // React 兼容：额外触发事件
          toggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          // 尝试 React 内部事件
          const reactKey = Object.keys(toggle).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'));
          if (reactKey && toggle[reactKey]) {
            try {
              let fiber = toggle[reactKey];
              if (reactKey.startsWith('__reactFiber')) {
                while (fiber && !fiber.memoizedProps?.onClick) fiber = fiber.return;
                if (fiber?.memoizedProps?.onClick) fiber.memoizedProps.onClick({ nativeEvent: { stopImmediatePropagation: () => {} } });
              } else if (reactKey.startsWith('__reactProps')) {
                const props = toggle[reactKey];
                if (props.onClick) props.onClick({ nativeEvent: { stopImmediatePropagation: () => {} } });
              }
            } catch (e) { /* silent */ }
          }
          console.log('[AI-Browser] 智谱联网搜索已自动开启');
        }
        window.__ZHIPU_WEBSEARCH_DONE__ = true;
      }
    }
    // 延迟执行 + 重试（chatglm 页面可能是 CSR，联网按钮渲染较晚）
    let attempts = 0;
    const maxAttempts = 8;
    const tryInterval = setInterval(() => {
      attempts++;
      findAndClick();
      if (window.__ZHIPU_WEBSEARCH_DONE__ || attempts >= maxAttempts) {
        clearInterval(tryInterval);
      }
    }, 1500);
  })();
`;

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
      // Auto-click 联网 search toggle
      try { wv.executeJavaScript(ZHIPU_INIT_SCRIPT); } catch (e) { /* silent */ }
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
