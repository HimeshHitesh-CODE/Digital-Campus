/**
 * Samskruti Digital Campus Unified Messaging Controller
 * Handles conversation discovery, marketplace & collaboration handovers, and real-time chatting.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

// Verify student/HOD authentication
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY']) || {
  name: 'Student User',
  rollNumber: '24259-CS-025',
  sbtetPin: '24259-CS-025',
  department: 'Computer Science & Engineering',
};

// Render Left Dock Navigation
const isHODRole = user?.role === 'HOD' || user?.role === 'HOD_CS' || user?.role === 'ADMIN';
renderDock('messages.html', isHODRole ? 'HOD' : 'STUDENT');

// State
let allThreads = [];
let activeThread = null;
let activeFilter = 'ALL';
let searchQuery = '';
let messagePollingTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupFilterTabs();
  setupSearch();
  setupComposer();
  
  initMessagingWithUrlParams();
});

function setupUserHeader() {
  const pin = user.sbtetPin || user.rollNumber || '24259-XX-XXX';
  const subElem = document.getElementById('messages-subtitle');
  if (subElem) {
    subElem.textContent = `Samskruti College (259) • ${user.name || 'Student'} (PIN: ${pin}) • Real-Time Messenger`;
  }
}

/**
 * Handle URL Parameter Direct Handovers:
 * 1. messages.html?chatWith={sellerPin}&item={itemId}
 * 2. messages.html?chatWith={peerPin}&collabId={collabId}
 * 3. messages.html?threadId={threadId}
 */
async function initMessagingWithUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const chatWith = urlParams.get('chatWith');
  const itemId = urlParams.get('item');
  const collabId = urlParams.get('collabId');
  const directThreadId = urlParams.get('threadId');

  // First load all user threads
  await loadThreads();

  if (chatWith) {
    const isMarket = !!itemId;
    const itemTitle = urlParams.get('title') || (isMarket ? 'Marketplace Listing' : 'Project Collaboration');
    const itemPrice = urlParams.get('price') || '';

    try {
      const res = await api.request('/messages/thread', {
        method: 'POST',
        body: {
          senderPin: user.sbtetPin || user.rollNumber,
          senderName: user.name,
          senderBranch: user.department,
          peerPin: chatWith,
          peerName: urlParams.get('peerName') || 'Campus Student',
          type: isMarket ? 'MARKET' : 'COLLAB',
          contextTitle: itemTitle,
          itemId,
          collabId,
          price: itemPrice
        }
      });

      if (res && res.success && res.thread) {
        await loadThreads();
        selectThread(res.thread);
        return;
      }
    } catch (err) {
      console.warn('[Handover Error]:', err);
    }
  } else if (directThreadId) {
    const found = allThreads.find(t => t.id === directThreadId);
    if (found) {
      selectThread(found);
      return;
    }
  }

  // If there are threads and none selected, auto-select first
  if (allThreads.length > 0 && !activeThread) {
    selectThread(allThreads[0]);
  }
}

/**
 * 1. LOAD CONVERSATION THREADS
 */
async function loadThreads() {
  const pin = (user.sbtetPin || user.rollNumber || '').trim().toUpperCase();
  try {
    const res = await api.get('/messages/threads', { pin });
    if (res && res.success && Array.isArray(res.threads)) {
      allThreads = res.threads;
    } else {
      allThreads = [];
    }
  } catch {
    allThreads = [];
  }

  renderThreadsList();
}

function renderThreadsList() {
  const container = document.getElementById('threads-container');
  if (!container) return;

  const filtered = allThreads.filter(t => {
    const matchesFilter = activeFilter === 'ALL' || t.type === activeFilter;
    const peerName = t.peer?.name || '';
    const title = t.context?.title || '';
    const lastMsg = t.lastMessage || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = !query ||
      peerName.toLowerCase().includes(query) ||
      title.toLowerCase().includes(query) ||
      lastMsg.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 0.82rem; padding: 24px 12px; font-style: italic;">
        No conversation threads found. Connect via Idea Hub or Marketplace to start chatting!
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(thread => {
    const isSelected = activeThread && activeThread.id === thread.id;
    const peerName = thread.peer?.name || 'Campus Student';
    const initials = peerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const isCollab = thread.type === 'COLLAB';
    const tagClass = isCollab ? 'badge-collab' : 'badge-market';
    const tagLabel = isCollab ? `💡 ${thread.context?.title || 'Idea Collab'}` : `🛍️ ${thread.context?.title || 'Market Item'}`;

    return `
      <div class="thread-card ${isSelected ? 'active' : ''}" data-thread-id="${thread.id}">
        <div class="thread-avatar">${escapeHtml(initials)}</div>
        <div class="thread-info">
          <div class="thread-top-row">
            <span class="thread-peer-name">${escapeHtml(peerName)}</span>
            <span class="thread-time">${escapeHtml(thread.lastTime || '')}</span>
          </div>
          <span class="thread-context-badge ${tagClass}">${escapeHtml(tagLabel)}</span>
          <div class="thread-snippet">${escapeHtml(thread.lastMessage || 'Click to view messages...')}</div>
        </div>
        ${thread.unread ? `<span class="unread-dot"></span>` : ''}
      </div>
    `;
  }).join('');

  container.querySelectorAll('.thread-card').forEach(card => {
    card.addEventListener('click', () => {
      const threadId = card.getAttribute('data-thread-id');
      const thread = allThreads.find(t => t.id === threadId);
      if (thread) selectThread(thread);
    });
  });
}

function setupFilterTabs() {
  const btns = document.querySelectorAll('#thread-filter-bar button');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
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
 * 2. SELECT & LOAD ACTIVE THREAD
 */
async function selectThread(thread) {
  activeThread = thread;
  renderThreadsList();

  const emptyView = document.getElementById('empty-chat-view');
  const liveView = document.getElementById('live-chat-view');
  if (emptyView) emptyView.style.display = 'none';
  if (liveView) liveView.style.display = 'flex';

  // Render header
  const peerName = thread.peer?.name || 'Campus Student';
  const peerPin = thread.peer?.pin || '';
  const initials = peerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const isCollab = thread.type === 'COLLAB';

  const avatarElem = document.getElementById('active-peer-avatar');
  const nameElem = document.getElementById('active-peer-name');
  const subElem = document.getElementById('active-peer-sub');
  const badgeIcon = document.getElementById('context-badge-icon');
  const badgeText = document.getElementById('context-badge-text');

  if (avatarElem) avatarElem.textContent = initials;
  if (nameElem) nameElem.textContent = peerName;
  if (subElem) subElem.textContent = `PIN: ${peerPin} • ${thread.peer?.branch || 'Student'}`;
  if (badgeIcon) badgeIcon.textContent = isCollab ? '💡' : '🛍️';
  if (badgeText) badgeText.textContent = isCollab
    ? `Collab: ${thread.context?.title || 'Project'}`
    : `Listing: ${thread.context?.title || 'Item'}${thread.context?.price ? ` (₹${thread.context.price})` : ''}`;

  await loadMessagesForActiveThread();

  // Start polling
  if (messagePollingTimer) clearInterval(messagePollingTimer);
  messagePollingTimer = setInterval(() => loadMessagesForActiveThread(true), 3000);
}

async function loadMessagesForActiveThread(silent = false) {
  if (!activeThread) return;

  const container = document.getElementById('active-messages-stream');
  if (!container) return;

  try {
    const res = await api.get(`/messages/thread/${activeThread.id}`);
    if (res && res.success && Array.isArray(res.messages)) {
      renderMessages(res.messages);
    }
  } catch (err) {
    if (!silent) console.warn('[Load Messages Error]:', err);
  }
}

function renderMessages(messages) {
  const container = document.getElementById('active-messages-stream');
  if (!container) return;

  const myPin = (user.sbtetPin || user.rollNumber || '').trim().toUpperCase();

  container.innerHTML = messages.map(msg => {
    if (msg.isSystem || msg.senderPin === 'SYSTEM') {
      return `
        <div class="msg-bubble system">
          <span>${escapeHtml(msg.text)}</span>
        </div>
      `;
    }

    const isMine = (msg.senderPin || '').trim().toUpperCase() === myPin;
    return `
      <div class="msg-bubble ${isMine ? 'mine' : 'peer'}">
        <div>${escapeHtml(msg.text)}</div>
        <div class="msg-meta">${escapeHtml(msg.time || '')}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

/**
 * 3. MESSAGE COMPOSER & SENDING
 */
function setupComposer() {
  const form = document.getElementById('chat-composer-form');
  const input = document.getElementById('chat-composer-input');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text || !activeThread) return;

    input.value = '';
    const myPin = (user.sbtetPin || user.rollNumber || '').trim().toUpperCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Optimistic UI append
    const stream = document.getElementById('active-messages-stream');
    if (stream) {
      const bubble = document.createElement('div');
      bubble.className = 'msg-bubble mine';
      bubble.innerHTML = `
        <div>${escapeHtml(text)}</div>
        <div class="msg-meta">${timeStr}</div>
      `;
      stream.appendChild(bubble);
      stream.scrollTop = stream.scrollHeight;
    }

    try {
      await api.request('/messages/send', {
        method: 'POST',
        body: {
          threadId: activeThread.id,
          senderPin: myPin,
          senderName: user.name || 'Student',
          text
        }
      });
      // Refresh thread preview
      loadThreads();
    } catch (err) {
      alerts.error('Failed to send', 'Please check your connection.');
    }
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
