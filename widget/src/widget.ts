import EchoLib from 'laravel-echo';
import Pusher from 'pusher-js';
type EchoInstance = InstanceType<typeof EchoLib>;
const Echo = EchoLib;

// ─── Types ─────────────────────────────────────────────────────────────────

interface WidgetConfig {
  apiKey: string;
  apiUrl?: string;
  reverbHost?: string;
  reverbPort?: number;
  reverbKey?: string;
  reverbScheme?: string;
  visitorEmail?: string;
  visitorName?: string;
  color?: string;
}

interface Message {
  id: number;
  sender_type: 'agent' | 'contact' | 'system';
  content: string;
  is_private: boolean;
  created_at: string;
  sender?: { name: string; avatar?: string } | null;
}

interface ServerConfig {
  color: string;
  position: string;
  greeting: string;
  agent_label: string;
  show_branding: boolean;
}

// ─── State ─────────────────────────────────────────────────────────────────

let cfg: WidgetConfig;
let sessionToken: string | null = null;
let conversationId: number | null = null;
let widgetConfig: ServerConfig | null = null;
let onlineAgents = 0;
let echo: EchoInstance | null = null;
let isOpen = false;
let typingTimer: ReturnType<typeof setTimeout> | null = null;

// ─── DOM references ─────────────────────────────────────────────────────────

let bubble: HTMLElement;
let chatWindow: HTMLElement;
let messagesEl: HTMLElement;
let inputEl: HTMLTextAreaElement;
let sendBtn: HTMLButtonElement;
let typingEl: HTMLElement;
// formEl kept for potential future use
let _formEl: HTMLElement | null = null;

// ─── API helpers ─────────────────────────────────────────────────────────────

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const apiUrl = cfg.apiUrl ?? 'http://localhost:8000/api';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Widget-Key': cfg.apiKey,
    ...extraHeaders,
  };
  if (sessionToken) headers['X-Session-Token'] = sessionToken;

  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204) return {} as T;
  return res.json();
}

// ─── Initialize session ───────────────────────────────────────────────────────

async function initSession() {
  const data = await apiRequest<{
    session_token: string;
    widget_config: ServerConfig;
    online_agents: number;
    contact?: unknown;
  }>('POST', '/widget/init', {
    email: cfg.visitorEmail,
    name: cfg.visitorName,
    current_url: window.location.href,
    referrer: document.referrer,
  });

  sessionToken = data.session_token;
  widgetConfig = data.widget_config;
  onlineAgents = data.online_agents;

  // Apply color override
  const color = cfg.color ?? widgetConfig?.color ?? '#6366f1';
  applyColor(color);

  // Restore from localStorage
  const stored = localStorage.getItem('rh_conv_' + cfg.apiKey);
  if (stored) {
    const parsed = JSON.parse(stored);
    conversationId = parsed.id;
    sessionToken = parsed.session ?? sessionToken;
  }
}

// ─── Echo / real-time setup ──────────────────────────────────────────────────

function connectEcho() {
  if (!conversationId) return;
  (window as unknown as { Pusher: unknown }).Pusher = Pusher;

  echo = new Echo({
    broadcaster: 'reverb',
    key: cfg.reverbKey ?? 'replyhub-key',
    wsHost: cfg.reverbHost ?? 'localhost',
    wsPort: cfg.reverbPort ?? 8080,
    wssPort: cfg.reverbPort ?? 8080,
    forceTLS: (cfg.reverbScheme ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    authEndpoint: `${cfg.apiUrl ?? 'http://localhost:8000/api'}/broadcasting/auth`,
    auth: { headers: { 'X-Widget-Key': cfg.apiKey, 'X-Session-Token': sessionToken! } },
  });

  echo.channel(`conversation.${conversationId}`)
    .listen('.MessageSent', (e: { message: Message }) => {
      if (e.message.sender_type !== 'contact') {
        appendMessage(e.message);
        clearTypingIndicator();
        if (!isOpen) showUnreadDot();
      }
    })
    .listen('.TypingIndicator', (e: { sender_type: string; is_typing: boolean }) => {
      if (e.sender_type === 'agent') {
        if (e.is_typing) showTypingIndicator();
        else clearTypingIndicator();
      }
    });
}

// Called on page unload if needed
function disconnectEcho() { // eslint-disable-line @typescript-eslint/no-unused-vars
  if (echo && conversationId) {
    echo.leave(`conversation.${conversationId}`);
    echo = null;
  }
}

// ─── UI Building ─────────────────────────────────────────────────────────────

const STYLES = `
  #rh-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  #rh-bubble {
    position: fixed; z-index: 2147483646; cursor: pointer;
    width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 24px rgba(0,0,0,0.25);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: none; outline: none;
  }
  #rh-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 32px rgba(0,0,0,0.35); }
  #rh-bubble svg { width: 26px; height: 26px; }
  #rh-unread-dot {
    position: absolute; top: 0; right: 0;
    width: 14px; height: 14px; border-radius: 50%;
    background: #ef4444; border: 2px solid #fff;
    display: none;
  }
  #rh-window {
    position: fixed; z-index: 2147483645;
    width: 360px; height: 520px;
    background: #1a1a24; border-radius: 20px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    display: flex; flex-direction: column;
    overflow: hidden; border: 1px solid rgba(255,255,255,0.08);
    transform: scale(0.95) translateY(10px); opacity: 0;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
    pointer-events: none;
  }
  #rh-window.rh-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
  #rh-header { padding: 16px; display: flex; align-items: center; gap: 12px; }
  #rh-header-title { font-size: 15px; font-weight: 700; color: #fff; }
  #rh-header-subtitle { font-size: 12px; opacity: 0.7; color: #fff; }
  #rh-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  #rh-messages::-webkit-scrollbar { width: 4px; }
  #rh-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .rh-msg { max-width: 78%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-break: break-word; }
  .rh-msg-agent { background: rgba(255,255,255,0.08); color: #e2e8f0; border-radius: 16px 16px 16px 4px; align-self: flex-start; }
  .rh-msg-contact { color: #fff; border-radius: 16px 16px 4px 16px; align-self: flex-end; }
  .rh-msg-system { background: transparent; color: #6b7280; font-size: 12px; text-align: center; align-self: center; font-style: italic; }
  .rh-msg-time { font-size: 10px; opacity: 0.5; margin-top: 4px; }
  #rh-typing { display: none; align-items: center; gap: 8px; padding: 4px 0; }
  #rh-typing span { display: flex; gap: 4px; align-items: center; }
  .rh-dot { width: 6px; height: 6px; border-radius: 50%; background: #6b7280; animation: rh-bounce 1.2s infinite; }
  .rh-dot:nth-child(2) { animation-delay: 0.2s; }
  .rh-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes rh-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
  #rh-form { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06); }
  #rh-collect-form { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  #rh-collect-form input {
    width: 100%; padding: 10px 14px; border-radius: 10px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    color: #e2e8f0; font-size: 14px; outline: none;
  }
  #rh-collect-form input:focus { border-color: rgba(255,255,255,0.25); }
  #rh-compose { display: flex; gap: 8px; align-items: flex-end; }
  #rh-input {
    flex: 1; padding: 10px 14px; border-radius: 12px; resize: none;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    color: #e2e8f0; font-size: 14px; outline: none; max-height: 120px;
    line-height: 1.4; font-family: inherit;
  }
  #rh-input:focus { border-color: rgba(255,255,255,0.25); }
  #rh-send {
    width: 38px; height: 38px; border-radius: 10px; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; transition: opacity 0.15s;
  }
  #rh-send:disabled { opacity: 0.4; cursor: default; }
  #rh-branding { padding: 6px 16px; text-align: center; font-size: 11px; color: rgba(255,255,255,0.25); }
  #rh-branding a { color: rgba(255,255,255,0.35); text-decoration: none; }
  #rh-status { font-size: 12px; color: rgba(255,255,255,0.6); }
  .rh-btn {
    padding: 10px; border-radius: 10px; border: none; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: opacity 0.15s; color: #fff;
  }
  .rh-btn:hover { opacity: 0.85; }
`;

function buildWidget() {
  const color = cfg.color ?? widgetConfig?.color ?? '#6366f1';
  const pos = widgetConfig?.position ?? 'bottom-right';
  const isLeft = pos === 'bottom-left';
  const posCSS = isLeft ? 'left: 20px;' : 'right: 20px;';

  const wrapper = document.createElement('div');
  wrapper.id = 'rh-widget';

  const style = document.createElement('style');
  style.textContent = STYLES + `
    #rh-bubble { ${posCSS} bottom: 20px; background: ${color}; }
    #rh-window { ${isLeft ? 'left: 20px;' : 'right: 20px;'} bottom: 88px; }
    .rh-msg-contact { background: ${color}; }
    #rh-send { background: ${color}; color: #fff; }
    .rh-btn { background: ${color}; }
  `;
  wrapper.appendChild(style);

  bubble = document.createElement('button');
  bubble.id = 'rh-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#fff">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span id="rh-unread-dot"></span>
  `;
  bubble.addEventListener('click', toggleWidget);
  wrapper.appendChild(bubble);

  chatWindow = document.createElement('div');
  chatWindow.id = 'rh-window';
  chatWindow.setAttribute('role', 'dialog');
  chatWindow.setAttribute('aria-label', 'Chat support');

  chatWindow.innerHTML = buildWindowHTML();
  wrapper.appendChild(chatWindow);

  document.body.appendChild(wrapper);

  // Cache DOM refs
  messagesEl = document.getElementById('rh-messages')!;
  typingEl = document.getElementById('rh-typing')!;
  _formEl = document.getElementById('rh-form');
  inputEl = document.getElementById('rh-input') as HTMLTextAreaElement;
  sendBtn = document.getElementById('rh-send') as HTMLButtonElement;

  // Wire up events
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    inputEl.addEventListener('input', handleTyping);
  }
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  const collectForm = document.getElementById('rh-collect-submit');
  if (collectForm) collectForm.addEventListener('click', handleCollectSubmit);
}

function buildWindowHTML(): string {
  const greeting = widgetConfig?.greeting ?? 'Hi there! How can we help you today?';
  const agentLabel = widgetConfig?.agent_label ?? 'Support Team';
  const showBranding = widgetConfig?.show_branding ?? true;
  const color = cfg.color ?? widgetConfig?.color ?? '#6366f1';
  const statusText = onlineAgents > 0 ? `${onlineAgents} agent${onlineAgents > 1 ? 's' : ''} online` : 'We\'ll reply soon';

  return `
    <div id="rh-header" style="background: ${color}">
      <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </div>
      <div>
        <div id="rh-header-title">${agentLabel}</div>
        <div id="rh-header-subtitle" id="rh-status">${statusText}</div>
      </div>
      <button onclick="document.getElementById('rh-window').classList.remove('rh-open')"
        style="margin-left:auto;background:none;border:none;color:rgba(255,255,255,0.7);cursor:pointer;font-size:18px;padding:4px;">×</button>
    </div>

    <div id="rh-messages">
      <div class="rh-msg rh-msg-agent">
        ${greeting}
        <div class="rh-msg-time">${agentLabel}</div>
      </div>
      <div id="rh-typing">
        <span>
          <div class="rh-dot"></div>
          <div class="rh-dot"></div>
          <div class="rh-dot"></div>
        </span>
      </div>
    </div>

    <div id="rh-form">
      ${conversationId ? buildComposeHTML() : buildCollectHTML()}
    </div>

    ${showBranding ? '<div id="rh-branding">Powered by <a href="https://replyhub.io" target="_blank">ReplyHub</a></div>' : ''}
  `;
}

function buildCollectHTML(): string {
  return `
    <div id="rh-collect-form">
      <input id="rh-collect-name" type="text" placeholder="Your name (optional)" />
      <input id="rh-collect-email" type="email" placeholder="Your email (optional)" />
      <textarea id="rh-input" placeholder="Type your message..." rows="2"
        style="width:100%;padding:10px 14px;border-radius:12px;resize:none;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;font-size:14px;outline:none;"></textarea>
      <button id="rh-collect-submit" class="rh-btn" style="width:100%">Start chat</button>
    </div>
  `;
}

function buildComposeHTML(): string {
  return `
    <div id="rh-compose">
      <textarea id="rh-input" placeholder="Type a message... (Enter to send)" rows="1"
        style="flex:1;padding:10px 14px;border-radius:12px;resize:none;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;font-size:14px;outline:none;max-height:120px;line-height:1.4;font-family:inherit;"></textarea>
      <button id="rh-send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  `;
}

// ─── Widget open/close ────────────────────────────────────────────────────────

function toggleWidget() {
  isOpen = !isOpen;
  chatWindow.classList.toggle('rh-open', isOpen);
  hideUnreadDot();

  if (isOpen && conversationId && !echo) {
    connectEcho();
    loadMessages();
  }
}

// ─── Collect form submission ──────────────────────────────────────────────────

async function handleCollectSubmit() {
  const nameInput = document.getElementById('rh-collect-name') as HTMLInputElement;
  const emailInput = document.getElementById('rh-collect-email') as HTMLInputElement;
  const msgInput = document.getElementById('rh-input') as HTMLTextAreaElement;

  const name = nameInput?.value?.trim();
  const email = emailInput?.value?.trim();
  const content = msgInput?.value?.trim();

  if (!content) { msgInput?.focus(); return; }

  const btn = document.getElementById('rh-collect-submit') as HTMLButtonElement;
  if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }

  try {
    const data = await apiRequest<{ conversation_id: number; status: string; message: { content: string } }>(
      'POST', '/widget/conversations',
      { message: content, email: email || undefined, name: name || undefined }
    );

    conversationId = data.conversation_id;
    localStorage.setItem('rh_conv_' + cfg.apiKey, JSON.stringify({ id: conversationId, session: sessionToken }));

    // Rebuild form to compose mode
    const formEl2 = document.getElementById('rh-form')!;
    formEl2.innerHTML = buildComposeHTML();

    // Re-wire
    inputEl = document.getElementById('rh-input') as HTMLTextAreaElement;
    sendBtn = document.getElementById('rh-send') as HTMLButtonElement;
    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    inputEl?.addEventListener('input', handleTyping);
    sendBtn?.addEventListener('click', sendMessage);

    // Show visitor message
    appendMessage({
      id: Date.now(), sender_type: 'contact',
      content, is_private: false,
      created_at: new Date().toISOString(),
    });

    if (data.status === 'pending') {
      appendSystemMessage('No agents are available right now. We\'ve saved your message as a ticket and will reply by email.');
    }

    connectEcho();
  } catch {
    if (btn) { btn.textContent = 'Start chat'; btn.disabled = false; }
  }
}

// ─── Send message ─────────────────────────────────────────────────────────────

async function sendMessage() {
  const content = inputEl?.value?.trim();
  if (!content || !conversationId) return;

  inputEl.value = '';
  sendBtn.disabled = true;

  appendMessage({
    id: Date.now(), sender_type: 'contact',
    content, is_private: false, created_at: new Date().toISOString(),
  });

  try {
    await apiRequest('POST', `/widget/conversations/${conversationId}/messages`, { content });
  } catch {
    // message failed — in production: show error state
  } finally {
    sendBtn.disabled = false;
    inputEl?.focus();
  }
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function handleTyping() {
  if (!conversationId) return;
  apiRequest('POST', `/widget/conversations/${conversationId}/typing`, { is_typing: true }).catch(() => {});
  if (typingTimer) clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    apiRequest('POST', `/widget/conversations/${conversationId}/typing`, { is_typing: false }).catch(() => {});
  }, 3000);
}

function showTypingIndicator() {
  if (typingEl) { typingEl.style.display = 'flex'; scrollToBottom(); }
}

function clearTypingIndicator() {
  if (typingEl) typingEl.style.display = 'none';
}

// ─── Messages ─────────────────────────────────────────────────────────────────

async function loadMessages() {
  if (!conversationId) return;
  try {
    const messages = await apiRequest<Message[]>('GET', `/widget/conversations/${conversationId}/messages`);
    messagesEl.innerHTML = '';
    messages.forEach((m) => { if (!m.is_private) appendMessage(m); });
  } catch {}
}

function appendMessage(msg: Message) {
  const existing = document.getElementById(`rh-msg-${msg.id}`);
  if (existing) return;

  const el = document.createElement('div');
  el.id = `rh-msg-${msg.id}`;

  if (msg.sender_type === 'system') {
    el.className = 'rh-msg rh-msg-system';
    el.textContent = msg.content;
  } else {
    el.className = `rh-msg ${msg.sender_type === 'agent' ? 'rh-msg-agent' : 'rh-msg-contact'}`;
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    el.innerHTML = `
      ${escapeHTML(msg.content)}
      <div class="rh-msg-time">${msg.sender_type === 'agent' && msg.sender?.name ? msg.sender.name + ' · ' : ''}${time}</div>
    `;
  }

  messagesEl.insertBefore(el, typingEl);
  scrollToBottom();
}

function appendSystemMessage(text: string) {
  appendMessage({ id: Date.now(), sender_type: 'system', content: text, is_private: false, created_at: new Date().toISOString() });
}

function scrollToBottom() {
  setTimeout(() => {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }, 50);
}

function showUnreadDot() {
  const dot = document.getElementById('rh-unread-dot');
  if (dot) dot.style.display = 'block';
}

function hideUnreadDot() {
  const dot = document.getElementById('rh-unread-dot');
  if (dot) dot.style.display = 'none';
}

function applyColor(color: string) {
  const existing = document.getElementById('rh-color-style');
  if (existing) existing.remove();
  const style = document.createElement('style');
  style.id = 'rh-color-style';
  style.textContent = `
    #rh-bubble { background: ${color} !important; }
    .rh-msg-contact { background: ${color} !important; }
    #rh-send { background: ${color} !important; }
    .rh-btn { background: ${color} !important; }
    #rh-header { background: ${color} !important; }
  `;
  document.head.appendChild(style);
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function init() {
  const globalCfg = (window as Window & { ReplyHubConfig?: WidgetConfig }).ReplyHubConfig;
  if (!globalCfg?.apiKey) {
    console.warn('[ReplyHub] Missing ReplyHubConfig.apiKey');
    return;
  }
  cfg = globalCfg;

  try {
    await initSession();
    buildWidget();

    // Activity ping every 60s
    setInterval(() => {
      apiRequest('POST', '/widget/activity', { current_url: window.location.href }).catch(() => {});
    }, 60_000);

    // If returning visitor has a conversation open, connect echo
    if (conversationId && echo === null) {
      connectEcho();
    }
  } catch (err) {
    console.error('[ReplyHub] Failed to initialize widget:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
