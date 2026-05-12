# Outcome 3 — 指纹浏览器防护

> **Phase C — 安全与反风控**
> 注册于 2026-05-12
> 指纹浏览器功能：为每个 AI 面板 webview 提供独立、一致的伪造浏览器指纹，防止 GPT、Claude 等 AI 网站的风控检测。

---

## Field 1 — 这个 outcome 为谁解决什么问题？

**Persona：小何（AI 重度对比使用者）**

小何使用 AI-Browser 同时对比 5 个 AI 的回复，并为同一 AI 开启多个账号副本。但随着使用频率增加，GPT 和 Claude 的网站开始通过浏览器指纹检测到异常（例如：同一设备同时运行了多个会话、Canvas 指纹相同导致被标记为机器人），触发了风控机制（验证码、限流、甚至封号）。

小何需要每个 webview 面板都拥有**独立且自洽的浏览器指纹**，让每个面板看起来像一台独立的真实设备，从而规避风控检测。

---

## Field 2 — 当这个 outcome 完成时，什么必须是 true（验收条件）

1. **指纹伪装可开关**：状态栏的「指纹」按钮可一键启用/关闭指纹伪装功能
2. **Navigator 属性伪造**：`navigator.hardwareConcurrency`、`platform`、`language`、`maxTouchPoints` 等返回伪造值
3. **Screen 属性伪造**：`screen.width/height`、`colorDepth`、`pixelDepth` 返回自洽的伪造值
4. **Canvas 指纹保护**：`HTMLCanvasElement.prototype.toDataURL()` 和 `.toBlob()` 返回值包含唯一的微噪点
5. **WebGL 指纹保护**：`WebGLRenderingContext.prototype.getParameter()` 对 UNMASKED_VENDOR/RENDERER 返回伪造值
6. **AudioContext 指纹保护**：`AudioBuffer.prototype.getChannelData()` 返回加入了微噪点的缓冲区
7. **WebRTC 泄露防护**：`RTCPeerConnection` 的 SDP 中本地 IP 地址被替换为 `0.0.0.0`
8. **时区伪装**：`Date.prototype.getTimezoneOffset()` 与 `Intl.DateTimeFormat` 返回自洽的时区
9. **字体枚举保护**：`Document.prototype.fonts` 的枚举被限制为少量内置字体
10. **副本独立指纹**：每个克隆副本拥有独立的指纹配置（不同的 profile seed）
11. **参数自洽**：伪造的 OS 类型与 screen.colorDepth、WebGL vendor 等参数逻辑一致（例如 Mac 的 colorDepth=30，Windows 的 colorDepth=24）

---

## Field 3 — 可测量的验证步骤

### 步骤 1：启用指纹保护
- 点击 toolbar 的「指纹」按钮，打开指纹设置弹窗
- 勾选「启用指纹伪装」，点击「保存」
- **确认** 指纹按钮变为激活状态（紫色高亮）
- **确认** toast 提示：「指纹伪装已启用 — 每个面板拥有独立指纹」

### 步骤 2：验证 Navigator 伪造
- 在 ChatGPT 面板打开 DevTools（右键 → Inspect）
- 在 Console 中输入：`navigator.hardwareConcurrency`、`navigator.platform`、`navigator.language`
- **确认** 返回值与真实系统不同

### 步骤 3：验证 Canvas 指纹
- 在 ChatGPT 面板 Console 中运行 Canvas 指纹检测脚本：
```javascript
const c = document.createElement('canvas');
c.width = 200; c.height = 50;
const ctx = c.getContext('2d');
ctx.fillText('fingerprint test 😊', 5, 30);
c.toDataURL();
```
- 刷新页面后再次运行
- **确认** 两次的 toDataURL 输出不同（噪点导致）

### 步骤 4：验证 WebGL 指纹
- 在 Console 中获取 WebGL debug info：
```javascript
const gl = document.createElement('canvas').getContext('webgl');
const ext = gl.getExtension('WEBGL_debug_renderer_info');
console.log(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL));
console.log(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL));
```
- **确认** 返回的是伪造的 GPU 信息（非真实 GPU）

### 步骤 5：验证副本隔离
- 为 ChatGPT 新增一个副本（ChatGPT #2）
- 在 Console 中检查两个 ChatGPT 面板的 `navigator.hardwareConcurrency`
- **确认** 主面板和副本返回不同的值（不同的指纹 seed）

### 步骤 6：验证参数自洽
- 检查某个面板的 `navigator.platform`
- 若返回 `MacIntel`，**确认** `screen.colorDepth === 30`
- 若返回 `Win32`，**确认** `screen.colorDepth === 24`

### 步骤 7：验证开关
- 关闭指纹保护
- 面板重新加载
- **确认** `navigator.hardwareConcurrency` 恢复为真实值

---

## Field 4 — 实现文件

| 文件 | 作用 |
|------|------|
| `src/js/fingerprint-profiles.js` | 设备指纹模板库 + 基于 seed 的 profile 生成器 |
| `src/js/fingerprint-core.js` | Webview preload 脚本，Hook Navigator/Screen/Canvas/WebGL/Audio/WebRTC API |
| `src/js/fingerprint-ui.js` | 指纹设置 UI 弹窗、开关逻辑、webview 注入管理 |
| `src/js/app.js` | 启动时加载指纹配置并应用 |
| `src/js/panels.js` | clonePanel 中为新副本注入独立指纹 |
| `src/main.js` | IPC handler：set-fingerprint / get-fingerprint-status / get-fingerprint-seed |
| `src/index.html` | 指纹按钮、弹窗 UI、webview preload 属性 |
| `src/css/main.css` | 指纹按钮和弹窗样式 |

---

## Field 5 — 已知约束与风险

1. **contextIsolation 依赖**：Preload 脚本需要 `webpreferences="contextIsolation=no"` 才能直接修改页面原型链。若移除该属性，preload 脚本将失效，需依赖 executeJavaScript 注入。
2. **防检测对抗**：高级风控系统可能检测到 `Object.defineProperty` 被调用的痕迹。当前实现使用 try-catch 静默覆盖，不触发错误。
3. **性能影响**：Canvas toDataURL 添加噪点需要读取像素数据并写回，对小 canvas 性能影响可忽略（<1ms），大 canvas (>500k 像素) 不做处理。
4. **网站更新兼容性**：若 AI 网站更新指纹检测方式（例如使用新的 API），需要更新 fingerprint-core.js 中的 Hook 列表。

---

## 验证状态

- [ ] 步骤 1：启用/关闭开关
- [ ] 步骤 2：Navigator 伪造
- [ ] 步骤 3：Canvas 指纹
- [ ] 步骤 4：WebGL 指纹
- [ ] 步骤 5：副本隔离
- [ ] 步骤 6：参数自洽
- [ ] 步骤 7：开关恢复
