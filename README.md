# AI Browser

多 AI 模型分屏对比浏览器。基于 Electron，支持同时打开 ChatGPT、Claude、Gemini、DeepSeek，统一输入问题，横向对比回答。

## 功能特性

- **分屏对比**：支持 2/3/4 栏布局，同时查看多个 AI 回答
- **广播模式**：开启后输入问题自动同步到所有 AI 面板
- **面板控制**：可单独开关某个 AI，拖拽调整宽度
- **状态持久化**：登录状态自动保存，下次打开无需重新登录

## 支持的 AI

- ChatGPT (chatgpt.com)
- Claude (claude.ai)
- Gemini (gemini.google.com)
- DeepSeek (chat.deepseek.com)

## 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发
npm start
```

### 打包发布

```bash
# 打包 Windows 版本
npm run build:win

# 打包 macOS 版本
npm run build:mac

# 打包 Linux 版本
npm run build:linux

# 打包所有平台
npm run build:all
```

打包后的文件在 `release/` 目录。

## 版本规则

本项目使用语义化版本 (SemVer)：

- **主版本 (MAJOR)**：不兼容的重大更新
- **次版本 (MINOR)**：新增功能（向下兼容）
- **修订版 (PATCH)**：问题修复

格式：`vMAJOR.MINOR.PATCH`，例如 `v1.0.0`

## 开发规范

使用 OpenSpec + Trellis 进行规格驱动开发：

- 使用 `/trellis` 启动 Trellis 会话
- 变更遵循：提案 → 实现 → 归档 流程
- 详见 [CLAUDE.md](CLAUDE.md)

## 技术栈

- Electron 28
- webview (Chromium)
- Node.js 18+

## License

MIT
