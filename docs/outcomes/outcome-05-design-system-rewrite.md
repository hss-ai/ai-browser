# Outcome 5 — 设计系统重塑：令牌+多主题+命令面板+快捷键+拖拽排序+骨架屏

> 状态：built-pending-verification
> 阶段：Phase E — M1 基础重塑（基于 Claude Opus 4.7 + GLM5.1 需求合并）
> 注册方式：plan-E
> 注册时间：2026-05-13
> 基线版本：v1.4.1 → v2.0.0-dev

---

## Field 1 — 目标用户与使用场景

**用户**：小何（AI 重度对比使用者）

**场景**：
- 在亮色/暗色环境下均可舒适使用，白天自动亮色、夜间自动暗色
- 通过 Ctrl+K 快速执行任何操作，无需鼠标逐一点击
- 通过键盘快捷键高效控制布局和广播
- 拖拽面板标题栏自定义排列顺序，适配个人使用习惯
- Webview 加载期间看到骨架屏而非空白，感知加载进度
- 标题栏/状态栏具备毛玻璃质感，视觉上更现代化
- 图标按钮有屏幕阅读器标签，键盘 Tab 可达，焦点环清晰
- 窗口缩到很窄时自动适应，不丢失功能
- 字体统一为 Inter（界面）+ JetBrains Mono（代码/等宽），本地打包无需外网

---

## Field 2 — 验收标准

### 设计令牌 (FR-U01)
- [ ] 所有色值、圆角、阴影、间距、动效时长集中于 `tokens.css`
- [ ] `data-theme` 属性驱动主题切换，不依赖内联样式
- [ ] 现有界面视觉回归零变化（暗色主题下外观与原版一致）

### 多主题 (FR-U02)
- [ ] 标题栏提供主题切换按钮，四档：Dark / Light / System / High Contrast
- [ ] System 档实时响应 `prefers-color-scheme` 变化（无页面抖动）
- [ ] 设置 Modal 中可单选切换主题
- [ ] Webview 内 AI 网站主题不受干扰

### 玻璃拟态 (FR-U03)
- [ ] 标题栏 `backdrop-filter: blur(16px)`，状态栏 `backdrop-filter: blur(12px)`
- [ ] 禁用时降级为实色背景

### 骨架屏 (FR-U04)
- [ ] Webview `did-start-loading` → 骨架屏显示
- [ ] Webview `did-stop-loading` → 骨架屏隐藏
- [ ] `prefers-reduced-motion` 时骨架屏动画自动停止
- [ ] 设置中可手动关闭动效

### 响应式断点 (FR-U05)
- [ ] ≤960px 自动降为 2 栏
- [ ] ≤640px 降为单栏 + 横向滑动（scroll-snap）
- [ ] 状态栏 pill 溢出时横向滚动

### 可访问性 (FR-U06)
- [ ] 所有 icon-only 按钮补 `aria-label`
- [ ] `:focus-visible` 全局焦点环（2px accent 色）
- [ ] 高对比度主题提供（黑底白字黄强调色）

### 字体统一 (FR-U07)
- [ ] Inter 字体用于 UI 文本，JetBrains Mono 用于等宽文本
- [ ] 字体文件通过 `@fontsource` 打包，无外网依赖
- [ ] 中文 fallback 为系统字体

### 命令面板 (FR-E09)
- [ ] Ctrl/Cmd+K 呼出命令面板
- [ ] 覆盖 ≥ 30 个操作（布局/面板/副本/广播/主题/设置/刷新/聚焦）
- [ ] Fuse.js 模糊搜索，延迟 < 50ms
- [ ] 键盘导航（↑↓Enter）和鼠标点击均可选择

### 快捷键系统
- [ ] 默认快捷键：Ctrl+1~5 布局、Ctrl+Enter 发送、Ctrl+L 清空、Ctrl+, 设置、Ctrl+Shift+F 搜索、Ctrl+B 广播
- [ ] 输入框中仅响应特殊快捷键（Enter 发送 / Ctrl+Enter 发送）
- [ ] 命令面板打开时快捷键不冲突

### 面板拖拽排序
- [ ] 拖拽面板标题栏可重新排列顺序
- [ ] 拖拽中有视觉反馈（opacity 0.5 + scale 0.95）
- [ ] 排序结果持久化到 localStorage
- [ ] 新增副本自动绑定拖拽事件

---

## Field 3 — 实现文件

| 文件 | 变更内容 |
|------|---------|
| `src/css/tokens.css` | **新增** — 完整设计令牌系统：4 主题（dark/light/hc/system）via `data-theme`；@font-face Inter(400/500/600/700)+JetBrains Mono(400/500)；prefers-reduced-motion；:focus-visible |
| `src/css/main.css` | **重构** — 移除 Google Fonts @import；移除硬编码色值；全部改用 `var(--color-*)`/`var(--space-*)`/`var(--motion-*)`；新增玻璃拟态（backdrop-filter）；骨架屏 CSS（.panel-skeleton/.skel-block/@keyframes skel-pulse）；命令面板 CSS；设置 Modal CSS；面板拖拽效果；响应式断点 CSS（960px/640px）；.titlebar-icon-btn |
| `src/js/theme.js` | **新增** — 主题引擎：setTheme/getTheme/cycleTheme/toggleSettingsModal/closeSettingsModal/toggleReducedMotion；system 档 matchMedia 监听 |
| `src/js/command-palette.js` | **新增** — Ctrl+K 命令面板：30+ 命令注册（布局/面板/副本/广播/主题/设置/刷新/聚焦）；Fuse.js 模糊搜索（标题 weight=2, 关键词 weight=1）；分组渲染；键盘导航 |
| `src/js/shortcuts.js` | **新增** — 全局快捷键系统：DEFAULT_SHORTCUTS（10 个）；accelerator 解析（Ctrl+Shift+K）；冲突检测；localStorage 持久化；输入框焦点感知 |
| `src/js/panel-sorter.js` | **新增** — HTML5 拖拽排序：dragstart/dragover/drop on .panel-header；MutationObserver 监听副本新增；localStorage 持久化排序；applyPanelOrder/updatePanelOrder/movePanelToPosition |
| `src/js/webview.js` | **修改** — did-start-loading 显示骨架屏；did-stop-loading 隐藏骨架屏 |
| `src/js/panels.js` | **修改** — 副本模板新增 skeleton screen HTML；responsive layout 逻辑（checkResponsiveLayout）；副本按钮 aria-label |
| `src/js/app.js` | **修改** — 新增 initPanelSorter() 调用 |
| `src/js/broadcast.js` | **修改** — 移除 handleKey()（键盘处理移至 shortcuts.js） |
| `src/index.html` | **重构** — 新增 tokens.css link + anti-FOUC 内联脚本；标题栏新增 theme/settings 按钮；所有 5 个面板新增 skeleton screen HTML；新增 settings modal HTML（主题 radio/动效 checkbox/关于）；新增所有 JS 脚本标签（theme/command-palette/shortcuts/panel-sorter）；所有 icon-only 按钮补 aria-label；移除 query-input onkeydown；版本号 v2.0.0-dev |
| `package.json` | **修改** — 版本 1.4.1 → 2.0.0-dev；新增依赖 fuse.js/@fontsource/inter/@fontsource/jetbrains-mono |

---

## Field 4 — 验证步骤

### 4.1 主题切换验证
1. 点击标题栏太阳/月亮图标，循环切换 dark→light→system→hc
2. 验证每次切换界面立即响应，无闪烁
3. 在 light 主题下确认所有文本可读，对比度足够
4. 在 hc 主题下确认边框清晰，色彩高对比
5. 打开设置 Modal，确认 radio 正确反映当前主题
6. 选择"跟随系统"，修改系统主题（Windows 设置→个性化→颜色），确认应用跟随

### 4.2 命令面板验证
1. 按 Ctrl+K 呼出命令面板
2. 输入"布局"确认过滤出布局相关命令
3. 输入"副本"确认过滤出克隆命令
4. 用 ↑↓ 键导航，Enter 执行
5. 点击命令项确认可执行
6. 按 ESC 关闭面板
7. 测试输入框中按 Ctrl+K 是否正常

### 4.3 快捷键验证
1. Ctrl+1~5：切换布局栏数
2. Ctrl+Enter：发送广播
3. Enter（在输入框中）：发送广播
4. Ctrl+L：清空输入框
5. Ctrl+,：打开设置
6. Ctrl+B：切换广播模式
7. 在命令面板打开时，确认快捷键不冲突

### 4.4 面板拖拽排序验证
1. 拖拽 ChatGPT 面板标题栏，移动到 DeepSeek 后面
2. 确认面板 DOM 顺序改变，视觉过渡流畅
3. 刷新页面（或重启），确认排序持久化
4. 新增一个副本（如 ChatGPT #2），拖拽副本确认可排序

### 4.5 骨架屏验证
1. 刷新某个面板（如 ChatGPT），确认加载期间显示骨架屏
2. 确认加载完成后骨架屏消失，显示 webview 内容
3. 新增一个副本，确认新面板在加载期间也显示骨架屏

### 4.6 响应式断点验证
1. 缩小窗口至 ~900px 宽度，确认自动降为 2 栏布局
2. 继续缩小至 ~600px，确认降为单栏 + 横向滑动
3. 恢复窗口宽度，确认恢复原布局

### 4.7 可访问性验证
1. Tab 键遍历所有可交互元素，确认焦点环清晰可见
2. 检查所有图标按钮有无 aria-label（通过 DevTools 审查元素）

### 4.8 字体验证
1. 确认界面文本使用 Inter 字体渲染
2. 确认输入框/代码区域使用 JetBrains Mono 等宽字体
3. 断开外网，确认字体依然正常显示（本地打包）

---

## Field 5 — 冲突解决记录

> 按 Claude Opus 4.7 优先原则处理以下冲突：

| 冲突项 | Claude 方案 | GLM 方案 | 采用 |
|--------|------------|----------|------|
| 字体选择 | Inter + JetBrains Mono | Syne + DM Mono | Claude |
| 主题驱动方式 | CSS data-theme 属性 | JS class 切换 | Claude |
| 主题命名/数量 | dark/light/system/hc（4 档） | dark-deep/light-dawn/cyber-neon（3 套） | Claude（4 档，但吸取 GLM 高对比度=类似 cyber-neon 理念） |
| 存储方案 | JSON + safeStorage/AES-GCM | SQLite (better-sqlite3) | Claude（待 M1 后续实现） |
| @fontsource 引入 | 是（本地打包） | 未提及 | Claude |
