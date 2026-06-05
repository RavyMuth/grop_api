function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 86400000);
  document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/';
}

let API_KEY = localStorage.getItem('groq_api_key') || '__GROQ_API_KEY__';
let isLight = localStorage.getItem('groq_theme');
if (!isLight) isLight = getCookie('groq_theme') === 'light';
else isLight = isLight === 'light';

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const messagesEl = document.getElementById('messages');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const fileInput = document.getElementById('fileInput');
const attachBtn = document.getElementById('attachBtn');
const filePreview = document.getElementById('filePreview');

let attachedFiles = [];

const SVG_FILE =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-linejoin="round">' +
  '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>' +
  '<polyline points="14 2 14 8 20 8"/>' +
  '</svg>';

attachBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  Array.from(fileInput.files).forEach(file => {
    attachedFiles.push(file);
    const chip = document.createElement('div');
    chip.className = 'file-chip';
    chip.innerHTML = SVG_FILE +
      '<span>' + file.name + '</span>' +
      '<button class="file-remove" data-name="' + file.name + '">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    chip.querySelector('.file-remove').addEventListener('click', () => {
      attachedFiles = attachedFiles.filter(f => f.name !== file.name);
      chip.remove();
    });
    filePreview.appendChild(chip);
  });
  fileInput.value = '';
});

const SVG_COPY =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-linejoin="round">' +
  '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
  '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
  '</svg>';

const SVG_CHECK =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
  'stroke-linejoin="round">' +
  '<polyline points="20 6 9 17 4 12"/>' +
  '</svg>';

function saveSession() {
  try {
    sessionStorage.setItem('chat_history', JSON.stringify(history));
  } catch (e) {}
}

function restoreSession() {
  try {
    const saved = sessionStorage.getItem('chat_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        history = parsed;
        return true;
      }
    }
  } catch (e) {}
  return false;
}

let history = [
  { role: 'system', content: 'You are a helpful assistant. Be concise and friendly.' }
];

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
});

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyCode(btn) {
  const code = btn.nextElementSibling.textContent;
  navigator.clipboard.writeText(code).then(() => {
    btn.innerHTML = SVG_CHECK;
    setTimeout(() => {
      btn.innerHTML = SVG_COPY;
    }, 1500);
  });
}

function renderMarkdown(text) {
  let html = escapeHtml(text);
  const blocks = [];
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const cls = lang ? ` class="language-${lang}"` : '';
    const idx = blocks.length;
    blocks.push(
      '<div class="code-block-wrapper">' +
      '<button class="copy-code-btn" onclick="copyCode(this)" title="Copy code">' +
      SVG_COPY +
      '</button><pre><code' + cls + '>' + code.trim() + '</code></pre></div>'
    );
    return `%%CODEBLOCK${idx}%%`;
  });
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/%%CODEBLOCK(\d+)%%/g, (_, i) => blocks[i]);
  return html;
}

function addMessage(text, role) {
  const displayRole = role === 'assistant' ? 'bot' : role;
  const div = document.createElement('div');
  div.className = `msg ${displayRole}`;

  if (displayRole === 'bot') {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper';
    wrapper.innerHTML = renderMarkdown(text);
    wrapper.querySelectorAll('pre code').forEach(el => Prism.highlightElement(el));

    const copyBtn = document.createElement('button');
    copyBtn.className = 'msg-copy-btn';
    copyBtn.innerHTML = SVG_COPY;
    copyBtn.title = 'Copy message';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = SVG_CHECK;
        setTimeout(() => {
          copyBtn.innerHTML = SVG_COPY;
        }, 1500);
      });
    });
    wrapper.appendChild(copyBtn);
    div.appendChild(wrapper);
  } else {
    div.textContent = text;
  }

  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = getTime();
  div.appendChild(time);

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text && attachedFiles.length === 0) return;

  let displayText = text;
  if (attachedFiles.length > 0) {
    const fileNames = attachedFiles.map(f => '📎 ' + f.name).join('\n');
    displayText = fileNames + (text ? '\n' + text : '');
    attachedFiles = [];
    filePreview.innerHTML = '';
  }

  inputEl.value = '';
  inputEl.style.height = 'auto';
  addMessage(displayText, 'user');
  history.push({ role: 'user', content: text });
  saveSession();

  typingIndicator.classList.add('show');
  sendBtn.disabled = true;

  try {
    if (!API_KEY || API_KEY === '__GROQ_API_KEY__') {
      await new Promise(r => setTimeout(r, 500));
      typingIndicator.classList.remove('show');
      addMessage(
        'Set your API key (free at https://console.groq.com/keys)',
        'bot'
      );
      return;
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: history })
    });
    const data = await res.json();
    typingIndicator.classList.remove('show');
    if (data.error) {
      addMessage('Error: ' + (data.error.message || JSON.stringify(data.error)), 'bot');
    } else {
      const reply = data.choices[0].message.content;
      addMessage(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
      saveSession();
      saveConversation();
      if ('caches' in window) {
        caches.open('chat-responses').then(cache => {
          const req = new Request('https://api.groq.com/responses/' + Date.now());
          cache.put(req, new Response(JSON.stringify({ reply, history: history.slice(-10) })));
        });
      }
    }
  } catch (err) {
    typingIndicator.classList.remove('show');
    addMessage('Network error: ' + err.message, 'bot');
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

if (isLight) {
  document.body.classList.add('light');
}

const settingsOverlay = document.getElementById('settingsOverlay');
const settingsBtn = document.getElementById('settingsBtn');
const settingsClose = document.getElementById('settingsClose');
const themeCheckbox = document.getElementById('themeCheckbox');
const newChatBtn = document.getElementById('newChatBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');

settingsBtn.addEventListener('click', () => {
  settingsOverlay.classList.add('show');
});

settingsClose.addEventListener('click', () => {
  settingsOverlay.classList.remove('show');
});

settingsOverlay.addEventListener('click', (e) => {
  if (e.target === settingsOverlay) {
    settingsOverlay.classList.remove('show');
  }
});

themeCheckbox.addEventListener('change', () => {
  isLight = themeCheckbox.checked;
  document.body.classList.toggle('light', isLight);
  localStorage.setItem('groq_theme', isLight ? 'light' : 'dark');
  setCookie('groq_theme', isLight ? 'light' : 'dark');
});

themeCheckbox.checked = isLight;

function currentConv() {
  return history.filter(m => m.role !== 'system');
}

function titleFromMsgs(msgs) {
  const first = msgs.find(m => m.role === 'user');
  return first ? first.content.slice(0, 60).replace(/\n.*/, '') : 'New chat';
}

function dateGroupLabel(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  if (diff < 86400000 && d.getDate() === now.getDate()) return 'Today';
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  if (d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()) return 'Yesterday';
  if (diff < 604800000) return 'This week';
  if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) return 'This month';
  return 'Older';
}

function groupConversations(list) {
  const groups = {};
  list.forEach(c => {
    const label = dateGroupLabel(c.id);
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  });
  const order = ['Today', 'Yesterday', 'This week', 'This month', 'Older'];
  return order.filter(g => groups[g]).map(g => ({ label: g, items: groups[g] }));
}

function convId() {
  return sessionStorage.getItem('chat_conv_id');
}

function setConvId(id) {
  if (id) sessionStorage.setItem('chat_conv_id', id);
  else sessionStorage.removeItem('chat_conv_id');
}

function saveConversation() {
  const msgs = currentConv();
  if (msgs.length === 0) return;
  const key = 'groq_conversations';
  let list = JSON.parse(localStorage.getItem(key) || '[]');
  const title = titleFromMsgs(msgs);
  const cid = convId();
  const existing = cid ? list.findIndex(c => c.id === Number(cid)) : -1;
  if (existing !== -1) list.splice(existing, 1);
  const entry = {
    id: cid ? Number(cid) : Date.now(),
    title,
    count: msgs.length,
    messages: JSON.parse(JSON.stringify(msgs))
  };
  list.unshift(entry);
  setConvId(entry.id);
  if (list.length > 50) list = list.slice(0, 50);
  localStorage.setItem(key, JSON.stringify(list));
}

function loadConversation(conv) {
  saveConversation();
  messagesEl.innerHTML = '';
  sessionStorage.removeItem('chat_history');
  history = [
    { role: 'system', content: 'You are a helpful assistant. Be concise and friendly.' }
  ];
  conv.messages.forEach(m => {
    history.push(m);
    addMessage(m.content, m.role);
  });
  setConvId(conv.id);
  saveSession();
}

function deleteConversation(id) {
  let list = JSON.parse(localStorage.getItem('groq_conversations') || '[]');
  list = list.filter(c => c.id !== id);
  localStorage.setItem('groq_conversations', JSON.stringify(list));
  if (convId() === String(id)) setConvId(null);
  renderHistoryList();
}

function renderHistoryList() {
  const list = JSON.parse(localStorage.getItem('groq_conversations') || '[]');
  const el = document.getElementById('historyList');
  if (list.length === 0) {
    el.innerHTML = '<div class="history-empty">No saved conversations.</div>';
    return;
  }
  const groups = groupConversations(list);
  const activeId = convId();
  el.innerHTML = groups.map(g => `
    <div class="history-group">
      <div class="history-group-label">${g.label}</div>
      ${g.items.map(c => `
        <div class="history-item${activeId === String(c.id) ? ' active' : ''}" data-id="${c.id}">
          <div class="history-item-title">${escapeHtml(c.title || 'New chat')}</div>
          <div class="history-item-meta">${c.count} message${c.count > 1 ? 's' : ''}</div>
          <button class="history-item-del" title="Delete" data-id="${c.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `).join('')}
    </div>
  `).join('');
  el.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.history-item-del')) return;
      const id = Number(item.dataset.id);
      const all = JSON.parse(localStorage.getItem('groq_conversations') || '[]');
      const conv = all.find(c => c.id === id);
      if (!conv) return;
      loadConversation(conv);
      document.getElementById('historyOverlay').classList.remove('show');
      settingsOverlay.classList.remove('show');
    });
  });
  el.querySelectorAll('.history-item-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      if (confirm('Delete this conversation?')) deleteConversation(id);
    });
  });
}

const historyBtn = document.getElementById('historyBtn');
const historyOverlay = document.getElementById('historyOverlay');
const historyClose = document.getElementById('historyClose');

historyBtn.addEventListener('click', () => {
  renderHistoryList();
  historyOverlay.classList.add('show');
});

historyClose.addEventListener('click', () => {
  historyOverlay.classList.remove('show');
});

historyOverlay.addEventListener('click', (e) => {
  if (e.target === historyOverlay) {
    historyOverlay.classList.remove('show');
  }
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear all messages?')) {
    messagesEl.innerHTML = '';
    settingsOverlay.classList.remove('show');
    sessionStorage.removeItem('chat_history');
    history = [
      { role: 'system', content: 'You are a helpful assistant. Be concise and friendly.' }
    ];
    addMessage('Chat cleared. Ask me anything.', 'bot');
  }
});

newChatBtn.addEventListener('click', () => {
  settingsOverlay.classList.remove('show');
  messagesEl.innerHTML = '';
  sessionStorage.removeItem('chat_history');
  setConvId(null);
  history = [
    { role: 'system', content: 'You are a helpful assistant. Be concise and friendly.' }
  ];
  addMessage('Hello! Ask me anything.', 'bot');
});

downloadBtn.addEventListener('click', () => {
  settingsOverlay.classList.remove('show');
  const msgs = messagesEl.querySelectorAll('.msg');
  const text = Array.from(msgs).map(m => {
    const role = m.classList.contains('bot') ? 'Bot' : 'You';
    const content = m.classList.contains('bot')
      ? m.querySelector('.msg-wrapper')?.textContent?.trim()
      : m.textContent?.replace(m.querySelector('.msg-time')?.textContent || '', '').trim();
    return `[${role}] ${content}`;
  }).join('\n\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `chat-export-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
});

if (restoreSession()) {
  history.filter(m => m.role !== 'system').forEach(m => {
    addMessage(m.content, m.role);
  });
} else if (!API_KEY || API_KEY === '__GROQ_API_KEY__') {
  addMessage(
    'Set your API key in Settings ⚙️ to start chatting.',
    'bot'
  );
} else {
  addMessage('Hello! Ask me anything.', 'bot');
}
