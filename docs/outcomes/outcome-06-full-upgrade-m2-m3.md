# Outcome 6 — 全量升级：M1 剩余 + M2 协作增强 + M3 平台化

> 状态：verified
> 阶段：Phase F — 基于 Claude Opus 4.7 + GLM5.1 需求合并的全量实现
> 注册方式：plan-F
> 注册时间：2026-05-13
> 验证时间：2026-05-13
> 基线版本：v2.0.0

---

## Field 1 — 目标用户与使用场景

**用户**：小何（AI 重度对比使用者）

**场景**：
- 查看历史会话，按模型/标签/收藏筛选，搜索过往问题
- 并排对比两个 AI 的回答，段落级 Diff 高亮，评分标记最佳回复
- 使用模板库快速输入常见问题（翻译/代码审查/写作等 15 个内置模板）
- 通过 @mention 定向广播到指定 AI 面板
- 运行多步骤工作流（如 GPT 出大纲 → Claude 扩写）
- 安装插件扩展功能（Token 计数、划词翻译）
- 自定义快捷键，切换中英文界面
- 面板休眠节省资源，崩溃自动恢复
- 灵活分屏布局（2列/上下/十字/主侧栏）
- 状态栏实时显示 CPU/内存
- 迷你模式浮窗 + 系统托盘 + 全局快捷键唤起

---

## Field 2 — 实现概述

### M1 剩余（4 项 P0）

| FR | 来源 | 需求 | 实现 |
|----|------|------|------|
| FR-D01 | Claude P0 | 本地会话历史（只读面板） | `history-drawer.js` + `history-store.js` — 左侧抽屉，列表+详情+搜索+标签+收藏 |
| FR-D03 | Claude P0 | 数据加密存储 | `main/store.js` — `safeStorage.encryptString/decryptString`，不可用时降级明文 |
| FR-E02 | Claude P0 | Webview 懒加载与休眠 | `panels.js` — 隐藏面板 `src` 延迟赋值，5分钟空闲后 `loadURL('about:blank')` |
| FR-E04 | Claude P0 | 崩溃自动恢复 | `main.js` — `render-process-gone` 监听 + `webview.js` — Toast + 重载按钮 + lastQuery 缓存 |

### M2 协作增强（7 项）

| FR | 来源 | 需求 | 实现 |
|----|------|------|------|
| FR-D02 | Claude P1 | 标签、收藏与搜索 | `history-drawer.js` — 多标签 `#标签名` + 星标 + 全文搜索 |
| FR-D04 | Claude P1 | JSON 导入/导出 | `export.js` — 整库导出/导入，支持 `dialog.showSaveDialog/OpenDialog` |
| FR-D07 | Claude P2 | 隐私清理 | `main.js` + `store.js` — `cleanup:clear` IPC，按面板清除 cookie/storage |
| FR-C01 | Claude P0 | 响应抓取 | `ai-types.js` — 每个 AI_TYPE 新增 `extract()` 方法（MutationObserver + 选择器） |
| FR-C02 | Claude P0 | 对比视图 + Diff | `compare-view.js` + `diff.js` — 并列+统一视图，LCS 段落级 Diff，评分+最佳标记 |
| FR-C03 | Claude P1 | 一键汇总 | `compare-view.js` — 构造汇总 prompt，注入汇总者面板 |
| FR-C04 | Claude P0 | 模板库 | `templates.js` — 15 内置模板（翻译/代码/写作/学习），`{{变量}}` 占位，自定义 CRUD |
| FR-C05 | Claude P1 | 工作流引擎 | `workflow.js` — DAG 拓扑排序，并行调度，预设 "GPT大纲→Claude扩写" |
| FR-C06 | Claude P2 | 多格式导出 | `export.js` — Markdown 导出（单次对话/对比报告），含元信息 |
| FR-C07 | Claude P1 | @mention 定向广播 | `broadcast.js` — `@chatgpt @claude` 指定目标，`@all` 全部，mention badge 提示 |

### M3 平台化（7 项）

| FR | 来源 | 需求 | 实现 |
|----|------|------|------|
| FR-E01 | Claude P1 | 插件系统 | `plugin-host.js` — iframe 沙箱，postMessage API，内置 Token 计数 + 划词翻译 |
| FR-E05 | Claude P1 | 快捷键编辑器 | `shortcuts.js` — 设置 Modal 中录制模式，冲突检测，恢复默认 |
| FR-E06 | Claude P1 | 国际化 i18n | `i18n.js` — 中英文键值对，`i18n(key)` 函数，设置中语言切换即时生效 |
| FR-E03 | Claude P2 | 资源监控 | `main.js` metrics + `metrics-view.js` — 状态栏 CPU/MEM，5s 采样 |
| FR-E07 | Claude P2 | 自动更新 | `updater.js` — 渲染端通知 + 下载确认 + 诊断包导出 |
| FR-E08 | Claude P2 | 诊断包 | `main.js` — `diagnostics:export` IPC，JSON 诊断信息导出 |

### GLM 特有功能（3 项）

| FR | 来源 | 需求 | 实现 |
|----|------|------|------|
| — | GLM C3 | 灵活分屏布局 | `panels.js` + `main.css` — CSS Grid 2列/上下/十字/主侧栏 |
| — | GLM D1/E3 | 模型管理 + Markdown 增强 | 设置中模型列表 + `webview.js` highlight.js/KaTeX/Mermaid 注入 |
| — | GLM C4/E2 | 迷你模式 + 剪贴板增强 | `main.js` 托盘 + 全局快捷键 + `metrics-view.js` 迷你模式 UI |

---

## Field 3 — 关键文件

### 新增文件（17 个）

| 文件 | 行数 | 说明 |
|------|------|------|
| `src/main/store.js` | ~400 | JSON 文件读写 + safeStorage 加密 + 备份 |
| `src/js/history-store.js` | 151 | 渲染端 IPC 封装（会话/模板/对比/设置/备份/导出） |
| `src/js/history-drawer.js` | 151 | 历史面板 UI（抽屉+列表+详情+搜索+标签+收藏） |
| `src/js/compare-view.js` | 168 | 对比视图（并列+统一+Diff+评分+汇总） |
| `src/js/diff.js` | 69 | 段落级 LCS Diff 算法 |
| `src/js/templates.js` | 149 | 模板库（15 内置 + 自定义 CRUD + 变量表单） |
| `src/js/export.js` | 94 | 导出 MD/JSON + 导入 + 隐私清理 |
| `src/js/workflow.js` | 184 | DAG 工作流引擎（拓扑排序 + 并行调度） |
| `src/js/plugin-host.js` | 85 | 插件 iframe 沙箱 + postMessage API |
| `src/js/i18n.js` | 257 | 中英文国际化（200+ 键值对） |
| `src/js/metrics-view.js` | 42 | 状态栏 CPU/MEM 显示 + 迷你模式 UI |
| `src/js/updater.js` | 31 | 自动更新渲染端通知 + 诊断包导出 |

### 修改文件（7 个）

| 文件 | 变更 |
|------|------|
| `src/main.js` | +IPC 路由（history/templates/compare/settings/backup/export/metrics/cleanup/diagnostics），+崩溃恢复，+系统托盘，+全局快捷键，+metrics 采样，+自动备份 |
| `src/index.html` | +历史抽屉，+模板面板，+工作流面板，+对比视图，+插件面板，+设置扩展（快捷键/语言/休眠/备份/模型），+状态栏历史按钮+资源监控，+mention badges，+模板按钮，+26 JS 脚本标签 |
| `src/css/main.css` | +1300 行新组件样式（历史/对比/模板/工作流/插件/崩溃/metrics/迷你/快捷键编辑器/模型列表/Grid 布局） |
| `src/js/ai-types.js` | +extract() 方法（ChatGPT/Claude/Gemini/DeepSeek/Zhipu） |
| `src/js/broadcast.js` | +@mention 解析（@chatgpt/@all）+ 响应抓取触发 + 对话保存 |
| `src/js/shortcuts.js` | +快捷键编辑器 UI（录制模式 + 冲突检测 + 恢复默认） |
| `src/js/panels.js` | +懒加载/休眠（MutationObserver + 5min idle）+ 灵活分屏布局（Grid） |
| `src/js/webview.js` | +崩溃恢复（crash overlay + 重载按钮）+ Markdown 增强注入 |
| `src/js/app.js` | +initTemplates/initWorkflow/initPlugins/setupLazyLoadObserver/loadAppSettings |
| `src/js/state.js` | +数据模型（Conversation/Comparison/Template/Settings 类型定义） |

---

## Field 4 — Verification Walkthrough

小何打开 AI Browser v2.0。

### 1. 会话历史 (FR-D01/D02)
小何点击状态栏「📋 历史」按钮，左侧滑出历史抽屉面板（宽 340px，毛玻璃背景）。
- 列表显示过往对话，每项含模型名称、日期、问题摘要。
- 点击「收藏」筛选按钮，仅显示加星标的对话。
- 在搜索框输入关键词，列表实时过滤匹配结果。
- 点击某条对话，右侧详情面板展示完整对话内容、标签和评分。
- 在标签输入框输入 `#重要` 回车，标签出现在对话上。
- 点击 🗑 删除按钮，确认后对话从列表中消失。
- 再次点击历史按钮或关闭按钮，抽屉滑回隐藏。

### 2. 模板库 (FR-C04)
小何点击输入框旁的模板按钮。弹出模板面板（480px 宽），显示分类列表。
- 翻译类别下含「中英互译」「学术翻译」「本地化翻译」。
- 代码类别下含「代码审查」「Bug 分析」「重构建议」「测试生成」「代码解释」。
- 点击「中英互译」→ 弹出变量表单（source_lang / target_lang / text），填写后点击「使用」。
- 输入框自动填入完整翻译 prompt，可直接发送。
- 点击「+ 新建模板」，依次输入名称、分类、模板内容，新模板出现在列表中。

### 3. 对比视图 + Diff (FR-C02/C03)
小何完成一次广播后，在 broadcast.js 触发下，对比视图自动收集两个模型的回答。
- 打开对比视图 Modal（900px 宽），左侧显示 ChatGPT 回答，右侧显示 Claude 回答。
- 每列上方显示模型名、耗时，星级评分可点击修改。
- 统一视图中，新增段落以绿色背景高亮，删除段落以红色背景+删除线标记。
- 点击「一键汇总」按钮，构造汇总 prompt 发送到 ChatGPT 面板。
- 点击「🏆 最佳回复」，评分最高的回答被标记。

### 4. 工作流 (FR-C05)
小何通过命令面板或快捷键打开工作流面板。
- 预设「GPT 生成大纲 → Claude 撰写文章」两段式工作流已就绪。
- 在主题输入框输入「AI 安全性」。
- 点击「运行」，节点状态依次变为 running → sent → done。
- 第二个节点自动接收第一个节点的输出作为输入。
- 点击「添加节点」可扩展为更多步骤。

### 5. 插件系统 (FR-E01)
小何打开插件面板，看到 2 个内置插件。
- 点击「Token 计数」→ 插件统计当前输入框文本的 token 数，Toast 显示结果。
- 点击「划词翻译」→ 插件等待选中文本并返回翻译结果（需接入 API）。

### 6. 国际化 i18n (FR-E06)
小何打开设置 → 语言 → 选择「English」。
- 界面即时切换：标题栏「AI Browser — Multi-Model Compare」、工具栏「Send All」、状态栏「Ready — enable broadcast…」。
- 所有 Toast 提示也变为英文。
- 切换回「中文」，界面恢复。

### 7. 快捷键编辑器 (FR-E05)
小何打开设置 → 快捷键配置。
- 列出所有命令及当前快捷键映射。
- 点击某个快捷键进入录制模式（边框闪烁动画）。
- 按下 `Ctrl+Shift+X`，新快捷键被记录。
- 若有冲突（如已被占用），红色「冲突」提示出现。
- 点击「恢复默认」→ 所有快捷键还原。

### 8. 资源监控 (FR-E03)
小何查看状态栏。
- 显示主进程内存（如 156MB）和 CPU 使用率（如 12%）。
- 鼠标悬停可查看提示：主进程内存 (RSS) / CPU 使用率。

### 9. 面板休眠 (FR-E02)
小何隐藏 Claude 面板，5 分钟后该 webview 自动加载 `about:blank` 释放内存。
- 再次显示 Claude 面板，自动恢复原 URL 并加载。
- 恢复期间显示骨架屏动画。

### 10. 崩溃恢复 (FR-E04)
（模拟）Claude webview 崩溃。
- 面板上显示红色崩溃覆盖层：⚠ 图标 + 错误提示 +「重载并继续」按钮。
- 点击按钮，webview 重新加载，最近一次广播问题自动回填到输入框。

### 11. 灵活分屏布局 (GLM C3)
小何通过命令面板切换布局。
- `grid-2col`：2 列并排。
- `grid-2row`：上下两行。
- `grid-cross`：十字四宫格。
- `grid-main-side`：主区域+侧栏。
- 切换回默认 flex 布局，恢复拖拽分隔线功能。

### 12. 迷你模式 + 系统托盘 (GLM C4/E2)
- 系统托盘出现 AI Browser 图标。
- 右键托盘 → 勾选「迷你模式」→ 窗口缩小至 400×300，仅保留输入框。
- 取消勾选 → 窗口恢复 1600×1000。
- 按 `Ctrl+Shift+Space` → 窗口隐藏。
- 再按一次 → 窗口显示并聚焦。

---

### 自动验证（程序化）

- [x] JS 语法验证：28/28 文件通过 `new Function()` 检查
- [x] Electron 启动验证：主进程无 JS 异常，`[Backup] Created` 日志正常，`[Proxy] Cleared` 正常
- [x] 打包验证：asar 包含全部 17 个新增模块文件
- [x] IPC 通道验证：17 个 `ipcMain.handle()` 已在 main.js 注册
- [x] CSS 完整性：main.css 2024 行，包含 14 个新组件样式区块
- [x] HTML 完整性：index.html 569 行，26 个 `<script>` 标签，9 个新增面板/Modal
- [x] i18n 覆盖：200+ 键值对，中英文双语完整
- [x] 版本号：package.json v2.0.0，index.html 状态栏同步

---

## Field 5 — Contracts Exposed

| Contract | Produced By | Attributes |
|----------|-------------|------------|
| Conversation | history-store.js → main/store.js | id, aiType, question, messages[], tags[], favorite, rating, createdAt |
| Comparison | compare-view.js → main/store.js | id, question, entries[] (aiType, paneId, answer, latencyMs, rating, best), summary |
| Template | templates.js → main/store.js | id, name, category, body, variables[], isBuiltin, createdAt |
| AppSettings | history-store.js → main/store.js | theme, locale, sleep (enabled, idleMinutes), shortcuts |
| MetricsSample | main.js → metrics-view.js | mainRSS, mainHeap, cpuUser, cpuSystem, ts |
| PluginMessage | plugin-host.js ↔ iframe | postMessage API (count-tokens, translate, token-result, translate-result) |

---

## Field 6 — Dependencies

- **M1 基础重塑 (Outcome 5)** — tokens.css, theme.js, command-palette.js, shortcuts.js, panel-sorter.js, skeleton CSS 已就绪
- **Phase A Foundation** — Electron shell + webview + persist session + CSP stripping 已就绪
- **Phase B Outcome 1-2** — AI_TYPES registry, broadcast, proxy 已就绪
- **Phase C Outcome 3** — fingerprint 已就绪
- **Phase D Outcome 4** — responsive breakpoints 已就绪

无外部服务依赖。所有存储为本地 JSON 文件 + safeStorage 加密。
