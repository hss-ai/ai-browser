// ─── APP INIT ───
// 初始化 i18n 国际化
initLocale();
// 初始化主面板事件绑定
PRIMARY_ORDER.forEach(id => bindWebviewEvents(id));

// 初始化面板拖拽排序
initPanelSorter();

// 初始化模板库
initTemplates();

// 初始化工作流
initWorkflow();

// 初始化插件系统
initPlugins();
renderPluginList();

// 设置懒加载观察器
setTimeout(() => setupLazyLoadObserver(), 2000);

// 加载应用设置
(async () => {
  const settings = await getAppSettings();
  if (settings) {
    if (settings.sleep) {
      sleepConfig.enabled = settings.sleep.enabled !== false;
      sleepConfig.idleMinutes = settings.sleep.idleMinutes || 5;
    }
    if (settings.locale && settings.locale !== currentLocale) {
      setLocale(settings.locale);
    }
  }
  refreshI18nUI();
})();

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

// 初始状态：默认 4 栏
setLayout(4);
autoBroadcastCheck();
setStatus(i18n('status.ready'));
