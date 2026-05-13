// ─── PLUGIN HOST (FR-E01) ───
// Iframe-based plugin sandbox

let plugins = [];

// Built-in example plugins
const BUILTIN_PLUGINS = [
  {
    id: 'token-counter',
    name: 'Token 计数',
    description: '统计文本的 token 数量',
    permissions: [],
    code: `
      window.addEventListener('message', (e) => {
        if (e.data.type === 'count-tokens') {
          const text = e.data.text || '';
          // Simple token estimation: ~4 chars per token
          const tokens = Math.ceil(text.length / 4);
          window.parent.postMessage({ type: 'token-result', tokens, text: text.slice(0, 100) }, '*');
        }
      });
    `,
  },
  {
    id: 'word-translator',
    name: '划词翻译',
    description: '选中文本后翻译',
    permissions: ['readSelection'],
    code: `
      window.addEventListener('message', (e) => {
        if (e.data.type === 'translate') {
          const text = e.data.text || '';
          window.parent.postMessage({ type: 'translate-result', text, translated: '(需要接入翻译 API)' }, '*');
        }
      });
    `,
  },
];

function initPlugins() {
  plugins = [...BUILTIN_PLUGINS];
}

function renderPluginList() {
  const container = document.getElementById('plugin-list');
  if (!container) return;
  container.innerHTML = plugins.map(p => `
    <div class="plugin-item">
      <div class="plugin-name">${p.name}</div>
      <div class="plugin-desc">${p.description || ''}</div>
      <div class="plugin-actions">
        <button class="settings-btn" onclick="runPlugin('${p.id}')">运行</button>
      </div>
    </div>
  `).join('');
}

function runPlugin(pluginId) {
  const plugin = plugins.find(p => p.id === pluginId);
  if (!plugin) return;

  const iframe = document.getElementById('plugin-iframe');
  if (!iframe) return;

  // Clear and reload sandbox
  iframe.srcdoc = `<!DOCTYPE html><html><head></head><body><script>${plugin.code}<\/script></body></html>`;

  // For token counter plugin, send current text
  iframe.addEventListener('load', () => {
    const text = document.getElementById('query-input')?.value || '';
    iframe.contentWindow.postMessage({ type: 'count-tokens', text }, '*');
  }, { once: true });

  showToast('插件已启动: ' + plugin.name);
}

// Listen for plugin messages
window.addEventListener('message', (e) => {
  if (e.data.type === 'token-result') {
    showToast(`Token 估计: ${e.data.tokens} tokens (约 ${Math.ceil(e.data.tokens * 0.75)} 词)`);
  } else if (e.data.type === 'translate-result') {
    showToast(`翻译结果: ${e.data.translated}`);
  }
});
