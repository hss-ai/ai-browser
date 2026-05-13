# 🤖 AI Browser — 智能多模态对比平台

<p align="center">
  <img src="screenshot.png" alt="AI Browser 界面截图" width="100%">
</p>

**AI Browser** 是一款专为 AI 模型评估与对比设计的智能桌面浏览器。基于 Electron 28 构建，支持在统一界面内同时运行 ChatGPT、Claude、Gemini、DeepSeek、智谱清言等主流大模型，通过一键广播提问与实时横向对比，帮助用户高效评估不同 AI 模型的表现差异。

> **当前版本：v2.0.0** · 28 个 JS 模块 · CSS 设计令牌 · 4 主题系统 · 20 个功能合同已交付

## ✨ 核心功能

### 🖥️ 多模型对比

| 功能 | 说明 |
|------|------|
| 📡 **一键广播** | Enter 自动注入到所有可见面板，支持 @mention 定向广播 |
| 🖥️ **灵活分屏** | 2/3/4/5 栏自由切换，拖拽排序面板，任意调整布局 |
| 👥 **多账号副本** | 每个 AI 面板可克隆副本，独立 session 互不干扰 |
| 📊 **对比视图** | 并排对比多个 AI 回复，内置 LCS 段落级 Diff 高亮 |
| 📝 **响应抓取** | 自动捕获 AI 回复内容，一键汇总导出 |

### 🔐 安全与隐私

| 功能 | 说明 |
|------|------|
| 🔐 **指纹伪装** | WebGL / Canvas / AudioContext / WebRTC 独立指纹，参数自洽 |
| 🌐 **代理支持** | HTTP / HTTPS / SOCKS4 / SOCKS5，支持认证 |
| 🔒 **加密存储** | Electron safeStorage AES-256-GCM 加密本地数据 |
| 🧹 **隐私清理** | 一键清除会话数据、缓存、cookie |
| 💾 **崩溃恢复** | 异常退出后自动恢复未保存状态 |

### 🎨 设计系统

| 功能 | 说明 |
|------|------|
| 🎨 **4 主题** | Dark / Light / System / High-Contrast，热切换 |
| ⌨️ **命令面板** | `Ctrl+K` 全局命令搜索（Fuse.js 模糊匹配，30+ 命令） |
| ⌨️ **快捷键** | 10 个默认快捷键 + 可视化编辑器，支持自定义 |
| 💀 **骨架屏** | 面板加载时展示骨架动画，平滑过渡 |
| 🪟 **玻璃拟态** | 标题栏 / 状态栏毛玻璃效果，现代化视觉 |
| 📱 **响应式** | 1200/960/700/640px 四级断点，适配各种窗口尺寸 |
| 🔤 **字体** | Inter（UI）+ JetBrains Mono（代码），本地打包无需联网 |

### 🚀 高级功能

| 功能 | 说明 |
|------|------|
| 📋 **会话历史** | 按模型/日期/收藏检索历史对话，支持导入导出 JSON |
| 📐 **模板库** | 预置常用 Prompt 模板，支持自定义 + 变量替换 |
| 🔗 **工作流引擎** | DAG 拓扑排序驱动的多步工作流，链式调用 AI |
| 🔌 **插件系统** | iframe sandbox postMessage API，支持自定义扩展 |
| 🌍 **i18n** | 国际化和本地化支持（200+ key-value 对） |
| 📈 **资源监控** | 实时 CPU/内存/网络，面板休眠机制降低开销 |
| 🔄 **自动更新** | 自动检测新版本，静默下载 + 提示安装 |
| 🪶 **迷你模式** | 收缩为紧凑悬浮窗 + 系统托盘常驻 + 全局快捷键唤出 |
| 📄 **多格式导出** | Markdown / JSON / 纯文本导出 |

## 🌍 支持的 AI 模型

| 模型 | 网址 | 状态 |
|------|------|:--:|
| ChatGPT | chatgpt.com | ✅ |
| Claude | claude.ai | ✅ |
| Gemini | gemini.google.com | ✅ |
| DeepSeek | chat.deepseek.com | ✅ |
| 智谱清言 | chatglm.cn | ✅ |

## ⌨️ 操作方式

| 快捷键 | 功能 |
|--------|------|
| `Enter` | 发送到所有可见面板 |
| `Ctrl+K` | 命令面板 |
| `Ctrl+Shift+H` | 会话历史 |
| `Ctrl+Shift+C` | 对比视图 |
| `Ctrl+Shift+M` | 迷你模式 |
| `Ctrl+[` / `Ctrl+]` | 切换布局栏数 |
| `Ctrl+Shift+L` | 切换主题 |
| `Ctrl+Shift+E` | 导出对话 |
| `Ctrl+,` | 快捷键编辑器 |
| `Ctrl+Shift+I` | 诊断信息 |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发
npm start

# 启动开发模式（含 DevTools）
npm run dev
```

## 📦 打包发布

本地打包：
```bash
npm run dist:win      # Windows (.exe NSIS 安装包)
npm run dist:mac      # macOS (.dmg)
npm run dist:linux    # Linux (.AppImage)
npm run dist:all      # 三端同时打包
```

CI/CD 自动打包：推送 `v*` tag 触发 [GitHub Actions](.github/workflows/release.yml)，三端并行构建并创建 Release。

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Electron 28 |
| 渲染 | Chromium webview + vanilla JS（无框架） |
| 样式 | CSS Custom Properties 设计令牌 |
| 搜索 | Fuse.js 模糊匹配 |
| 字体 | @fontsource/inter + @fontsource/jetbrains-mono |
| 加密 | Electron safeStorage (AES-256-GCM) |
| 存储 | JSON 文件存储（无数据库） |
| 打包 | electron-builder（NSIS / DMG / AppImage） |
| CI/CD | GitHub Actions（三端矩阵构建） |
| 开发规范 | Trellis Outcome-Driven + OpenSpec SDD |

## 📂 项目结构

```
src/
├── main.js                # Electron 主进程（IPC 注册 + 窗口管理）
├── main/
│   └── store.js           # 安全存储（safeStorage 加密）
├── index.html             # 主界面（569 行，26 个 script 标签）
├── css/
│   ├── tokens.css         # CSS 设计令牌（颜色/间距/字体/阴影）
│   └── main.css           # 样式（2024 行，14 个组件块 + 4 主题）
└── js/
    ├── app.js             # 应用入口 + 初始化流程
    ├── ai-types.js        # AI 模型定义 + webview 注入逻辑
    ├── broadcast.js       # 广播引擎（含 @mention 定向）
    ├── panels.js          # 面板管理（布局/克隆/显隐/排序）
    ├── webview.js         # webview 生命周期 + 懒加载 + 休眠
    ├── state.js           # 状态持久化 + 崩溃恢复
    ├── proxy.js           # 代理模块
    ├── fingerprint-core.js  # 指纹伪装核心（API Hook）
    ├── fingerprint-profiles.js  # 指纹参数配置
    ├── fingerprint-ui.js  # 指纹设置界面
    ├── theme.js           # 主题切换引擎
    ├── command-palette.js # Ctrl+K 命令面板（30+ 命令）
    ├── shortcuts.js       # 快捷键注册 + 编辑器
    ├── panel-sorter.js    # 拖拽排序
    ├── history-store.js   # 历史存储层
    ├── history-drawer.js  # 历史抽屉 UI
    ├── compare-view.js    # 对比视图
    ├── diff.js            # LCS 段落级 Diff 算法
    ├── templates.js       # 模板库
    ├── export.js          # 多格式导出
    ├── workflow.js        # DAG 工作流引擎
    ├── plugin-host.js     # 插件宿主（sandbox postMessage）
    ├── i18n.js            # 国际化（200+ key-value）
    ├── metrics-view.js    # 资源监控（CPU/内存/网络）
    ├── updater.js         # 自动更新
    ├── clock.js           # 状态栏时钟
    └── toast.js           # Toast 通知
```

## 🏗 开发规范

使用 [Trellis](plugins/trellis/) Outcome-Driven Development + [OpenSpec](.opencode/) 规格驱动开发：

| 文档 | 说明 |
|------|------|
| `docs/plan.md` | 主实施计划（Phase A-F） |
| `docs/outcomes/` | 6 个 Outcome 验收文档 |
| `docs/architecture/` | 架构决策文档 |
| `docs/contract-map.md` | 20 个功能合同 + 依赖图 |
| `docs/verification/` | 验收检查清单 |
| `docs/delivery/` | 测试策略 + 技术栈决策 |
| `docs/operations/` | 备份恢复 + 交接文档 |

## 📄 License

MIT
