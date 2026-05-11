// ─── PROXY ───
let proxyConfig = { enabled: false, type: 'http', host: '', port: '', username: '', password: '' };

function loadProxyConfig() {
  try {
    const saved = localStorage.getItem('proxy-config');
    if (saved) proxyConfig = JSON.parse(saved);
  } catch(e) {}
}

function saveProxyConfig() {
  localStorage.setItem('proxy-config', JSON.stringify(proxyConfig));
}

function applyProxy() {
  if (typeof require !== 'undefined') {
    const { ipcRenderer } = require('electron');
    if (proxyConfig.enabled && proxyConfig.host && proxyConfig.port) {
      ipcRenderer.invoke('set-proxy', proxyConfig);
    } else {
      ipcRenderer.invoke('clear-proxy');
    }
  }
}

function toggleProxyModal() {
  const overlay = document.getElementById('proxy-modal-overlay');
  const isOpen = overlay.style.display === 'flex';
  if (isOpen) {
    closeProxyModal();
  } else {
    document.getElementById('proxy-enabled').checked = proxyConfig.enabled;
    document.getElementById('proxy-type').value = proxyConfig.type || 'http';
    document.getElementById('proxy-host').value = proxyConfig.host || '';
    document.getElementById('proxy-port').value = proxyConfig.port || '';
    document.getElementById('proxy-user').value = proxyConfig.username || '';
    document.getElementById('proxy-pass').value = proxyConfig.password || '';
    toggleProxyEnabled();
    overlay.style.display = 'flex';
  }
}

function closeProxyModal() {
  document.getElementById('proxy-modal-overlay').style.display = 'none';
}

function toggleProxyEnabled() {
  const enabled = document.getElementById('proxy-enabled').checked;
  const fields = document.getElementById('proxy-fields');
  fields.style.opacity = enabled ? '1' : '0.4';
  fields.style.pointerEvents = enabled ? 'auto' : 'none';
}

function saveProxy() {
  proxyConfig.enabled = document.getElementById('proxy-enabled').checked;
  proxyConfig.type = document.getElementById('proxy-type').value;
  proxyConfig.host = document.getElementById('proxy-host').value.trim();
  proxyConfig.port = document.getElementById('proxy-port').value.trim();
  proxyConfig.username = document.getElementById('proxy-user').value.trim();
  proxyConfig.password = document.getElementById('proxy-pass').value.trim();
  saveProxyConfig();
  applyProxy();
  const btn = document.getElementById('proxy-btn');
  btn.classList.toggle('active', proxyConfig.enabled);
  closeProxyModal();
  showToast(proxyConfig.enabled ? `🔌 代理已启用: ${proxyConfig.host}:${proxyConfig.port}` : '代理已关闭');
}
