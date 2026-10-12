// ================= 数据层：localStorage 读写 =================
const STORAGE_KEY = 'xss-demo-messages';

// 从 localStorage 读取留言数组（没有则返回空数组）
function loadMessages() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// 把留言数组写回 localStorage（JSON 字符串）
function saveMessages(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ================= 渲染层：把留言显示到页面上 =================
// 【漏洞就在这里】直接把用户输入拼进 innerHTML，
// 浏览器会把输入里的 <img> <svg> 等标签当成真正的 HTML 解析执行
function renderMessages() {
  const list = loadMessages();
  const ul = document.getElementById('msgList');
  ul.innerHTML = '';

  list.forEach((msg) => {
    const li = document.createElement('li');
    // 漏洞代码：昵称和内容都直接 innerHTML 拼接，无任何转义
    li.innerHTML = `
      <div>
        <span class="msg-nick">${msg.nickname}</span>
        <span class="msg-time">${msg.time}</span>
      </div>
      <div class="msg-content">${msg.content}</div>
    `;
    ul.appendChild(li);
  });
}

// ================= 交互逻辑 =================
// 提交留言
document.getElementById('msgForm').addEventListener('submit', (e) => {
  e.preventDefault(); // 阻止表单默认刷新行为

  const nickname = document.getElementById('nickname').value;
  const content = document.getElementById('content').value;

  const list = loadMessages();
  list.push({
    nickname,
    content,
    time: new Date().toLocaleString(),
  });
  saveMessages(list);

  document.getElementById('content').value = '';
  renderMessages();
});

// 清空留言
document.getElementById('clearBtn').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderMessages();
});

// 设置一个模拟的会话 Cookie，用于演示 XSS 窃取 Cookie
document.getElementById('setCookieBtn').addEventListener('click', () => {
  document.cookie = 'session=abc123secret; path=/';
  document.getElementById('cookieStatus').textContent = '已设置：session=abc123secret';
});

// 点击"攻击载荷"按钮 → 自动填进留言输入框
document.querySelectorAll('.payload').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.getElementById('content').value = btn.dataset.payload;
  });
});

// 页面打开时渲染已有留言
renderMessages();
