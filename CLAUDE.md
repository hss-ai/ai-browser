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

## 版本与发布

### 版本规则 (SemVer)

格式：`vMAJOR.MINOR.PATCH`
- **MAJOR**：破坏性更新，不兼容的 API 变更
- **MINOR**：新增功能，向后兼容
- **PATCH**：问题修复，向后兼容

详见 `docs/versioning.md`

### 修改完成后必须执行的流程

每次代码修改完成后，必须按顺序执行以下步骤：

```bash
# 1. 提交代码到 main 分支
git add .
git commit -m "<type>: <描述>"

# type 可选: feat | fix | docs | style | refactor | test | chore

# 2. 推送代码触发 CI
git push origin main

# 3. 打标签（根据修改类型选择）
git tag v1.0.0      # 首次发布
git tag v1.0.1      # PATCH: 修复问题
git tag v1.1.0      # MINOR: 新增功能
git tag v2.0.0      # MAJOR: 重大更新

# 4. 推送标签触发打包发布
git push origin --tags
```

### 自动化说明

- **推送到 main**：自动运行 CI 测试（安装依赖、验证构建）
- **推送标签 `v*`**：自动构建 Windows/macOS/Linux 三平台并发布到 GitHub Releases

### GitHub Actions

| Workflow | 触发条件 | 作用 |
|----------|----------|------|
| `ci.yml` | push 到 main | 运行测试和构建验证 |
| `release.yml` | push 标签 `v*` | 构建三平台可执行文件并发布 |

### Release 下载

发布成功后从 GitHub 下载：
- Windows: `AI-Browser-win32-x64.zip`
- Linux: `AI-Browser-linux-x64.tar.gz`
- macOS: `AI-Browser-darwin-x64.zip`
