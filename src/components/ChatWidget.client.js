const API_URL = 'https://infoayuda-ai.vercel.app/api/chat';
const STORAGE_KEY = 'iach';

const $ = (id) => document.getElementById(id);
const toggle = $('chatToggle');
const chatWindow = $('chatWindow');
const scrim = $('chatScrim');
const messages = $('chatMessages');
const input = $('chatInput');
const send = $('chatSend');
const close = $('chatClose');
let welcome = $('chatWelcome');
const iconOpen = $('chatIconOpen');
const iconClose = $('chatIconClose');
const badge = $('chatBadge');
const scrollBtn = $('chatScrollBtn');
const clearBtn = $('chatClearBtn');
const confirmOverlay = $('chatConfirmOverlay');
const confirmCancel = $('chatConfirmCancel');
const confirmDelete = $('chatConfirmDelete');

let isOpen = false;
let loading = false;
let history = [];
let unread = 0;

function loadHistory() {
  try { const s = localStorage.getItem(STORAGE_KEY); if (s) history = JSON.parse(s); } catch {}
}
function saveHistory() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-30))); } catch {}
}

function scrollBottom() { requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; }); }

function isNearBottom() {
  const el = messages;
  if (!el) return false;
  return el.scrollHeight - el.scrollTop - el.clientHeight < 60;
}

function onScroll() {
  scrollBtn?.classList.toggle('show', !isNearBottom());
}

function formatAI(text) {
  const escape = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const inline = (s) => escape(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
  const lines = text.split('\n');
  const paragraphs = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line === '') { i++; continue; }
    const listItems = [];
    while (i < lines.length && /^(\s*[-*]\s|\s*\d+[.)]\s)/.test(lines[i])) {
      const li = lines[i].replace(/^(\s*[-*]\s|\s*\d+[.)]\s)/, '');
      listItems.push(`<li>${inline(li)}</li>`);
      i++;
    }
    if (listItems.length) {
      paragraphs.push(`<ul>${listItems.join('')}</ul>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i] !== '' && !/^(\s*[-*]\s|\s*\d+[.)]\s)/.test(lines[i])) {
      para.push(inline(lines[i]));
      i++;
    }
    paragraphs.push(`<p>${para.join('<br>')}</p>`);
  }
  return paragraphs.join('');
}

function getTime() {
  return new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
}

function addGroup(role) {
  const existing = messages?.querySelector('.chat-group:last-child');
  if (existing && existing.classList.contains(role)) return existing;
  const group = document.createElement('div');
  group.className = `chat-group ${role}`;
  const label = document.createElement('div');
  label.className = 'chat-label';
  const name = role === 'user' ? 'Tú' : 'Asistente';
  label.innerHTML = `${name} <span class="chat-label-time">${getTime()}</span>`;
  group.appendChild(label);
  if (welcome?.style.display !== 'none' && welcome?.parentNode === messages) {
    messages?.insertBefore(group, welcome);
  } else {
    messages?.appendChild(group);
  }
  return group;
}

function addMessage(text, role) {
  const group = addGroup(role);
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble-msg';
  if (role === 'ai') {
    bubble.innerHTML = formatAI(text);
  } else {
    bubble.textContent = text;
  }
  group.appendChild(bubble);
  scrollBottom();
}

function showTyping() {
  const group = document.createElement('div');
  group.className = 'chat-group ai';
  group.id = 'chatTypingGroup';
  const label = document.createElement('div');
  label.className = 'chat-label';
  label.innerHTML = `Asistente <span class="chat-label-time">${getTime()}</span>`;
  group.appendChild(label);
  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  group.appendChild(typing);
  messages?.appendChild(group);
  scrollBottom();
}

function hideTyping() {
  const el = document.getElementById('chatTypingGroup');
  if (el) el.remove();
}

function setLoad(state) {
  loading = state; send.disabled = state; input.disabled = state;
}

function autoResize() {
  if (!input) return;
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

async function sendMessage(text) {
  if (!text || loading) return;
  if (!input) return;
  if (!welcome) return;

  input.value = ''; input.style.height = '42px';
  welcome.style.display = 'none';
  addMessage(text, 'user');
  history.push({ role: 'user', content: text });
  setLoad(true);
  showTyping();
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(-10) }),
    });
    const data = await res.json();
    hideTyping();
    if (data.reply) {
      addMessage(data.reply, 'ai');
      history.push({ role: 'assistant', content: data.reply });
    } else {
      addErrorMessage('Lo siento, hubo un error al procesar tu consulta.');
    }
  } catch {
    hideTyping();
    addErrorMessage('Error de conexión. Verifica tu internet e intenta de nuevo.');
  }
  setLoad(false);
  saveHistory();
}

function addErrorMessage(text) {
  const group = document.createElement('div');
  group.className = 'chat-group ai';
  const label = document.createElement('div');
  label.className = 'chat-label';
  label.innerHTML = `Asistente <span class="chat-label-time">${getTime()}</span>`;
  group.appendChild(label);
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble-msg';
  bubble.innerHTML = `<div class="chat-error-msg"><span>${text}</span><button data-retry>Reintentar</button></div>`;
  group.appendChild(bubble);
  messages.appendChild(group);
  scrollBottom();
}

function clearChat() {
  history = [];
  unread = 0;
  saveHistory();
  messages.querySelectorAll('.chat-group').forEach(el => el.remove());
  welcome.style.display = '';
}

function toggleChat(open) {
  isOpen = open !== undefined ? open : !isOpen;
  chatWindow.classList.toggle('open', isOpen);
  scrim.classList.toggle('show', isOpen);
  iconOpen.style.display = isOpen ? 'none' : '';
  iconClose.style.display = isOpen ? '' : 'none';
  if (isOpen) {
    unread = 0;
    badge.classList.remove('show');
    input.focus();
    scrollBottom();
  }
}

messages.addEventListener('scroll', onScroll);

scrollBtn.addEventListener('click', scrollBottom);

toggle.addEventListener('click', () => toggleChat());

scrim.addEventListener('click', () => toggleChat(false));

close.addEventListener('click', () => toggleChat(false));

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isOpen) toggleChat(false);
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(input.value.trim());
  }
});
input.addEventListener('input', autoResize);
send.addEventListener('click', () => sendMessage(input.value.trim()));

clearBtn.addEventListener('click', () => confirmOverlay.classList.add('show'));
confirmCancel.addEventListener('click', () => confirmOverlay.classList.remove('show'));
confirmDelete.addEventListener('click', () => { confirmOverlay.classList.remove('show'); clearChat(); });

loadHistory();
if (history.length > 0) {
  welcome.style.display = 'none';
  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      addMessage(msg.content, msg.role === 'user' ? 'user' : 'ai');
    }
  }
}

messages.addEventListener('click', e => {
  const target = e.target;
  const btn = target?.closest('[data-suggest]');
  if (btn) sendMessage(btn.getAttribute('data-suggest') || '');
  const retry = target?.closest('[data-retry]');
  if (retry) {
    const lastUser = [...history].reverse().find(m => m.role === 'user');
    if (lastUser) sendMessage(lastUser.content);
  }
});
