// ─── APP INIT ───
// 初始化主面板事件绑定
PRIMARY_ORDER.forEach(id => bindWebviewEvents(id));

// 启动时加载代理
loadProxyConfig();
applyProxy();
if (proxyConfig.enabled) {
  document.getElementById('proxy-btn').classList.add('active');
}

// 启动时钟
updateClock();
setInterval(updateClock, 1000);

// 初始状态：默认 4 栏（隐藏智谱）
setLayout(4);
setStatus('就绪 — 开启广播模式同步主面板，或点 + 新增同型 AI 的其他账号副本（Cmd/Ctrl+Enter 发送）');
