/**
 * Samskruti Digital Campus Unified Messaging Controller
 * Real-time messaging powered by FastAPI WebSockets with auto-filtering tabs:
 * - Idea Hub Connections
 * - Marketplace Inquiries
 * - Direct Messages
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';
import { wsClient } from '../../js/ws.js';

// Verify student/HOD authentication
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY']);

// Render Left Dock Navigation
if (user) {
  const isHODRole = user?.role === 'HOD' || user?.role === 'HOD_CS' || user?.role === 'ADMIN';
  renderDock('messages.html', isHODRole ? 'HOD' : 'STUDENT');
}

// State
let allConversations = []; // Array of conversation thread summaries
let activeConversation = null; // Currently selected conversation object
let activeFilter = 'ALL';
let searchQuery = '';

const myPin = (user.sbtetPin || user.rollNumber || user.pin || '24259-CS-025').trim().toUpperCase();
const myName = user.name || 'Student';

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupFilterTabs();
  setupSearch();
  setupComposer();
  setupRealtimeWebSocket();
  
  initMessagingWithUrlParams();
});

function setupUserHeader() {
  const subElem = document.getElementById('messages-subtitle');
  if (subElem) {
    subElem.textContent = `Samskruti College (259) • ${myName} (PIN: ${myPin}) • Real-Time Unified Messenger`;
  }
}

/**
 * 0. REAL-TIME WEBSOCKET SUBSCRIPTION
 */
function setupRealtimeWebSocket() {
  wsClient.connect(myPin, myName);

  wsClient.on('NEW_MESSAGE', (payload) => {
    if (!payload?.message) return;
    const msg = payload.message;

    const senderPin = (msg.sender_pin || '').toUpperCase();
    const receiverPin = (msg.receiver_pin || '').toUpperCase();
    const otherPin = senderPin === myPin ? receiverPin : senderPin;

    // Check if this message belongs to the open chat
    if (activeConversation && activeConversation.peerPin === otherPin) {
      appendMessageBubble({
        isMine: senderPin === myPin,
        senderPin: msg.sender_pin,
        text: msg.content,
        time: formatMessageTime(msg.timestamp)
      });
    } else {
      // Background alert
      alerts.info(
        `New Message from ${msg.sender_name || otherPin}`,
        msg.content.substring(0, 60) + (msg.content.length > 60 ? '...' : '')
      );
    }

    // Refresh or update thread list
    updateThreadPreview(otherPin, msg);
  });
}

function updateThreadPreview(otherPin, msg) {
  const existing = allConversations.find(c => c.peerPin === otherPin);
  if (existing) {
    existing.lastMessage = msg.content;
    existing.timestamp = msg.timestamp || new Date().toISOString();
    existing.lastTime = formatMessageTime(existing.timestamp);
    if (!activeConversation || activeConversation.peerPin !== otherPin) {
      existing.unread = true;
    }
    // Move to top of conversations list
    allConversations = [existing, ...allConversations.filter(c => c.peerPin !== otherPin)];
    renderThreadsList();
  } else {
    // Reload full threads
    loadThreads();
  }
}

/**
 * 1. LOAD THREADS FROM BACKEND API
 */
async function loadThreads() {
  try {
    const res = await api.get('/messages/threads', { pin: myPin });
    if (res && res.success && res.threads) {
      const threadsObj = res.threads;
      const combined = [];

      // Combine categorized messages into peer threads
      const allMsgs = [
        ...(threadsObj.idea_hub || []).map(m => ({ ...m, category: 'IDEA_HUB' })),
        ...(threadsObj.marketplace || []).map(m => ({ ...m, category: 'MARKETPLACE' })),
        ...(threadsObj.direct || []).map(m => ({ ...m, category: 'DIRECT' }))
      ];

      // Sort chronological
      allMsgs.sort((a, b) => (a.id || 0) - (b.id || 0));

      // Group by peer
      const peerMap = new Map();
      for (const m of allMsgs) {
        const sender = (m.sender_pin || '').toUpperCase();
        const receiver = (m.receiver_pin || '').toUpperCase();
        const otherPin = sender === myPin ? receiver : sender;
        const otherName = sender === myPin ? (m.receiver_name || otherPin) : (m.sender_name || otherPin);

        if (!peerMap.has(otherPin)) {
          peerMap.set(otherPin, {
            peerPin: otherPin,
            peerName: otherName,
            category: m.category || 'DIRECT',
            productId: m.product_id,
            ideaId: m.idea_id,
            lastMessage: m.content,
            timestamp: m.timestamp,
            lastTime: formatMessageTime(m.timestamp),
            unread: !m.is_read && sender !== myPin
          });
        } else {
          const entry = peerMap.get(otherPin);
          entry.lastMessage = m.content;
          entry.timestamp = m.timestamp;
          entry.lastTime = formatMessageTime(m.timestamp);
          if (m.category) entry.category = m.category;
          if (m.product_id) entry.productId = m.product_id;
          if (!m.is_read && sender !== myPin) entry.unread = true;
        }
      }

      allConversations = Array.from(peerMap.values()).reverse();
    }
  } catch (err) {
    console.error('Failed to load threads:', err);
    allConversations = [];
  }

  renderThreadsList();
}

function renderThreadsList() {
  const container = document.getElementById('threads-container');
  if (!container) return;

  const filtered = allConversations.filter(c => {
    const cat = (c.category || 'DIRECT').toUpperCase();
    const filter = activeFilter.toUpperCase();

    let matchesFilter = false;
    if (filter === 'ALL') {
      matchesFilter = true;
    } else if (filter === 'IDEA_HUB' && (cat.includes('IDEA') || cat.includes('COLLAB'))) {
      matchesFilter = true;
    } else if (filter === 'MARKETPLACE' && (cat.includes('MARKET') || cat.includes('PRODUCT'))) {
      matchesFilter = true;
    } else if (filter === 'DIRECT' && cat === 'DIRECT') {
      matchesFilter = true;
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      c.peerName.toLowerCase().includes(q) ||
      c.peerPin.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 32px 14px; font-style: italic;">
        No conversations found under this tab.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(conv => {
    const isSelected = activeConversation && activeConversation.peerPin === conv.peerPin;
    const initials = (conv.peerName || 'CS').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    const cat = (conv.category || 'DIRECT').toUpperCase();
    let tagClass = 'badge-direct';
    let tagLabel = '💬 Direct Message';

    if (cat.includes('IDEA') || cat.includes('COLLAB')) {
      tagClass = 'badge-collab';
      tagLabel = '💡 Idea Hub';
    } else if (cat.includes('MARKET')) {
      tagClass = 'badge-market';
      tagLabel = '🛍️ Marketplace';
    }

    return `
      <div class="thread-card ${isSelected ? 'active' : ''}" data-peer-pin="${conv.peerPin}">
        <div class="thread-avatar" style="font-weight: 800; font-size: 0.85rem;">${escapeHtml(initials)}</div>
        <div class="thread-info" style="flex: 1; min-width: 0;">
          <div class="thread-top-row" style="display: flex; justify-content: space-between; align-items: baseline;">
            <span class="thread-peer-name" style="font-weight: 700; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(conv.peerName)}</span>
            <span class="thread-time" style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(conv.lastTime || '')}</span>
          </div>
          <span class="thread-context-badge ${tagClass}" style="display: inline-block; font-size: 0.68rem; padding: 1px 6px; border-radius: 4px; margin: 3px 0;">${escapeHtml(tagLabel)}</span>
          <div class="thread-snippet" style="font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(conv.lastMessage || 'Start conversation...')}</div>
        </div>
        ${conv.unread ? `<span class="unread-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: inline-block;"></span>` : ''}
      </div>
    `;
  }).join('');

  container.querySelectorAll('.thread-card').forEach(card => {
    card.addEventListener('click', () => {
      const pin = card.getAttribute('data-peer-pin');
      const conv = allConversations.find(c => c.peerPin === pin);
      if (conv) selectConversation(conv);
    });
  });
}

function setupFilterTabs() {
  const btns = document.querySelectorAll('#thread-filter-bar button');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter') || 'ALL';
      renderThreadsList();
    });
  });
}

function setupSearch() {
  const input = document.getElementById('thread-search-input');
  input?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderThreadsList();
  });
}

/**
 * 2. SELECT & LOAD ACTIVE CONVERSATION
 */
async function selectConversation(conv) {
  activeConversation = conv;
  conv.unread = false;
  renderThreadsList();

  const emptyView = document.getElementById('empty-chat-view');
  const liveView = document.getElementById('live-chat-view');
  if (emptyView) emptyView.style.display = 'none';
  if (liveView) liveView.style.display = 'flex';

  // Render chat header
  const initials = (conv.peerName || 'CS').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const avatarElem = document.getElementById('active-peer-avatar');
  const nameElem = document.getElementById('active-peer-name');
  const subElem = document.getElementById('active-peer-sub');
  const badgeIcon = document.getElementById('context-badge-icon');
  const badgeText = document.getElementById('context-badge-text');

  if (avatarElem) avatarElem.textContent = initials;
  if (nameElem) nameElem.textContent = conv.peerName;
  if (subElem) subElem.textContent = `PIN: ${conv.peerPin}`;

  const cat = (conv.category || 'DIRECT').toUpperCase();
  if (badgeIcon && badgeText) {
    if (cat.includes('IDEA')) {
      badgeIcon.textContent = '💡';
      badgeText.textContent = `Idea Hub Collaboration`;
    } else if (cat.includes('MARKET')) {
      badgeIcon.textContent = '🛍️';
      badgeText.textContent = conv.contextTitle ? `Market: ${conv.contextTitle}` : `Marketplace Exchange`;
    } else {
      badgeIcon.textContent = '💬';
      badgeText.textContent = `Direct Message`;
    }
  }

  await loadConversationHistory(conv.peerPin);

  // Focus input
  document.getElementById('chat-composer-input')?.focus();
}

async function loadConversationHistory(otherPin) {
  const container = document.getElementById('active-messages-stream');
  if (!container) return;

  container.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">Loading chat history...</div>`;

  try {
    const res = await api.get('/messages/history', { user_pin: myPin, other_pin: otherPin });
    if (res && res.success && Array.isArray(res.messages)) {
      if (res.messages.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 36px 16px; color: var(--text-muted); font-size: 0.85rem;">
            No messages exchanged yet. Send a message below to connect!
          </div>
        `;
        return;
      }

      container.innerHTML = res.messages.map(m => {
        const isMine = (m.sender_pin || '').toUpperCase() === myPin;
        return `
          <div class="msg-bubble ${isMine ? 'mine' : 'peer'}" style="margin: 6px 0; max-width: 75%; ${isMine ? 'margin-left: auto; text-align: right;' : 'margin-right: auto; text-align: left;'}">
            <div style="padding: 10px 14px; border-radius: 12px; background: ${isMine ? 'var(--primary-color, #4f46e5)' : 'var(--bg-secondary, #e2e8f0)'}; color: ${isMine ? '#ffffff' : 'var(--text-main)'}; font-size: 0.88rem; box-shadow: var(--shadow-subtle);">
              ${escapeHtml(m.content)}
            </div>
            <div class="msg-meta" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 3px; padding: 0 4px;">
              ${escapeHtml(formatMessageTime(m.timestamp))}
            </div>
          </div>
        `;
      }).join('');

      container.scrollTop = container.scrollHeight;
    }
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 20px;">Could not load messages: ${err.message}</div>`;
  }
}

function appendMessageBubble({ isMine, text, time }) {
  const container = document.getElementById('active-messages-stream');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${isMine ? 'mine' : 'peer'}`;
  bubble.style.cssText = `margin: 6px 0; max-width: 75%; ${isMine ? 'margin-left: auto; text-align: right;' : 'margin-right: auto; text-align: left;'}`;
  bubble.innerHTML = `
    <div style="padding: 10px 14px; border-radius: 12px; background: ${isMine ? 'var(--primary-color, #4f46e5)' : 'var(--bg-secondary, #e2e8f0)'}; color: ${isMine ? '#ffffff' : 'var(--text-main)'}; font-size: 0.88rem; box-shadow: var(--shadow-subtle);">
      ${escapeHtml(text)}
    </div>
    <div class="msg-meta" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 3px; padding: 0 4px;">
      ${escapeHtml(time)}
    </div>
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

/**
 * 3. COMPOSER & SEND MESSAGE
 */
function setupComposer() {
  const form = document.getElementById('chat-composer-form');
  const input = document.getElementById('chat-composer-input');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text || !activeConversation) return;

    input.value = '';
    const nowTs = new Date().toISOString();
    const timeFormatted = formatMessageTime(nowTs);

    // Optimistic UI append
    appendMessageBubble({
      isMine: true,
      text,
      time: timeFormatted
    });

    // Send directly over WebSocket
    const sent = wsClient.send({
      type: 'SEND_MESSAGE',
      receiver_pin: activeConversation.peerPin,
      content: text,
      category: activeConversation.category || 'DIRECT',
      product_id: activeConversation.productId,
      idea_id: activeConversation.ideaId
    });

    // Update conversation state preview
    activeConversation.lastMessage = text;
    activeConversation.timestamp = nowTs;
    activeConversation.lastTime = timeFormatted;
    renderThreadsList();
  });
}

/**
 * 4. URL PARAMETERS HANDOVER
 */
async function initMessagingWithUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  const chatWith = urlParams.get('chatWith');
  const peerName = urlParams.get('peerName') || chatWith || 'Campus Peer';
  const itemId = urlParams.get('item');
  const itemTitle = urlParams.get('title') || '';
  const itemPrice = urlParams.get('price') || '';

  // Select tab if provided
  if (tab) {
    activeFilter = tab.toUpperCase();
    const btn = document.querySelector(`#thread-filter-bar button[data-filter="${activeFilter}"]`);
    if (btn) {
      document.querySelectorAll('#thread-filter-bar button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  }

  await loadThreads();

  if (chatWith) {
    const cleanPeerPin = chatWith.trim().toUpperCase();
    let conv = allConversations.find(c => c.peerPin === cleanPeerPin);

    if (!conv) {
      // Create fresh conversation object
      conv = {
        peerPin: cleanPeerPin,
        peerName: peerName,
        category: (tab && tab.toUpperCase().includes('MARKET')) || itemId ? 'MARKETPLACE' : ((tab && tab.toUpperCase().includes('IDEA')) ? 'IDEA_HUB' : 'DIRECT'),
        productId: itemId ? parseInt(itemId, 10) : null,
        contextTitle: itemTitle ? `${itemTitle}${itemPrice ? ` (₹${itemPrice})` : ''}` : null,
        lastMessage: 'Starting conversation...',
        timestamp: new Date().toISOString(),
        lastTime: 'Just now',
        unread: false
      };
      allConversations.unshift(conv);
      renderThreadsList();
    } else {
      if (itemId) conv.productId = parseInt(itemId, 10);
      if (itemTitle) conv.contextTitle = `${itemTitle}${itemPrice ? ` (₹${itemPrice})` : ''}`;
    }

    selectConversation(conv);
  } else if (allConversations.length > 0 && !activeConversation) {
    selectConversation(allConversations[0]);
  }
}

function formatMessageTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
