# Outcome 4 — 智谱面板响应式适配 + 全局响应式断点

> 状态：built-pending-verification
> 阶段：Phase D — 用户体验优化
> 注册方式：retroactive-plan-D
> 注册时间：2026-05-12

---

## Field 1 — 目标用户与使用场景

**用户**：小何（AI 重度对比使用者）

**场景**：
- 窗口缩放到较小尺寸时，顶部工具栏（标题栏 + 工具栏）元素拥挤重叠
- 智谱面板（chatglm.cn）在窄面板中内容溢出、无法自适应窄视口
- 需在不同窗口宽度下保持可用性和可读性

---

## Field 2 — 验收标准

- [ ] 窗口宽度 ≤ 1200px：工具栏元素等比缩小，间距紧凑
- [ ] 窗口宽度 ≤ 900px：按钮仅显示图标（隐藏文本标签），标题栏缩进消失
- [ ] 智谱 webview 加载后自动注入响应式 CSS：图片等比缩放、代码块自动换行、表格可横向滚动
- [ ] 面板头部高度随断点逐级缩小（44→38→34→30px）
- [ ] 所有主面板的副本同样受全局响应式断点影响
- [ ] 其他 AI 面板（非智谱）不受 webview CSS 注入影响

---

## Field 3 — 实现文件

| 文件 | 变更内容 |
|------|---------|
| `src/css/main.css` | 新增 3 级响应式断点：`@media (max-width: 1200px)`、`@media (max-width: 900px)`、`@media (max-width: 700px)`。覆盖标题栏、工具栏、面板头部、状态栏的全部元素 |
| `src/js/webview.js` | 新增 `ZHIPU_RESPONSIVE_CSS` 常量（img/svg/canvas max-width、pre/code 自动换行、table 横向滚动、input 防溢出）。在 `did-stop-loading` 事件中为 `data-type="zhipu"` 面板注入 |
| `src/index.html` | 将 `proxy-btn`、`fingerprint-btn`、`send-btn` 文本包裹在 `<span>` 中，配合响应式断点在窄屏时隐藏文本仅显示图标；版本号更新至 v1.4.0 |
| `package.json` | 版本号更新至 1.4.0 |

---

## Field 4 — 验证步骤

### 4.1 全局响应式断点验证

1. 启动应用，窗口默认 1600×1000，确认布局正常
2. 拖拽窗口宽度至 ~1100px（触发 1200px 断点）：
   - 验证标题栏 padding 缩小
   - 验证工具栏按钮高度从 42px 缩小到 36px
   - 验证面板头部高度从 44px 缩小到 38px
3. 拖拽窗口宽度至 ~800px（触发 900px 断点）：
   - 验证「代理」「指纹」文本隐藏，仅显示图标
   - 验证「广播关/广播开」文本隐藏
   - 验证「发送给全部」文本隐藏，仅显示发送图标
4. 拖拽窗口宽度至 ~600px（触发 700px 断点）：
   - 验证工具栏自动换行（flex-wrap）
   - 验证面板头部进一步缩小

### 4.2 智谱 webview 响应式验证

1. 点击智谱状态 pill 确保面板可见
2. 等待 webview 加载完成
3. 将窗口调整为窄宽度（确保智谱面板宽度 < 400px）
4. 在智谱面板中浏览 chatglm.cn：
   - 验证页面无水平滚动条
   - 验证图片不超出面板宽度
   - 验证代码块/表格不溢出
5. 切换到其他 AI 面板（ChatGPT/Claude/Gemini/DeepSeek）：
   - 验证这些面板的 webview 未被注入智谱 CSS（页面行为不变）

### 4.3 副本验证

1. 为智谱创建一个副本
2. 验证副本的 webview 同样被注入响应式 CSS（`data-type="zhipu"` 在副本中保留）

---

## Field 5 — 技术备注

- 智谱 webview CSS 注入使用 `webview.insertCSS()`，仅在 `data-type="zhipu"` 面板触发
- 注入的 CSS 使用 `!important` 以确保覆盖 chatglm.cn 原始样式
- 注入采用 `try/catch` 包裹，即使注入失败也不影响应用正常运行
- 700px 断点低于应用 `minWidth: 900`，仅在用户强制缩小时生效
