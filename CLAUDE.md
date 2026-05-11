# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

AI-Browser 是一个基于 Electron 的多 AI 模型分屏浏览器，支持同时打开 ChatGPT、Claude、Gemini、DeepSeek 四个 AI 网站，通过统一输入框广播问题。

## 开发规范

本项目使用 **OpenSpec + Trellis** 进行规格驱动开发（SDD）。

### Trellis 工作流

- 使用 `/trellis` 启动 Trellis 会话
- 每个变更遵循: 提案 → 实现 → 归档 的循环
- 验收标准定义在 `docs/outcomes/` 目录
- 完整规划在 `docs/plan.md`

### OpenSpec 斜杠指令

在代码编辑器中可用:
- `/opsx:propose` - 创建新提案
- `/opsx:apply` - 应用变更
- `/opsx:archive` - 归档完成的工作

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发
npm start

# 打包为可执行文件
npx @electron/packager . AI-Browser --platform=win32 --arch=x64 --out=release --overwrite
```

打包后的可执行文件在 `release/AI-Browser-win32-x64/AI-Browser.exe`

## 技术架构

- **Electron 28 + webview**：每个 AI 面板是独立的 webview 实例
- **持久化 Session**：使用 `partition: 'persist:aisession'` 保存登录状态到 `AppData/Roaming/ai-browser`
- **Header 注入**：移除 CSP 和 X-Frame-Options 允许加载 AI 网站

## 核心文件

| 文件 | 作用 |
|------|------|
| `src/main.js` | Electron 主进程，窗口管理、session 配置 |
| `src/index.html` | UI 界面，包含 webview、广播逻辑、布局控制 |
| `docs/` | Trellis 规划文档 |
| `.claude/` | Claude Code hooks 和 skills |
| `.opencode/` | OpenCode 命令和配置 |

## 主要功能

- **广播模式**：开启后输入问题自动注入到所有可见 AI 面板
- **布局切换**：支持 2/3/4 栏显示，点击顶部按钮切换
- **面板显隐**：点击状态栏标签可单独开关某个 AI
- **宽度拖拽**：拖动面板分隔线调整相对宽度
- **快捷键**：`Ctrl+Enter` 发送问题

## 注意事项

- AI 网站登录状态保存在 `C:\Users\[用户名]\AppData\Roaming\ai-browser`
- 广播注入依赖网站 DOM 结构，如网站更新可能导致注入失败（会提示复制到剪贴板）
- Trellis 相关文件（`.trellis/`、`plugins/`）由 Trellis 自动管理，不要手动修改
