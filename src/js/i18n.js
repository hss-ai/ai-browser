// ─── I18N (FR-E06) ───
// Key-value localization with zh-CN fallback

const I18N_DATA = {
  'zh-CN': {
    'titlebar.logo': 'AI Browser',
    'titlebar.subtitle': '多模型对比',
    'layout.2col': '2栏',
    'layout.3col': '3栏',
    'layout.4col': '4栏',
    'layout.5col': '5栏',
    'toolbar.broadcast.on': '广播开',
    'toolbar.broadcast.off': '广播关',
    'toolbar.broadcast.placeholder': '输入问题，广播到所有主面板…（副本不包含）',
    'toolbar.broadcast.disabled': '广播已关闭 — 请直接在各面板输入',
    'toolbar.send': '发送给全部',
    'toolbar.proxy': '代理',
    'toolbar.fingerprint': '指纹',
    'toast.broadcast.on': '📡 广播模式开启（仅主面板）',
    'toast.broadcast.off': '广播模式已关闭',
    'toast.broadcast.auto': '已自动开启广播模式',
    'toast.send.ok': '✓ 已发送到 {count} 个主面板',
    'toast.clone.added': '➕ 已新增 {name} #{idx}（独立会话）',
    'toast.shortcuts.reset': '快捷键已恢复默认',
    'toast.history.empty': '暂无历史记录',
    'toast.compare.empty': '请先选择两个模型的回答进行对比',
    'toast.template.saved': '模板已保存',
    'toast.template.deleted': '模板已删除',
    'toast.workflow.running': '工作流运行中…',
    'toast.workflow.done': '工作流执行完毕',
    'toast.workflow.failed': '工作流节点失败: {error}',
    'toast.export.ok': '导出成功',
    'toast.export.failed': '导出失败: {error}',
    'toast.import.ok': '导入成功 ({count} 条记录)',
    'toast.import.failed': '导入失败: {error}',
    'toast.privacy.cleared': '隐私数据已清除',
    'toast.crashed': '⚠ {name} 崩溃，点击重载',
    'toast.crashed.recovered': '✓ {name} 已恢复',
    'settings.title': '设置',
    'settings.theme': '主题',
    'settings.theme.dark': '暗色主题',
    'settings.theme.light': '亮色主题',
    'settings.theme.system': '跟随系统',
    'settings.theme.hc': '高对比度',
    'settings.motion': '动效',
    'settings.motion.reduce': '减少动效',
    'settings.about': '关于',
    'settings.about.version': 'AI Browser v2.0',
    'settings.about.desc': '多模型对比工作台',
    'settings.close': '关闭',
    'settings.shortcuts': '快捷键配置',
    'settings.shortcuts.press': '按下新快捷键…',
    'settings.shortcuts.conflict': '冲突',
    'settings.shortcuts.reset': '恢复默认',
    'settings.language': '语言',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.sleep': '面板休眠',
    'settings.sleep.enabled': '启用面板休眠',
    'settings.sleep.idle': '空闲分钟数',
    'settings.backup': '备份',
    'settings.backup.create': '创建备份',
    'settings.backup.restore': '恢复备份',
    'settings.privacy': '隐私清理',
    'settings.privacy.clear': '清除数据',
    'settings.models': '模型管理',
    'settings.models.add': '添加模型',
    'cmdpalette.placeholder': '输入命令搜索…',
    'cmdpalette.category.layout': '布局',
    'cmdpalette.category.panels': '面板',
    'cmdpalette.category.clones': '副本',
    'cmdpalette.category.broadcast': '广播',
    'cmdpalette.category.theme': '主题',
    'cmdpalette.category.settings': '设置',
    'cmdpalette.category.tools': '工具',
    'cmdpalette.category.history': '历史',
    'cmdpalette.category.compare': '对比',
    'cmdpalette.category.templates': '模板',
    'cmdpalette.category.workflow': '工作流',
    'history.title': '会话历史',
    'history.search': '搜索历史…',
    'history.filter.all': '全部',
    'history.filter.favorite': '收藏',
    'history.empty': '暂无历史记录',
    'compare.title': '对比视图',
    'compare.unified': '统一视图',
    'compare.summarize': '一键汇总',
    'compare.best': '最佳回复',
    'compare.rate': '评分',
    'templates.title': '模板库',
    'templates.builtin': '内置模板',
    'templates.custom': '自定义模板',
    'templates.create': '新建模板',
    'templates.variables': '填写变量',
    'templates.use': '使用',
    'workflow.title': '工作流',
    'workflow.run': '运行',
    'workflow.stop': '停止',
    'workflow.addNode': '添加节点',
    'plugins.title': '插件',
    'export.markdown': '导出 Markdown',
    'export.json': '导出 JSON',
    'export.import': '导入',
    'status.ready': '就绪 — 开启广播模式，一次提问同步到所有 AI',
    'status.broadcasting': '已广播「{q}」到 {count} 个 AI',
  },
  'en-US': {
    'titlebar.logo': 'AI Browser',
    'titlebar.subtitle': 'Multi-Model Compare',
    'layout.2col': '2 Col',
    'layout.3col': '3 Col',
    'layout.4col': '4 Col',
    'layout.5col': '5 Col',
    'toolbar.broadcast.on': 'Broadcast ON',
    'toolbar.broadcast.off': 'Broadcast OFF',
    'toolbar.broadcast.placeholder': 'Enter question, broadcast to all primary panels… (clones excluded)',
    'toolbar.broadcast.disabled': 'Broadcast off — type directly in each panel',
    'toolbar.send': 'Send All',
    'toolbar.proxy': 'Proxy',
    'toolbar.fingerprint': 'Fingerprint',
    'toast.broadcast.on': '📡 Broadcast mode ON (primary panels only)',
    'toast.broadcast.off': 'Broadcast mode OFF',
    'toast.broadcast.auto': 'Broadcast auto-enabled',
    'toast.send.ok': '✓ Sent to {count} panels',
    'toast.clone.added': '➕ {name} #{idx} added (independent session)',
    'toast.shortcuts.reset': 'Shortcuts restored to defaults',
    'toast.history.empty': 'No history yet',
    'toast.compare.empty': 'Select two model responses to compare',
    'toast.template.saved': 'Template saved',
    'toast.template.deleted': 'Template deleted',
    'toast.workflow.running': 'Workflow running…',
    'toast.workflow.done': 'Workflow completed',
    'toast.workflow.failed': 'Workflow node failed: {error}',
    'toast.export.ok': 'Export successful',
    'toast.export.failed': 'Export failed: {error}',
    'toast.import.ok': 'Imported successfully ({count} records)',
    'toast.import.failed': 'Import failed: {error}',
    'toast.privacy.cleared': 'Privacy data cleared',
    'toast.crashed': '⚠ {name} crashed, click to reload',
    'toast.crashed.recovered': '✓ {name} recovered',
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',
    'settings.theme.system': 'System',
    'settings.theme.hc': 'High Contrast',
    'settings.motion': 'Motion',
    'settings.motion.reduce': 'Reduce motion',
    'settings.about': 'About',
    'settings.about.version': 'AI Browser v2.0',
    'settings.about.desc': 'Multi-Model Compare Workbench',
    'settings.close': 'Close',
    'settings.shortcuts': 'Shortcuts',
    'settings.shortcuts.press': 'Press new shortcut…',
    'settings.shortcuts.conflict': 'Conflict',
    'settings.shortcuts.reset': 'Reset defaults',
    'settings.language': 'Language',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.sleep': 'Panel Sleep',
    'settings.sleep.enabled': 'Enable panel sleep',
    'settings.sleep.idle': 'Idle minutes',
    'settings.backup': 'Backup',
    'settings.backup.create': 'Create backup',
    'settings.backup.restore': 'Restore backup',
    'settings.privacy': 'Privacy',
    'settings.privacy.clear': 'Clear data',
    'settings.models': 'Models',
    'settings.models.add': 'Add model',
    'cmdpalette.placeholder': 'Type a command…',
    'cmdpalette.category.layout': 'Layout',
    'cmdpalette.category.panels': 'Panels',
    'cmdpalette.category.clones': 'Clones',
    'cmdpalette.category.broadcast': 'Broadcast',
    'cmdpalette.category.theme': 'Theme',
    'cmdpalette.category.settings': 'Settings',
    'cmdpalette.category.tools': 'Tools',
    'cmdpalette.category.history': 'History',
    'cmdpalette.category.compare': 'Compare',
    'cmdpalette.category.templates': 'Templates',
    'cmdpalette.category.workflow': 'Workflow',
    'history.title': 'History',
    'history.search': 'Search history…',
    'history.filter.all': 'All',
    'history.filter.favorite': 'Favorite',
    'history.empty': 'No history',
    'compare.title': 'Compare',
    'compare.unified': 'Unified View',
    'compare.summarize': 'Summarize',
    'compare.best': 'Best Answer',
    'compare.rate': 'Rate',
    'templates.title': 'Templates',
    'templates.builtin': 'Built-in',
    'templates.custom': 'Custom',
    'templates.create': 'New Template',
    'templates.variables': 'Fill Variables',
    'templates.use': 'Use',
    'workflow.title': 'Workflow',
    'workflow.run': 'Run',
    'workflow.stop': 'Stop',
    'workflow.addNode': 'Add Node',
    'plugins.title': 'Plugins',
    'export.markdown': 'Export Markdown',
    'export.json': 'Export JSON',
    'export.import': 'Import',
    'status.ready': 'Ready — enable broadcast to sync questions to all AIs',
    'status.broadcasting': 'Broadcast 「{q}」 to {count} AIs',
  }
};

let currentLocale = 'zh-CN';

function i18n(key, replacements) {
  const data = I18N_DATA[currentLocale] || I18N_DATA['zh-CN'];
  let text = data[key];
  if (text === undefined) text = I18N_DATA['zh-CN'][key];
  if (text === undefined) return key;
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }
  return text;
}

function setLocale(locale) {
  currentLocale = locale;
  try { localStorage.setItem('ai-browser-locale', locale); } catch (e) { /* ignore */ }
  // Refresh UI text
  refreshI18nUI();
}

function getLocale() {
  return currentLocale;
}

function initLocale() {
  try {
    const saved = localStorage.getItem('ai-browser-locale');
    if (saved && I18N_DATA[saved]) currentLocale = saved;
  } catch (e) { /* ignore */ }
}

// Called after DOM is ready to update all text
function refreshI18nUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = i18n(key);
    if (text) el.textContent = text;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const text = i18n(key);
    if (text) el.placeholder = text;
  });
}
