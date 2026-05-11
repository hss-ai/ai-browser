---
# Outcome 2 — 事后登记（Retroactive Registration）
# Review Status: DRAFT（补登记，待人工复核）
# Created: 2026-05-11
# 说明：本 outcome 为方案 2「事后补登记」产物。
#      代码实现已先行完成，此文档作为验收清单回补。
#      覆盖：广播点击修复、代理配置、本地时间时钟。
---

# Outcome 2: 广播发送自动提交 + 代理配置 + 本地时间

---

## Field 1: Persona

**小何** — AI 重度对比使用者。
使用 AI-Browser 的广播功能向多个 AI 主面板同步提问。此前广播仅将文字填入输入框，未自动触发发送按钮，小何需要逐个面板手动点击发送。此外小何需要通过代理访问部分 AI 网站，且希望界面上能看到当前本地时间。

核心约束：
- 广播发送后**必须自动触发各面板的提交按钮**，无需手动操作
- 代理配置必须**全局生效**于所有 webview
- 时间显示必须为**本地时间**（UTC+8），不能显示 UTC

---

## Field 2: Trigger

小何开启广播模式，在顶部输入框写了一个问题，按 `Ctrl+Enter` 发送。他期望所有主面板不仅收到文字，而且**自动点击发送按钮提交问题**。此前文字虽然注入了输入框，但提交按钮没有被触发，小何需要逐个面板去手动点击。

同时小何在某些网络环境下需要通过 HTTP/SOCKS5 代理访问 AI 网站，他想在 AI-Browser 工具栏找到一个代理设置入口，配置后所有面板走代理。

最后小何注意到打包后文件的时间戳显示的是 UTC 时间（比北京时间慢 8 小时），他需要状态栏显示正确的本地时间。

---

## Field 3: Walkthrough

**广播自动提交：**
小何开启广播模式，输入「比较 GPT-5 和 Claude Opus 的写作能力」，按 `Ctrl+Enter`。Toast 提示「✓ 已发送到 5 个主面板」。小何观察所有主面板——ChatGPT、Claude、Gemini、DeepSeek、智谱——不仅输入框填入了文字，而且**正在生成回复**（说明发送按钮已被自动点击）。如果某个 AI 站点的 DOM 更新导致发送按钮选择器失效，程序会回退到模拟 Enter 按键事件，同时 Toast 提示「⚠ xxx 注入失败，请手动粘贴」。

**代理配置：**
小何点击工具栏的「代理」按钮，弹出代理设置窗口。勾选「启用代理」，选择 SOCKS5 类型，输入 `127.0.0.1` 和 `1080`，点击「保存并应用」。Toast 提示「🔌 代理已启用: 127.0.0.1:1080」。「代理」按钮变为高亮状态。小何刷新面板，确认所有 webview 流量经过代理。关闭应用后重新打开，代理配置从 localStorage 自动恢复并重新应用。

**本地时间：**
小何看到状态栏右侧显示当前北京时间 `17:10:35`，每秒实时更新。

---

## Field 4: Verification

> 在 `npm start` 启动后的 AI-Browser 窗口中依次执行：

1. 开启广播模式，输入任意问题，`Ctrl+Enter` 发送。确认：
   - 所有主面板输入框被填入文字
   - **所有主面板的发送按钮被自动点击**（开始生成回复）
   - 副本面板**不被**注入
2. 点击工具栏「代理」按钮，弹出代理设置窗口。
3. 勾选「启用代理」，选择 SOCKS5 类型，填入代理服务器地址和端口，点击「保存并应用」。
4. 确认 Toast 提示代理已启用，代理按钮变为高亮。
5. 关闭应用后重新打开，确认代理配置自动恢复。
6. 再次打开代理设置，取消勾选「启用代理」，保存。确认 Toast 提示代理已关闭，代理按钮恢复默认样式。
7. 观察状态栏右侧，确认显示当前本地时间（格式 HH:MM:SS），每秒更新。

---

## Field 5: Contracts Exposed

**代理配置契约（ProxyConfig）：**
- `enabled: boolean` — 是否启用代理
- `type: string` — 代理类型：`http | https | socks4 | socks5`
- `host: string` — 代理服务器地址
- `port: string` — 代理端口
- `username: string` — 认证用户名（可选）
- `password: string` — 认证密码（可选）

存储于 `localStorage['proxy-config']`，通过 IPC `set-proxy` / `clear-proxy` 与主进程通信。

**广播注入契约（inject 升级）：**
- 点击逻辑从 `btn.click()` 升级为 `MouseEvent` + `PointerEvent` 分发，确保穿透 React/Vue 合成事件系统
- 新增 Enter 按键回退：若按钮选择器失效，自动模拟键盘 Enter 事件
- 等待时间从 400ms 延长至 500ms

**本地时间契约：**
- 状态栏 `#status-clock` 显示 `new Date()` 本地时间，每秒通过 `setInterval` 刷新

---

## Field 6: Dependencies

- **Outcome 1**（Phase B）— 依赖其 `AI_TYPES` 注册表和广播框架
- **Electron IPC** — 依赖 `ipcMain.handle` + `ipcRenderer.invoke` 通信
- **session.defaultSession.setProxy()** — Electron 内置 API，无需额外依赖

---

## 实现参考（补登记专用）

- 代码变更文件：
  - [`src/index.html`](../../src/index.html) — 广播注入升级、代理 UI、时钟
  - [`src/main.js`](../../src/main.js) — 代理 IPC 处理
- 主要改动区块：
  - `AI_TYPES.*.inject` — 5 个 AI 的注入函数全部升级点击逻辑（MouseEvent/PointerEvent + Enter 回退）
  - `#proxy-btn` + `#proxy-modal-overlay` — 代理设置按钮及弹窗 UI
  - `proxyConfig` / `loadProxyConfig` / `saveProxy` / `applyProxy` — 代理管理逻辑
  - `ipcMain.handle('set-proxy')` / `ipcMain.handle('clear-proxy')` — 主进程代理处理
  - `updateClock` — 本地时间时钟（每秒刷新）

---

*此文件为方案 2 的事后补登记。下次变更请严格走 `/trellis → *propose → *apply → *archive`。*
