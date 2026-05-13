# Outcome 6 — 全量升级：M1 剩余 + M2 协作增强 + M3 平台化

> 状态：built-pending-verification
> 阶段：Phase F — 基于 Claude Opus 4.7 + GLM5.1 需求合并的全量实现
> 注册方式：plan-F
> 注册时间：2026-05-13
> 基线版本：v2.0.0-dev → v2.0.0

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

## Field 4 — 验收清单

- [x] JS 语法验证：28/28 文件通过
- [x] Electron 启动验证：无 JS 错误，备份/代理正常
- [x] 所有 IPC 通道在主进程注册
- [x] 所有新 UI 面板在 index.html 中存在
- [x] 所有新组件 CSS 在 main.css 中存在
- [x] 所有 i18n 键值对覆盖中英文
- [x] 版本号更新至 v2.0.0
