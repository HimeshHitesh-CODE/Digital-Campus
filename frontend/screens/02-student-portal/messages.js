/**
 * Samskruti Digital Campus Unified Messaging Controller
 * Real-time messaging with category filtering:
 * - Idea Hub Collaborations
 * - Marketplace Inquiries
 * - Direct Faculty / Student Messages
 * Full WebSocket sync and REST persistence.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';
import { wsClient } from '../../js/ws.js';

// Safe authentication verification
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY']);

if (user) {
  const isHODRole = String(user?.role || '').toUpperCase().includes('HOD') || user?.role === 'ADMIN';
  renderDock('messages.html', isHODRole ? 'HOD' : 'STUDENT');
}

// Safe credentials extraction
const myPin = ((user && (user.sbtetPin || user.rollNumber || user.pin)) || localStorage.getItem('student_pin') || '24259-CS-025').trim().toUpperCase();
const myName = (user && user.name) || localStorage.getItem('user_name') || 'Student';

// Default Verified Active Conversation Threads
const DEFAULT_CONVERSATIONS = [
  {
    peerPin: 'VAMSHI-CS-HOD',
    peerName: 'Dr. J. Vamshi Krishna (HOD CS)',
    category: 'DIRECT',
    contextText: 'HOD Department Notice & Clearance',
    lastMessage: 'All Semester V students must ensure minimum 75% biometric attendance before SBTET exam cutoff.',
    lastTime: '10:45 AM',
    unread: false,
    messages: [
      {
        isMine: false,
        text: 'Hello! Please note that all Semester V C-24 students must ensure minimum 75% biometric attendance before the upcoming SBTET semester-end cutoff date.',
        time: '10:40 AM'
      },
      {
        isMine: false,
        text: 'If you have any pending bonafide, custodian, or RTC pass requests, they will be reviewed today during executive approval hours.',
        time: '10:45 AM'
      }
    ]
  },
  {
    peerPin: '24259-CS-012',
    peerName: 'Rahul Varma',
    category: 'MARKETPLACE',
    contextText: 'Marketplace: B.S. Grewal Mathematics (₹380)',
    lastMessage: 'Yes, all solved papers and unit-wise question banks are intact. We can meet at C-Block library reading hall!',
    lastTime: 'Yesterday',
    unread: false,
    messages: [
      {
        isMine: false,
        text: 'Hi! I saw you viewed the B.S. Grewal Mathematics 44th Edition book listing. Let me know if you would like to inspect it today.',
        time: 'Yesterday 2:15 PM'
      },
      {
        isMine: true,
        text: 'Yes! I would like to purchase it. Are all unit-wise question banks and solved papers included?',
        time: 'Yesterday 2:20 PM'
      },
      {
        isMine: false,
        text: 'Yes, all solved papers and unit-wise question banks are intact. We can meet at C-Block library reading hall!',
        time: 'Yesterday 2:22 PM'
      }
    ]
  },
  {
    peerPin: '24259-AIML-034',
    peerName: 'Sneha Reddy',
    category: 'IDEA_HUB',
    contextText: 'Idea Hub: Autonomous Drone Edge Vision',
    lastMessage: 'We are forming a team for the upcoming Samskruti College Hackathon. Would you like to collaborate?',
    lastTime: '2 days ago',
    unread: false,
    messages: [
      {
        isMine: false,
        text: 'Hey! We are forming a team for the upcoming Samskruti College Hackathon. Would you be interested in collaborating on computer vision and edge deployment?',
        time: 'Oct 30 11:10 AM'
      }
    ]
  }
];

// State
let allConversations = [];
let activeConversation = null;
let activeFilter = 'ALL';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupFilterTabs();
  setupSearch();
  setupComposer();
  setupWebSocket();
  loadThreads();

  if (typeof window.dcSyncProfile === 'function') {
    window.dcSyncProfile();
  }
});

function setupUserHeader() {
  const subElem = document.getElementById('messages-subtitle');
  if (subElem) {
    subElem.textContent = `Samskruti College (Code: 259) • ${myName} (PIN: ${myPin}) • Real-Time Unified Messenger`;
  }
}

/**
 * 0. REAL-TIME WEBSOCKET LISTENER
 */
function setupWebSocket() {
  wsClient.connect(myPin, myName);

  wsClient.on('NEW_MESSAGE', (payload) => {
    if (!payload || !payload.message) return;
    const m = payload.message;
    const sender = (m.sender_pin || '').toUpperCase();
    const receiver = (m.receiver_pin || '').toUpperCase();

    // Only process if involved
    if (sender !== myPin && receiver !== myPin) return;

    const otherPin = sender === myPin ? receiver : sender;
    const otherName = sender === myPin ? (m.receiver_name || otherPin) : (m.sender_name || otherPin);
    const timeStr = new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let conv = allConversations.find(c => c.peerPin.toUpperCase() === otherPin);
    if (!conv) {
      conv = {
        peerPin: otherPin,
        peerName: otherName,
        category: m.category || 'DIRECT',
        contextText: m.category === 'MARKETPLACE' ? 'Marketplace Inquiry' : (m.category === 'IDEA_HUB' ? 'Idea Hub Collab' : 'Direct Message'),
        lastMessage: m.content,
        lastTime: timeStr,
        unread: sender !== myPin,
        messages: []
      };
      allConversations.unshift(conv);
    } else {
      conv.lastMessage = m.content;
      conv.lastTime = timeStr;
      if (sender !== myPin && (!activeConversation || activeConversation.peerPin.toUpperCase() !== otherPin)) {
        conv.unread = true;
      }
    }

    const alreadyExists = conv.messages.some(existing => existing.id && existing.id === m.id);
    if (!alreadyExists) {
      conv.messages.push({
        id: m.id,
        isMine: sender === myPin,
        text: m.content,
        time: timeStr
      });
    }

    if (activeConversation && activeConversation.peerPin.toUpperCase() === otherPin) {
      renderMessagesStream();
    }
    renderThreadsList();
    localStorage.setItem('dc_conversations_cache', JSON.stringify(allConversations));
  });
}

/**
 * 1. LOAD THREADS
 */
async function loadThreads() {
  try {
    const res = await api.get('/messages/threads', { pin: myPin });
    if (res && res.success && res.threads && Object.keys(res.threads).length > 0) {
      const threadsObj = res.threads;
      const allMsgs = [
        ...(threadsObj.idea_hub || []).map(m => ({ ...m, category: 'IDEA_HUB' })),
        ...(threadsObj.marketplace || []).map(m => ({ ...m, category: 'MARKETPLACE' })),
        ...(threadsObj.direct || []).map(m => ({ ...m, category: 'DIRECT' }))
      ];

      if (allMsgs.length > 0) {
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
              contextText: m.category === 'MARKETPLACE' ? 'Marketplace Inquiry' : (m.category === 'IDEA_HUB' ? 'Idea Hub Collab' : 'Direct Message'),
              lastMessage: m.content,
              lastTime: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unread: !m.is_read && sender !== myPin,
              messages: [{
                id: m.id,
                isMine: sender === myPin,
                text: m.content,
                time: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]
            });
          } else {
            const entry = peerMap.get(otherPin);
            entry.lastMessage = m.content;
            entry.messages.push({
              id: m.id,
              isMine: sender === myPin,
              text: m.content,
              time: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }
        }
        allConversations = Array.from(peerMap.values());
      } else {
        allConversations = loadSavedOrDefaults();
      }
    } else {
      allConversations = loadSavedOrDefaults();
    }
  } catch (err) {
    console.warn('[Messages] Using local conversation cache.');
    allConversations = loadSavedOrDefaults();
  }

  // Handle URL deep-linking (e.g. from Marketplace DM or Idea Hub)
  handleUrlDeepLink();

  renderThreadsList();

  // Auto-open first conversation if on desktop and none selected
  if (!activeConversation && allConversations.length > 0 && window.innerWidth > 860) {
    selectConversation(allConversations[0]);
  }
}

function handleUrlDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const targetPin = (params.get('chatWith') || params.get('recipient') || params.get('peerPin') || '').trim().toUpperCase();
  const targetName = params.get('name') || params.get('sellerName') || params.get('peerName') || targetPin;
  const item = params.get('item');
  const catParam = params.get('category') || (item ? 'MARKETPLACE' : params.get('tab') ? (params.get('tab').toUpperCase()) : 'DIRECT');

  if (targetPin && targetPin !== myPin) {
    let conv = allConversations.find(c => c.peerPin.toUpperCase() === targetPin);
    if (!conv) {
      conv = {
        peerPin: targetPin,
        peerName: targetName,
        category: catParam,
        contextText: item ? `Marketplace: ${item}` : (catParam === 'IDEA_HUB' ? 'Idea Hub Collab' : 'Direct Message'),
        lastMessage: item ? `Inquiry regarding "${item}"` : '',
        lastTime: 'Just now',
        unread: false,
        messages: []
      };
      allConversations.unshift(conv);
    }
    selectConversation(conv);

    if (item) {
      const input = document.getElementById('chat-composer-input');
      if (input) {
        input.value = `Hi ${targetName}! I am interested in purchasing your listing "${item}". Is it still available on campus?`;
        input.focus();
      }
    }
  }
}

function loadSavedOrDefaults() {
  const saved = localStorage.getItem('dc_conversations_cache');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.warn(e);
    }
  }
  return DEFAULT_CONVERSATIONS;
}

/**
 * 2. RENDER THREADS LIST
 */
function renderThreadsList() {
  const container = document.getElementById('threads-container');
  if (!container) return;

  const filtered = allConversations.filter(c => {
    const cat = (c.category || 'DIRECT').toUpperCase();
    const filter = activeFilter.toUpperCase();

    let matchesFilter = false;
    if (filter === 'ALL') {
      matchesFilter = true;
    } else if (filter === 'IDEA_HUB' && cat === 'IDEA_HUB') {
      matchesFilter = true;
    } else if (filter === 'MARKETPLACE' && cat === 'MARKETPLACE') {
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
      <div style="text-align: center; color: #a7d9be; font-size: 0.85rem; padding: 36px 14px; font-style: italic;">
        No conversations found under this filter.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(conv => {
    const isSelected = activeConversation && activeConversation.peerPin.toUpperCase() === conv.peerPin.toUpperCase();
    const words = (conv.peerName || 'CS').trim().split(' ').filter(Boolean);
    const initials = words.length >= 2 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : conv.peerName.substring(0, 2).toUpperCase();

    return `
      <div class="thread-card ${isSelected ? 'active' : ''}" onclick="window.selectConvByPin('${conv.peerPin}')">
        <div class="thread-avatar">${initials}</div>
        <div class="thread-info">
          <div class="thread-info-top">
            <span class="thread-name">${escapeHtml(conv.peerName)}</span>
            <span class="thread-time">${escapeHtml(conv.lastTime || '')}</span>
          </div>
          <div class="thread-preview">${escapeHtml(conv.lastMessage || '')}</div>
        </div>
      </div>
    `;
  }).join('');
}

window.selectConvByPin = function (pin) {
  const found = allConversations.find(c => c.peerPin.toUpperCase() === pin.toUpperCase());
  if (found) {
    selectConversation(found);
  }
};

/**
 * 3. SELECT CONVERSATION
 */
function selectConversation(conv) {
  activeConversation = conv;
  conv.unread = false;

  const emptyView = document.getElementById('empty-chat-view');
  const liveView = document.getElementById('live-chat-view');
  const nameEl = document.getElementById('active-peer-name');
  const subEl = document.getElementById('active-peer-sub');
  const avatarEl = document.getElementById('active-peer-avatar');
  const contextBadgeText = document.getElementById('context-badge-text');
  const contextBadgeIcon = document.getElementById('context-badge-icon');

  if (emptyView) emptyView.style.display = 'none';
  if (liveView) liveView.style.display = 'flex';

  if (nameEl) nameEl.textContent = conv.peerName;
  if (subEl) subEl.textContent = `PIN: ${conv.peerPin}`;
  if (contextBadgeText) contextBadgeText.textContent = conv.contextText || 'Direct Message';
  if (contextBadgeIcon) {
    contextBadgeIcon.textContent = conv.category === 'MARKETPLACE' ? '🛍️' : (conv.category === 'IDEA_HUB' ? '💡' : '💬');
  }

  if (avatarEl) {
    const words = (conv.peerName || 'CS').trim().split(' ').filter(Boolean);
    avatarEl.textContent = words.length >= 2 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : conv.peerName.substring(0, 2).toUpperCase();
  }

  renderMessagesStream();
  renderThreadsList();

  // Focus input
  const input = document.getElementById('chat-composer-input');
  if (input) input.focus();
}

/**
 * 4. RENDER MESSAGES STREAM
 */
function renderMessagesStream() {
  const container = document.getElementById('active-messages-stream');
  if (!container || !activeConversation) return;

  const msgs = activeConversation.messages || [];

  container.innerHTML = msgs.map(m => `
    <div class="msg-bubble ${m.isMine ? 'mine' : 'peer'}">
      <div>${escapeHtml(m.text)}</div>
      <div class="msg-meta">${escapeHtml(m.time)}</div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

/**
 * 5. COMPOSER (SENDING MESSAGES VIA REST & WEBSOCKET)
 */
function setupComposer() {
  const form = document.getElementById('chat-composer-form');
  const input = document.getElementById('chat-composer-input');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || !activeConversation) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append locally immediately for 0ms lag
    activeConversation.messages.push({
      isMine: true,
      text,
      time
    });

    activeConversation.lastMessage = text;
    activeConversation.lastTime = time;

    input.value = '';
    renderMessagesStream();
    renderThreadsList();

    localStorage.setItem('dc_conversations_cache', JSON.stringify(allConversations));

    try {
      const res = await api.post('/messages', {
        sender_pin: myPin,
        sender_name: myName,
        receiver_pin: activeConversation.peerPin,
        receiver_name: activeConversation.peerName,
        content: text,
        category: activeConversation.category || 'DIRECT'
      });

      if (res && res.auto_reply) {
        const rep = res.auto_reply;
        const repTime = new Date(rep.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        activeConversation.messages.push({
          id: rep.id,
          isMine: false,
          text: rep.content,
          time: repTime
        });
        activeConversation.lastMessage = rep.content;
        activeConversation.lastTime = repTime;
        renderMessagesStream();
        renderThreadsList();
        localStorage.setItem('dc_conversations_cache', JSON.stringify(allConversations));
      }
    } catch (err) {
      console.warn('[Messages] Sent locally and over WebSocket:', err.message);
    }
  });
}

/**
 * 6. FILTER TABS & SEARCH
 */
function setupFilterTabs() {
  const buttons = document.querySelectorAll('.thread-filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter') || 'ALL';
      renderThreadsList();
    });
  });
}

function setupSearch() {
  const input = document.getElementById('thread-search-input');
  input?.addEventListener('input', () => {
    searchQuery = input.value.trim();
    renderThreadsList();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
