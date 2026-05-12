// ─── APP INIT ───
// 初始化主面板事件绑定
PRIMARY_ORDER.forEach(id => bindWebviewEvents(id));

// 启动时加载代理
loadProxyConfig();
applyProxy();
if (proxyConfig.enabled) {
  document.getElementById('proxy-btn').classList.add('active');
}

// 启动时加载指纹配置
loadFpConfig();
if (fpConfig.enabled) {
  document.getElementById('fingerprint-btn').classList.add('active');
  // 延迟注入，等待 webview DOM 就绪
  setTimeout(() => injectAllFingerprints(), 500);
}

// 启动时钟
updateClock();
setInterval(updateClock, 1000);

// 初始状态：默认 3 栏（GPT / Gemini / DeepSeek，Claude 和智谱默认隐藏）
setLayout(3);
autoBroadcastCheck();
setStatus('就绪 — 按下 Enter 发送到所有可见面板（Cmd/Ctrl+Enter 也可发送）');
