---
# Outcome 1 — 事后登记（Retroactive Registration）
# Review Status: DRAFT（补登记，待人工复核）
# Created: 2026-05-11
# 说明：本 outcome 为方案 2「事后补登记」产物。
#      代码实现已先行完成（见 src/index.html），此文档作为验收清单回补。
---

# Outcome 1: 小何在同一屏幕对比多个 AI，并用多个账号最大化使用量

---

## Field 1: Persona

**小何** — AI 重度使用者。
同时订阅 ChatGPT / Claude / Gemini / DeepSeek / 智谱清言，其中部分服务持有多个账号以规避单账号的免费/会员配额。核心约束：
- 一屏看清多个模型的回答，**不愿频繁切换浏览器标签**
- 多账号之间的登录状态**必须互不污染**（cookie / 会话隔离）
- 广播一次写作只希望触达"主账号"，不要把同一问题浪费在副账号上

> 注：本项目 `docs/personas/` 尚未正式立档，此处为最小可用描述；正式立档可用 `/trellis → *persona` 补齐。

---

## Field 2: Trigger

小何正在做一次模型对比调研。他的 ChatGPT Plus 今天已经逼近 GPT-5 次数上限，手上还有另外 2 个 ChatGPT 账号可以接力使用；同时他想把国内的**智谱清言**也纳入对比范围。他打开 AI-Browser，期望：

1. 屏幕上能看到 5 个 AI（新增智谱）
2. 能一键在同一屏并排打开 3 个**相互隔离**的 ChatGPT（对应 3 个账号）
3. 广播问题时只发给每类 AI 的"主账号"一次，副账号留给他手动独立使用

---

## Field 3: Walkthrough

小何启动 AI-Browser。顶部标题栏出现 5 个状态标签：**ChatGPT / Claude / Gemini / DeepSeek / 智谱**，默认 4 栏布局（智谱隐藏）。他点击「5 栏」按钮，第 5 个面板滑出，加载 `chatglm.cn`，登录页出现。他登录自己的智谱账号，后续刷新仍保持登录。

小何在 ChatGPT 面板右上角看到 `＋` 按钮，点击它。浏览器容器末尾出现一个新面板「**ChatGPT #2**」——标题带红色 `#2` 徽标，`×` 关闭按钮，URL 指向 `chatgpt.com`，但显示的是**未登录**的全新界面。小何在 #2 里登录第二个账号。他再点一次 `＋`，出现「ChatGPT #3」，登录第三个账号。三个 ChatGPT 面板并排存在，互相之间 cookie 隔离，刷新后各自保留各自的登录。

小何回到顶部输入框，开启「广播开」，输入问题，按 `Ctrl+Enter`。Toast 提示「✓ 已发送到 5 个主面板」——广播只进入 ChatGPT（主）、Claude、Gemini、DeepSeek、智谱；**ChatGPT #2 与 #3 不被写入**，保留给小何手动独立使用。

小何在 ChatGPT #2 里手动提了一个与广播无关的私人问题，不影响其他面板。任务结束后，小何点击 ChatGPT #2 的 `×`，副本立即移除，主面板与其他副本不受影响。

**失败路径：** 若智谱站点 DOM 更新导致发送按钮选择器失效，广播 Toast 会提示「⚠ zhipu 注入失败，请手动粘贴」，问题被复制到剪贴板作为兜底。

---

## Field 4: Verification

> 在 `npm start` 启动后的 AI-Browser 窗口中依次执行：

1. 确认标题栏看到 5 个状态标签：ChatGPT、Claude、Gemini、DeepSeek、**智谱**。
2. 点击「5 栏」布局按钮，确认第 5 个面板出现并加载 `chatglm.cn`。登录智谱账号，刷新应用，确认登录保留。
3. 在 ChatGPT 面板点击 `＋`，确认出现名为 **ChatGPT #2** 的面板，URL 指向 `chatgpt.com`，显示为**未登录**状态（证明 session 隔离）。
4. 在 #2 登录第二个 ChatGPT 账号；回到主 ChatGPT 面板，确认主面板登录状态**未被覆盖**。
5. 再次点击 `＋` 生成 **ChatGPT #3**，验证 #3 也为未登录初始态（session 独立于 #1 与 #2）。
6. 开启「广播」→ 在顶部输入任意问题 → `Ctrl+Enter`。确认：
   - Toast 提示「✓ 已发送到 5 个主面板」
   - 5 个**主**面板均收到并自动提交
   - ChatGPT **#2 与 #3 不会**被注入
7. 点击 ChatGPT #2 标题栏 `×`，确认该副本被移除，其他面板保持原状与登录。
8. 点击顶栏右侧全局 `＋` 菜单，选择「新增 智谱 副本」，验证可对任意 AI 类型生成副本。
9. 关闭应用后重新打开，确认：
   - 主面板登录状态保留（使用默认 `persist:aisession` 分区）
   - 副本面板默认不持久（每次运行新生成的 `persist:clone-{type}-{N}` 是当次会话的隔离分区）

---

## Field 5: Contracts Exposed

**面板身份契约（Panel Identity）：**
- `panelId` — 面板唯一标识。主面板 = 类型名（如 `chatgpt`），副本 = `{type}-{N}`。
- `type` — AI 类型枚举：`chatgpt | claude | gemini | deepseek | zhipu`。
- `primary` — 是否为主面板（`1` / `0`）。
- `partition` — 会话分区。主面板继承默认 `persist:aisession`；副本为 `persist:clone-{panelId}`。

被以下消费：
- **广播子系统** — 通过 `primary === '1'` 过滤广播目标。
- **布局子系统** — 通过 `type` 控制 2/3/4/5 栏的显示集合。
- **克隆子系统** — 通过 `cloneCounter[type]` 递增生成 `panelId`。

**AI 类型注册表契约（`AI_TYPES`）：**
- 每一类 AI 提供：`name`, `short`, `icon`, `url`, `host`, `overlayIcon`, `inject(q)`。
- `inject(q)` 返回 IIFE 字符串，用于 `webview.executeJavaScript` 注入问题并触发发送。

被以下消费：
- **克隆子系统** — 创建副本 webview 时需要 `url` / `host` / `icon` / `overlayIcon` / `name`。
- **广播子系统** — 需要 `inject(q)` 模板。
- **新增副本菜单** — 需要 `name` / `icon` 渲染条目。

---

## Field 6: Dependencies

- **Electron + webview 基础壳** — 已有（`src/main.js` BrowserWindow + `persist:aisession`）。
- **Header CSP/X-Frame-Options 剥离** — 已有，允许 `chatglm.cn` 在 webview 内加载。
- **默认持久化 userData 路径** — 已有（`~/Documents/AI-Browser-Cache`）。

本 outcome 不依赖其他 outcome。Phase A（Electron 壳 + Session 持久化）已隐式存在，`.odd/state.json` 当前仍为 `planning`，应在复核时补齐 `planApproved` 与 Phase A 的验证记录。

---

## 实现参考（补登记专用）

- 代码变更文件：[src/index.html](../../src/index.html)
- 主要改动区块：
  - CSS：新增 `panel[data-ai="zhipu"]` 主题、`.panel-badge`、`#add-menu`
  - HTML：新增第 5 个面板 `#panel-zhipu`、5 栏布局按钮、智谱状态标签、全局 `＋` 按钮与 `#add-menu` 容器、为所有面板头增补 `＋` 克隆按钮
  - JS：`AI_TYPES` 注册表（含 `zhipu.inject`）、`clonePanel` / `closeClone` / `toggleAddMenu` / `bindWebviewEvents`、`sendQuery` 过滤 `data-primary="1"`、`setLayout` 支持 5 栏
- 会话隔离策略：主面板无 `partition` 属性继承默认，副本 `partition="persist:clone-{panelId}"`

---

*此文件为方案 2 的事后补登记。下次变更请严格走 `/trellis → *propose → *apply → *archive`。*
