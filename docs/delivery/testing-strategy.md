# Testing Strategy

## Test layers

### L1: JS 语法检查
- `node -e "new Function(fs.readFileSync(f))"` 逐文件验证
- 目标：0 FAIL，覆盖 src/js/*.js + src/main/*.js

### L2: Electron 启动冒烟测试
- `npx electron . --no-sandbox` 启动
- 检查点：无 JS 异常、Backup/Proxy 日志正常、无 render-process-gone

### L3: IPC 通道验证
- 代码审查：确认 `ipcMain.handle()` 数量与渲染端调用匹配
- 启动日志：检查 main.js 中 `app.whenReady()` 内所有服务启动成功

### L4: 打包完整性
- `npm run build:pack` 生成 asar
- `npx asar list` 验证所有模块文件包含在包内

### L5: 手动验收 (Verification Walkthrough)
- 按 Outcome 文档 Field 4 逐步执行
- 覆盖：历史面板/模板库/对比视图/工作流/插件/i18n/快捷键编辑器/资源监控/休眠/崩溃恢复/分屏布局/迷你模式

## CI Integration
- `.github/workflows/ci.yml`：PR 触发 L1 + L2
- `.github/workflows/release.yml`：tag 触发 L1-L4 + 多平台打包
