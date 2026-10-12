// ================= 攻击载荷库（存在 JS 里，避免 HTML 属性引号冲突） =================
const PAYLOADS = [
  // 载荷 0：篡改页面 — 改背景色和文字色
  '<img src=x onerror="document.body.style.background=\'black\';document.body.style.color=\'white\';this.alt=\'XSS 攻击成功！页面被篡改\'">',

  // 载荷 1：窃取 Cookie — 在页面顶部插入红色大字显示 Cookie
  '<img src=x onerror="var s=document.createElement(\'div\');s.style.cssText=\'font-size:24px;color:red;font-weight:bold;padding:10px\';s.textContent=\'Cookie 被窃取：\'+document.cookie;document.body.insertBefore(s,document.body.firstChild)">',

  // 载荷 2：SVG 载荷 — 用 SVG 的 onload 触发
  '<svg onload="var s=document.createElement(\'div\');s.style.cssText=\'font-size:20px;color:red;font-weight:bold;padding:10px\';s.textContent=\'SVG 载荷执行成功！\';document.body.insertBefore(s,document.body.firstChild)">',
];

// ================= 模式状态 =================
// false = 漏洞模式（innerHTML 直接拼接）
// true  = 防御模式（输出转义 + textContent 安全渲染）
var isSafeMode = false;

// ================= 防御函数：HTML 实体转义 =================
// 把 < > & " ' 转成 HTML 实体，让浏览器把它们当纯文本而非标签解析
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')   // 必须先转 &，否则后面转出来的实体会被二次转义
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ================= 数据层：localStorage 读写 =================
var STORAGE_KEY = 'xss-demo-messages';

function loadMessages() {
  var raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveMessages(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ================= 渲染层 =================
function renderMessages() {
  var list = loadMessages();
  var ul = document.getElementById('msgList');
  ul.innerHTML = '';

  list.forEach(function (msg) {
    var li = document.createElement('li');

    if (isSafeMode) {
      // 【防御模式】用 DOM API + textContent 安全渲染
      // textContent 不会把字符串当 HTML 解析，<img> <svg> 只会当纯文本显示
      var headerDiv = document.createElement('div');
      var nickSpan = document.createElement('span');
      nickSpan.className = 'msg-nick';
      nickSpan.textContent = msg.nickname; // textContent 而非 innerHTML
      var timeSpan = document.createElement('span');
      timeSpan.className = 'msg-time';
      timeSpan.textContent = msg.time;
      headerDiv.appendChild(nickSpan);
      headerDiv.appendChild(timeSpan);

      var contentDiv = document.createElement('div');
      contentDiv.className = 'msg-content';
      contentDiv.textContent = msg.content; // 攻击载荷只显示为纯文本，不执行

      li.appendChild(headerDiv);
      li.appendChild(contentDiv);
    } else {
      // 【漏洞模式】直接 innerHTML 拼接，用户输入被当 HTML 解析
      li.innerHTML =
        '<div>' +
        '<span class="msg-nick">' + msg.nickname + '</span>' +
        '<span class="msg-time">' + msg.time + '</span>' +
        '</div>' +
        '<div class="msg-content">' + msg.content + '</div>';
    }
    ul.appendChild(li);
  });
}

// ================= 模式切换 =================
function toggleMode() {
  isSafeMode = !isSafeMode;
  var badge = document.getElementById('modeBadge');
  var tip = document.getElementById('modeTip');
  var btn = document.getElementById('toggleModeBtn');

  if (isSafeMode) {
    badge.textContent = '防御模式';
    badge.classList.add('safe');
    btn.textContent = '切换到漏洞模式';
    btn.classList.add('vuln');
    tip.textContent = '当前为防御模式：用户输入经实体转义 + textContent 渲染，攻击载荷只显示为纯文本。';
  } else {
    badge.textContent = '漏洞模式';
    badge.classList.remove('safe');
    btn.textContent = '切换到防御模式';
    btn.classList.remove('vuln');
    tip.textContent = '当前为漏洞模式：用户输入未经任何处理直接拼进页面。';
  }
  renderMessages(); // 切换模式后重新渲染
}

// ================= 交互逻辑 =================
document.getElementById('msgForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var nickname = document.getElementById('nickname').value;
  var content = document.getElementById('content').value;
  var list = loadMessages();
  list.push({ nickname: nickname, content: content, time: new Date().toLocaleString() });
  saveMessages(list);
  document.getElementById('content').value = '';
  renderMessages();
});

document.getElementById('clearBtn').addEventListener('click', function () {
  localStorage.removeItem(STORAGE_KEY);
  renderMessages();
});

document.getElementById('setCookieBtn').addEventListener('click', function () {
  document.cookie = 'session=abc123secret; path=/';
  document.getElementById('cookieStatus').textContent = '已设置：session=abc123secret';
});

document.getElementById('toggleModeBtn').addEventListener('click', toggleMode);

document.querySelectorAll('.payload').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var index = parseInt(btn.dataset.index);
    document.getElementById('content').value = PAYLOADS[index];
  });
});

// 页面打开时渲染已有留言
renderMessages();
