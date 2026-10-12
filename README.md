# Web 安全攻防演练 Demo

基于原生 HTML / CSS / JavaScript 实现的存储型 XSS 攻击与防御演示项目。支持「漏洞 / 防御」双模式切换，直观对比 XSS 攻击链路与三层防御方案的效果。

## 技术栈

- 原生 HTML5 + CSS3（Flexbox 布局）
- 原生 JavaScript（ES6+，无任何框架和第三方库）
- localStorage 数据持久化
- Content Security Policy（CSP）

## 功能特性

### 攻击演示（漏洞模式）

| 载荷 | 类型 | 效果 |
|------|------|------|
| `<img onerror>` | HTML 注入 | 篡改页面背景色与文字色 |
| `<img onerror>` | Cookie 窃取 | 在页面顶部插入红色文字显示用户 Cookie |
| `<svg onload>` | SVG 载荷 | 利用 SVG 标签的 onload 事件执行脚本 |

所有攻击载荷均为**存储型 XSS**——恶意脚本存入 localStorage，每次页面加载自动执行。

### 防御方案（防御模式）

| 层级 | 手段 | 原理 |
|------|------|------|
| 第一层 | `textContent` 替代 `innerHTML` | 将用户输入作为纯文本渲染，`<img>` 等标签不会被解析为 HTML |
| 第二层 | HTML 实体转义 | 将 `< > & " '` 转义为 HTML 实体，防止标签注入 |
| 第三层 | CSP 内容安全策略 | `script-src 'self'` 禁止所有内联事件处理器执行，即使存在漏洞也能兜底 |

## 项目结构

```
xss-demo/
├── index.html    # 页面结构 + CSP 策略配置
├── style.css     # 样式（漏洞/防御模式视觉区分）
├── app.js        # 攻击载荷库 + 数据层 + 渲染层 + 交互逻辑
└── README.md
```

## 运行方式

```bash
# 进入项目目录，启动本地 HTTP 服务器
python -m http.server 8080

# 浏览器打开
http://localhost:8080
```

## 演示流程

1. 点击「设置模拟会话 Cookie」
2. 在漏洞模式下，点击攻击载荷按钮 → 发布留言 → 观察攻击效果
3. 刷新页面 → 攻击再次执行（存储型 XSS 特征）
4. 切换到防御模式 → 同样的载荷只显示为纯文本，不执行
5. 切回漏洞模式 → CSP 已启用，onerror 被 CSP 拦截，攻击不执行

## 安全知识点

- 存储型 XSS 的完整攻击链路：输入 → 存储 → 渲染 → 执行
- `innerHTML` 拼接用户输入的安全风险
- `textContent` 与 `innerHTML` 的安全差异
- HTML 实体转义的必要性与转义顺序
- CSP 作为最后防线，无需修改业务代码即可生效
