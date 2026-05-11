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
        } else {
          document.execCommand('selectAll');
          document.execCommand('insertText', false, ${JSON.stringify(q)});
        }
        await new Promise(r => setTimeout(r, 500));
        let btn = document.querySelector('[aria-label*="发送"]')
               || document.querySelector('img.enter_icon')
               || document.querySelector('.enter_icon')
               || document.querySelector('[class*="send" i]:not([disabled])');
        if (!btn) {
          const candidates = Array.from(document.querySelectorAll('button, [role="button"], img'));
          btn = candidates.find(b => /发送|send/i.test((b.getAttribute('aria-label')||'') + ' ' + (b.getAttribute('alt')||'') + ' ' + (b.textContent||'')));
        }
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
  }
};

const PRIMARY_ORDER = ['chatgpt', 'claude', 'gemini', 'deepseek', 'zhipu'];
