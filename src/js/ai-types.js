// ─── AI TYPE DEFINITIONS ───
const AI_TYPES = {
  chatgpt: {
    name: 'ChatGPT',
    short: 'ChatGPT',
    icon: 'G',
    url: 'https://chatgpt.com',
    host: 'chatgpt.com',
    overlayIcon: '🤖',
    inject: (q) => `
      (async () => {
        let el = document.querySelector('#prompt-textarea');
        if (!el) el = document.querySelector('textarea');
        if (!el) return;
        el.focus();
        if (el.tagName === 'TEXTAREA') {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(el, ${JSON.stringify(q)});
          el.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          document.execCommand('selectAll');
          document.execCommand('insertText', false, ${JSON.stringify(q)});
        }
        await new Promise(r => setTimeout(r, 500));
        const btn = document.querySelector('button[data-testid="send-button"]') ||
                    document.querySelector('button[aria-label="Send message"]') ||
                    document.querySelector('button[aria-label="发送消息"]') ||
                    document.querySelector('button[type="submit"]');
        if (btn && !btn.disabled) {
          btn.focus();
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          btn.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else {
          // 回退：模拟 Enter 按键
          await new Promise(r => setTimeout(r, 300));
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true, view: window }));
        }
      })();
    `
  },
  claude: {
    name: 'Claude',
    short: 'Claude',
    icon: 'C',
    url: 'https://claude.ai',
    host: 'claude.ai',
    overlayIcon: '✦',
    inject: (q) => `
      (async () => {
        let el = document.querySelector('[contenteditable="true"]');
        if (!el) return;
        el.focus();
        document.execCommand('selectAll');
        document.execCommand('insertText', false, ${JSON.stringify(q)});
        await new Promise(r => setTimeout(r, 500));
        const btn = document.querySelector('button[aria-label="Send Message"]') ||
                    document.querySelector('button[aria-label="Send message"]') ||
                    document.querySelector('button[type="submit"]') ||
                    document.querySelector('[data-testid="send-button"]');
        if (btn) {
          btn.focus();
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          btn.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else {
          await new Promise(r => setTimeout(r, 300));
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true, view: window }));
        }
      })();
    `
  },
  gemini: {
    name: 'Gemini',
    short: 'Gemini',
    icon: '✦',
    url: 'https://gemini.google.com',
    host: 'gemini.google.com',
    overlayIcon: '💫',
    inject: (q) => `
      (async () => {
        let el = document.querySelector('.ql-editor') ||
                 document.querySelector('[contenteditable="true"]') ||
                 document.querySelector('rich-textarea');
        if (!el) return;
        el.focus();
        document.execCommand('selectAll');
        document.execCommand('insertText', false, ${JSON.stringify(q)});
        await new Promise(r => setTimeout(r, 500));
        const btn = document.querySelector('button.send-button') ||
                    document.querySelector('[aria-label="Send message"]') ||
                    document.querySelector('button[mattooltip="Send message"]') ||
                    document.querySelector('button[aria-label*="Send"]') ||
                    document.querySelector('[data-testid="send-button"]');
        if (btn) {
          btn.focus();
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          btn.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else {
          await new Promise(r => setTimeout(r, 300));
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true, view: window }));
        }
      })();
    `
  },
  deepseek: {
    name: 'DeepSeek',
    short: 'DeepSeek',
    icon: 'D',
    url: 'https://chat.deepseek.com',
    host: 'chat.deepseek.com',
    overlayIcon: '🔍',
    inject: (q) => `
      (async () => {
        let el = document.querySelector('textarea');
        if (!el) return;
        el.focus();
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(el, ${JSON.stringify(q)});
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 500));
        const btn = document.querySelector('[aria-label="send"]') ||
                    document.querySelector('button[type="submit"]') ||
                    document.querySelector('.send-button') ||
                    document.querySelector('[data-testid="send-button"]') ||
                    document.querySelector('button[aria-label*="Send"]');
        if (btn) {
          btn.focus();
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          btn.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true, view: window }));
        } else {
          await new Promise(r => setTimeout(r, 300));
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true, view: window }));
        }
      })();
    `
  },
  zhipu: {
    name: '智谱清言',
    short: '智谱',
    icon: 'Z',
    url: 'https://chatglm.cn',
    host: 'chatglm.cn',
    overlayIcon: '🧠',
    inject: (q) => `
      (async () => {
        let el = document.querySelector('textarea')
              || document.querySelector('[contenteditable="true"]');
        if (!el) return;
        el.focus();
        if (el.tagName === 'TEXTAREA') {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(el, ${JSON.stringify(q)});
          el.dispatchEvent(new Event('input', { bubbles: true }));
          // 额外触发 React change 事件
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          document.execCommand('selectAll');
          document.execCommand('insertText', false, ${JSON.stringify(q)});
        }
        // 等待 React 状态更新 + 按钮变为可点击
        await new Promise(r => setTimeout(r, 800));
        // 多策略查找发送按钮（兼容 chatglm.cn 各种 DOM 版本）
        let btn = null;
        const selectors = [
          '[aria-label*="发送"]',
          'img[src*="send"]', 'img[src*="enter"]', 'img[class*="enter"]',
          'img[class*="send"]', '.enter_icon', '[class*="enter_icon"]',
          '[class*="send-btn"]', '[class*="sendBtn"]',
          'button[class*="send"]', 'div[class*="send"][role="button"]',
        ];
        for (const sel of selectors) {
          btn = document.querySelector(sel);
          if (btn) break;
        }
        // 暴力搜索：匹配文本内容含"发送"的元素
        if (!btn) {
          const candidates = Array.from(document.querySelectorAll('button, [role="button"], img, div, span'));
          btn = candidates.find(b => {
            const text = (b.getAttribute('aria-label')||'') + ' ' + (b.getAttribute('alt')||'') + ' ' + (b.textContent||'').trim();
            return /发送|send/i.test(text) && b.offsetParent !== null;
          });
        }
        if (btn) {
          btn.focus();
          // 尝试 React 内部事件（适配 React 渲染的按钮）
          const reactKey = Object.keys(btn).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'));
          if (reactKey && btn[reactKey]) {
            try {
              let fiber = btn[reactKey];
              if (reactKey.startsWith('__reactFiber')) {
                while (fiber && !fiber.memoizedProps?.onClick) fiber = fiber.return;
                if (fiber?.memoizedProps?.onClick) {
                  fiber.memoizedProps.onClick({ nativeEvent: { stopImmediatePropagation: () => {} } });
                  return;
                }
              } else if (reactKey.startsWith('__reactProps')) {
                const props = btn[reactKey];
                if (props.onClick) { props.onClick({ nativeEvent: { stopImmediatePropagation: () => {} } }); return; }
                if (props.onPointerDown) { props.onPointerDown({ nativeEvent: { stopImmediatePropagation: () => {} } }); return; }
              }
            } catch (re) { /* fall through to DOM events */ }
          }
          // DOM 事件回退 — 多种事件类型组合
          ['click', 'mousedown', 'mouseup'].forEach(type => {
            btn.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
          });
          btn.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true, view: window, pointerId: 1 }));
          btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window, pointerId: 1 }));
        } else {
          // 回退：直接按 Enter 发送
          await new Promise(r => setTimeout(r, 200));
          ['keydown', 'keypress', 'keyup'].forEach(type => {
            el.dispatchEvent(new KeyboardEvent(type, {
              key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
              bubbles: true, cancelable: true, view: window,
              composed: true
            }));
          });
        }
      })();
    `
  }
};

// ─── RESPONSE EXTRACTION (FR-C01) ───
// Each AI_TYPE gets an extract() method that returns a script string
// to extract the latest assistant response from the webview DOM

AI_TYPES.chatgpt.extract = () => `
  (() => {
    const msgs = document.querySelectorAll('div[data-message-author-role="assistant"]');
    if (!msgs || msgs.length === 0) return '';
    const last = msgs[msgs.length - 1];
    // Try to get markdown content first
    const md = last.querySelector('.markdown');
    return (md || last).innerText || '';
  })();
`;

AI_TYPES.chatgpt.selector = 'div[data-message-author-role="assistant"]';

AI_TYPES.claude.extract = () => `
  (() => {
    // Claude uses various class patterns
    const selectors = [
      'div.font-claude-message',
      'div[class*="message"][class*="assistant"]',
      'div[class*="response"]',
      '[data-testid="assistant-message"]',
    ];
    for (const sel of selectors) {
      const msgs = document.querySelectorAll(sel);
      if (msgs && msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        return last.innerText || '';
      }
    }
    return '';
  })();
`;

AI_TYPES.claude.selector = 'div[class*="message"][class*="assistant"], div.font-claude-message';

AI_TYPES.gemini.extract = () => `
  (() => {
    const selectors = [
      'div.response-content',
      'model-response .markdown',
      '.response-container',
      '[class*="model-response"]',
    ];
    for (const sel of selectors) {
      const msgs = document.querySelectorAll(sel);
      if (msgs && msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        return last.innerText || '';
      }
    }
    return '';
  })();
`;

AI_TYPES.gemini.selector = 'div.response-content, model-response .markdown';

AI_TYPES.deepseek.extract = () => `
  (() => {
    const msgs = document.querySelectorAll('div[class*="message"][class*="assistant"]');
    if (!msgs || msgs.length === 0) {
      // Fallback: any markdown content
      const md = document.querySelector('.markdown');
      return md ? md.innerText : '';
    }
    const last = msgs[msgs.length - 1];
    return last.innerText || '';
  })();
`;

AI_TYPES.deepseek.selector = 'div[class*="message"][class*="assistant"]';

AI_TYPES.zhipu.extract = () => `
  (() => {
    const selectors = [
      'div[class*="answer"]',
      'div[class*="reply"]',
      'div[class*="assistant"]',
      '.chat-content .answer',
    ];
    for (const sel of selectors) {
      const msgs = document.querySelectorAll(sel);
      if (msgs && msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        return last.innerText || '';
      }
    }
    return '';
  })();
`;

AI_TYPES.zhipu.selector = 'div[class*="answer"], div[class*="reply"]';

// ─── RESPONSE CAPTURE UTILITY ───
// Called from broadcast.js after sending query to start extraction
function captureResponse(paneId, aiType, timeoutMs) {
  const wv = document.getElementById(`wv-${paneId}`);
  if (!wv) return Promise.resolve('');

  const extractFn = AI_TYPES[aiType] && AI_TYPES[aiType].extract ? AI_TYPES[aiType].extract() : null;
  if (!extractFn) return Promise.resolve('');

  const startTime = Date.now();
  const timeout = timeoutMs || 60000;

  return new Promise((resolve) => {
    let resolved = false;
    const check = async () => {
      if (resolved) return;
      try {
        const result = await wv.executeJavaScript(extractFn);
        if (result && result.trim()) {
          resolved = true;
          resolve({ answer: result.trim(), latencyMs: Date.now() - startTime });
          return;
        }
      } catch (e) { /* ignore */ }
      if (Date.now() - startTime > timeout) {
        resolved = true;
        resolve({ answer: '', latencyMs: Date.now() - startTime });
        return;
      }
      setTimeout(check, 1500);
    };
    setTimeout(check, 2000); // Initial wait for response to start appearing
  });
}

const PRIMARY_ORDER = ['chatgpt', 'gemini', 'deepseek', 'claude', 'zhipu'];
