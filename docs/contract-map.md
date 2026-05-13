# Contract Map & Dependency Graph
> Updated 2026-05-13 — Phase F complete (Outcome 6 verified)

---

## All Contracts

| Contract Name | Produced By | Consumed By | Key Attributes |
|---------------|-------------|-------------|----------------|
| Panel Identity | Outcome 1 | Broadcast, Layout, Clone | panelId, type, primary, partition |
| AI_TYPES Registry | Outcome 1 | Broadcast, Clone, Add-Menu, Workflow | name, icon, url, host, inject(q), extract() |
| ProxyConfig | Outcome 2 | Main Process (IPC) | enabled, type, host, port, username, password |
| Inject v2 (Click) | Outcome 2 | Broadcast (sendQuery) | MouseEvent+PointerEvent dispatch, Enter fallback |
| Local Clock | Outcome 2 | Status Bar | new Date() local time, 1s interval |
| FingerprintConfig | Outcome 3 | Main Process, webview | enabled, seed per partition, canvas/WebGL/AudioContext |
| ResponsiveBreakpoints | Outcome 4 | Global CSS | 1200px/900px/960px/700px/640px @media queries |
| DesignTokens | Outcome 5 | Global CSS | --color-*, --space-*, --motion-*, --font-*, data-theme |
| ThemeEngine | Outcome 5 | Global | setTheme/cycleTheme/getTheme, localStorage persist |
| CommandPalette | Outcome 5 | Global (Ctrl+K) | Fuse.js fuzzy search, 30+ commands, category grouping |
| ShortcutRegistry | Outcome 5/6 | Global | DEFAULT_SHORTCUTS, accelerator parser, conflict detection |
| PanelOrder | Outcome 5 | panels.js | HTML5 DnD + localStorage persist |
| Conversation | Outcome 6 | history-drawer, history-store, export | id, aiType, question, messages[], tags[], favorite, rating, createdAt |
| Comparison | Outcome 6 | compare-view, history-store, export | id, question, entries[] (aiType, paneId, answer, latencyMs, rating, best), summary |
| Template | Outcome 6 | templates, history-store | id, name, category, body, variables[], isBuiltin |
| AppSettings | Outcome 6 | theme, panels, webview, history-store | theme, locale, sleep (enabled, idleMinutes), shortcuts |
| MetricsSample | Outcome 6 | metrics-view | mainRSS, mainHeap, cpuUser, cpuSystem, ts (5s interval) |
| PluginMessage | Outcome 6 | plugin-host | postMessage API (count-tokens, translate, token-result, translate-result) |
| I18NData | Outcome 6 | Global UI | 200+ key-value pairs, zh-CN/en-US, data-i18n binding |
| BackupSnapshot | Outcome 6 | store.js | All data files zipped with timestamp, auto-rotate 7 copies |

---

## Handshake Map

| Connection | Status |
|-----------|--------|
| Outcome 1 → Panel Identity → Broadcast | CONFIRMED |
| Outcome 1 → AI_TYPES → Broadcast, Clone, Workflow | CONFIRMED |
| Outcome 1 → AI_TYPES → Outcome 5 (extract) | CONFIRMED |
| Outcome 2 → ProxyConfig → Main Process (IPC) | CONFIRMED |
| Outcome 2 → Inject v2 → Broadcast | CONFIRMED |
| Outcome 3 → FingerprintConfig → Main Process, webview | CONFIRMED |
| Outcome 5 → DesignTokens → Outcome 6 (all new CSS) | CONFIRMED |
| Outcome 5 → ShortcutRegistry → Outcome 6 (shortcut editor) | CONFIRMED |
| Outcome 6 → Conversation → history-drawer, export | CONFIRMED |
| Outcome 6 → Comparison → compare-view, export | CONFIRMED |
| Outcome 6 → AppSettings → theme, panels, webview | CONFIRMED |

---

## Dependency Graph (Build Order)

**Phase A — Foundation (no dependencies):**
- Electron shell + webview + persist session + CSP stripping

**Phase B (depends only on Phase A):**
- Outcome 1: 智谱清言 + 多账号副本
- Outcome 2: 广播点击修复 + 代理配置 + 本地时钟

**Phase C (depends on Phase B):**
- Outcome 3: 指纹浏览器防护

**Phase D (depends on Phase C):**
- Outcome 4: 智谱面板响应式适配 + 全局响应式断点

**Phase E (depends on Phase A — independent of B/C/D):**
- Outcome 5: M1 基础重塑 — CSS 设计令牌 + 4 主题 + 命令面板 + 快捷键 + 拖拽排序 + 骨架屏

**Phase F (depends on Phase B + Phase E):**
- Outcome 6: 全量升级 — M1 剩余 (D01/D03/E02/E04) + M2 协作增强 (C01-C07) + M3 平台化 (E01/E03/E05/E06/E07/E08) + GLM 特有

---

## Orphan Report

> ✓ All contracts mapped for Phase F outcomes.

- Phase F → Phase B (AI_TYPES, Broadcast) | ✅ Satisfied
- Phase F → Phase E (DesignTokens, ShortcutRegistry) | ✅ Satisfied
- Phase F → Phase A Foundation | ✅ Satisfied
