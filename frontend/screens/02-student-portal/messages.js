/**
 * Samskruti College Campus Messages & Discussions Controller
 * Kinetic Bento Tactile Design System Engine
 * SBTET Code 259 Student Peer & Institutional Communications
 */

document.addEventListener('DOMContentLoaded', () => {
  initMessages();
});

let currentThreadId = 'thread-hod';
let activeFilter = 'all';
let searchThreadQuery = '';

// Pre-configured realistic campus discussions
const defaultThreads = [
  {
    id: 'thread-hod',
    name: 'HOD Academic Dispatch',
    category: 'hod',
    badge: 'HOD OFFICIAL',
    badgeClass: 'bg-[var(--color-lavender)] text-[#22174C]',
    avatar: 'HD',
    subtitle: 'Node 259-CSE · Department Head',
    online: true,
    unread: 1,
    messages: [
      {
        id: 1,
        sender: 'other',
        name: 'Dr. Vamshi Krishna',
        time: 'Yesterday 16:40',
        text: 'All final year diploma candidates must submit their SBTET industrial training NOC requests before Friday. Counter clearance at Admin Block Counter 2 is active.'
      },
      {
        id: 2,
        sender: 'me',
        name: 'Karnati Himesh',
        time: 'Yesterday 17:15',
        text: 'Understood sir. I have submitted my Bonafide and NOC application through the student requests portal.'
      },
      {
        id: 3,
        sender: 'other',
        name: 'Dr. Vamshi Krishna',
        time: 'Today 09:30',
        text: 'Noted Himesh. Your attendance is above statutory threshold and application has been endorsed.'
      }
    ]
  },
  {
    id: 'thread-gl',
    name: 'Gona Laxmi Narasimha Swami',
    pin: '24259-CS-001',
    category: 'peers',
    badge: 'PROJECT PARTNER',
    badgeClass: 'bg-[var(--color-lime)] text-[var(--color-lime-ink)]',
    avatar: 'GL',
    subtitle: 'CSE · Year II · Roll #1',
    online: true,
    unread: 2,
    messages: [
      {
        id: 1,
        sender: 'other',
        name: 'Gona Laxmi',
        time: 'Yesterday 11:20',
        text: 'Hey Himesh, did you review the LoRa transmitter schematics for our capstone IoT node?'
      },
      {
        id: 2,
        sender: 'me',
        name: 'Karnati Himesh',
        time: 'Yesterday 11:45',
        text: 'Yes! The ESP32 pinout matches our sensor shield. Let us test the packet broadcast during tomorrow afternoon lab.'
      },
      {
        id: 3,
        sender: 'other',
        name: 'Gona Laxmi',
        time: 'Today 10:15',
        text: 'Great, I brought the 433MHz antennas to the hardware lab.'
      }
    ]
  },
  {
    id: 'thread-tarun',
    name: 'Dulipudi Tarun',
    pin: '24259-CS-002',
    category: 'peers',
    badge: 'CLASS REP',
    badgeClass: 'bg-[var(--color-card-subtle)] text-[var(--color-ink)] border border-[var(--color-hairline)]',
    avatar: 'DT',
    subtitle: 'CSE · Year II · Class Representative',
    online: true,
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'other',
        name: 'Dulipudi Tarun',
        time: 'Nov 03, 14:10',
        text: 'Seminar hall session on Cloud Architecture scheduled for Thursday 2 PM. Attendance is compulsory.'
      },
      {
        id: 2,
        sender: 'me',
        name: 'Karnati Himesh',
        time: 'Nov 03, 14:30',
        text: 'Noted Tarun, thanks for the update.'
      }
    ]
  },
  {
    id: 'thread-bhavya',
    name: 'Pittala Bhavya',
    pin: '24259-CS-004',
    category: 'peers',
    badge: 'IDEA HUB',
    badgeClass: 'bg-[var(--color-lavender)] text-[#22174C]',
    avatar: 'PB',
    subtitle: 'CSE · Year II · Roll #4',
    online: false,
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'other',
        name: 'Pittala Bhavya',
        time: 'Nov 01, 16:00',
        text: 'Shared the transformer NLP dataset on the shared college drive folder.'
      }
    ]
  },
  {
    id: 'thread-broadcast',
    name: 'Samskruti Institutional Broadcast',
    category: 'hod',
    badge: 'REGISTRY BROADCAST',
    badgeClass: 'bg-[var(--color-feature-card)] text-white',
    avatar: 'SC',
    subtitle: 'Autonomous Examination Section (259)',
    online: true,
    unread: 0,
    messages: [
      {
        id: 1,
        sender: 'other',
        name: 'Examination Section',
        time: 'Oct 28, 10:00',
        text: 'C-24 Scheme Semester IV official SBTET consolidated memos are published and synchronized on Digital Campus.'
      }
    ]
  }
];

let discussions = [];

function initMessages() {
  loadDiscussions();
  bindFilterTabs();
  bindSearchThreads();
  bindChatComposer();
  bindQuickReplyChips();
  bindAuxiliaryButtons();
  checkUrlParams();
}

/**
 * 1. Load Discussions from Cache or Default
 */
function loadDiscussions() {
  let saved = null;
  try {
    const raw = localStorage.getItem('dc_discussions_data');
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}

  discussions = saved || defaultThreads;
  renderThreadsList();
  renderActiveChat();
}

/**
 * 2. Filter Tabs Handling
 */
function bindFilterTabs() {
  const tabs = document.querySelectorAll('.thread-filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeFilter = tab.getAttribute('data-filter') || 'all';

      tabs.forEach(t => {
        t.className = 'thread-filter-tab px-3 py-1 rounded-full text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-card-subtle)] cursor-pointer';
      });

      tab.className = 'thread-filter-tab px-3 py-1 rounded-full bg-[var(--color-lime)] text-[var(--color-lime-ink)] font-medium active-tab cursor-pointer';

      renderThreadsList();
    });
  });
}

/**
 * 3. Search Conversations
 */
function bindSearchThreads() {
  const input = document.getElementById('searchThreadsInput');
  input?.addEventListener('input', (e) => {
    searchThreadQuery = e.target.value.trim().toLowerCase();
    renderThreadsList();
  });
}

/**
 * 4. Render Discussions List
 */
function renderThreadsList() {
  const container = document.getElementById('threadsListContainer');
  if (!container) return;

  const filtered = discussions.filter(t => {
    const matchesFilter = (activeFilter === 'all') ||
      (activeFilter === 'hod' && t.category === 'hod') ||
      (activeFilter === 'peers' && t.category === 'peers') ||
      (activeFilter === 'unread' && t.unread > 0);

    const matchesSearch = !searchThreadQuery ||
      t.name.toLowerCase().includes(searchThreadQuery) ||
      (t.messages.length > 0 && t.messages[t.messages.length - 1].text.toLowerCase().includes(searchThreadQuery));

    return matchesFilter && matchesSearch;
  });

  const totalUnread = discussions.reduce((acc, t) => acc + (t.unread || 0), 0);
  const unreadBadge = document.getElementById('unreadThreadsBadge');
  if (unreadBadge) {
    unreadBadge.textContent = totalUnread > 0 ? `${totalUnread} Unread` : 'All read';
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-xs text-[var(--color-muted)]">
        No discussions found matching filter.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(t => {
    const isActive = (t.id === currentThreadId);
    const lastMsg = t.messages[t.messages.length - 1];
    const preview = lastMsg ? lastMsg.text : 'No messages yet';
    const time = lastMsg ? lastMsg.time : '';

    return `
      <div class="thread-item p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${isActive ? 'bg-[var(--color-card-subtle)] border-[var(--color-ink)] shadow-2xs' : 'bg-transparent border-transparent hover:bg-[var(--color-card-subtle)]'}" onclick="selectThread('${t.id}')">
        <div class="flex items-center gap-3 min-w-0">
          <div class="relative w-9 h-9 rounded-full bg-[var(--color-feature-card)] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
            ${t.avatar}
            ${t.online ? '<span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--color-card)]"></span>' : ''}
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-semibold text-[var(--color-ink)] truncate">${escapeHtml(t.name)}</span>
            <span class="text-[11px] text-[var(--color-muted)] truncate">${escapeHtml(preview)}</span>
          </div>
        </div>

        <div class="flex flex-col items-end gap-1 shrink-0">
          <span class="font-mono text-[10px] text-[var(--color-muted)]">${time}</span>
          ${t.unread > 0 ? `
            <span class="w-4 h-4 rounded-full bg-[var(--color-lime)] text-[var(--color-lime-ink)] font-mono text-[10px] font-bold flex items-center justify-center">${t.unread}</span>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 5. Select Thread & Update Right Pane
 */
window.selectThread = function (threadId) {
  currentThreadId = threadId;
  const thread = discussions.find(t => t.id === threadId);
  if (thread) {
    thread.unread = 0;
  }

  saveDiscussions();
  renderThreadsList();
  renderActiveChat();
};

/**
 * 6. Render Active Chat Viewport
 */
function renderActiveChat() {
  const thread = discussions.find(t => t.id === currentThreadId) || discussions[0];
  if (!thread) return;

  // Header Details
  const nameEl = document.getElementById('chatHeaderName');
  if (nameEl) nameEl.textContent = thread.name;

  const subtitleEl = document.getElementById('chatHeaderSubtitle');
  if (subtitleEl) subtitleEl.textContent = thread.subtitle || 'Active on Node 259';

  const badgeEl = document.getElementById('chatHeaderBadge');
  if (badgeEl) {
    badgeEl.textContent = thread.badge || 'CHANNEL';
    badgeEl.className = `font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full ${thread.badgeClass || 'bg-[var(--color-lavender)] text-[#22174C]'}`;
  }

  const avatarEl = document.getElementById('chatHeaderAvatar');
  if (avatarEl) {
    avatarEl.innerHTML = `
      ${thread.avatar}
      ${thread.online ? '<span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--color-card)]"></span>' : ''}
    `;
  }

  // Messages Stream
  const stream = document.getElementById('chatMessagesContainer');
  if (!stream) return;

  stream.innerHTML = thread.messages.map(msg => {
    const isMe = (msg.sender === 'me');

    if (isMe) {
      return `
        <div class="flex flex-col items-end gap-1 self-end max-w-[85%] sm:max-w-[70%]">
          <div class="bg-[var(--color-feature-card)] text-white p-3.5 rounded-2xl rounded-tr-xs shadow-xs text-xs leading-relaxed">
            ${escapeHtml(msg.text)}
          </div>
          <span class="font-mono text-[10px] text-[var(--color-muted)] pr-1">${msg.time}</span>
        </div>
      `;
    } else {
      return `
        <div class="flex items-start gap-2.5 self-start max-w-[85%] sm:max-w-[70%]">
          <div class="w-7 h-7 rounded-full bg-[var(--color-card-subtle)] border border-[var(--color-hairline)] flex items-center justify-center font-mono font-bold text-[10px] text-[var(--color-ink)] shrink-0 mt-0.5">
            ${thread.avatar}
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-baseline gap-2">
              <span class="font-semibold text-xs text-[var(--color-ink)]">${escapeHtml(msg.name || thread.name)}</span>
              <span class="font-mono text-[10px] text-[var(--color-muted)]">${msg.time}</span>
            </div>
            <div class="bg-[var(--color-card-subtle)] text-[var(--color-ink)] border border-[var(--color-hairline)] p-3.5 rounded-2xl rounded-tl-xs shadow-2xs text-xs leading-relaxed">
              ${escapeHtml(msg.text)}
            </div>
          </div>
        </div>
      `;
    }
  }).join('');

  // Auto scroll to bottom
  stream.scrollTop = stream.scrollHeight;
}

/**
 * 7. Chat Composer & Sending
 */
function bindChatComposer() {
  const form = document.getElementById('chatComposerForm');
  const input = document.getElementById('chatInput');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input?.value.trim();
    if (!text) return;

    const thread = discussions.find(t => t.id === currentThreadId);
    if (!thread) return;

    const user = (typeof StitchState !== 'undefined' && StitchState.getUser) 
      ? StitchState.getUser() 
      : { name: 'Karnati Himesh' };

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      name: user.name || 'Karnati Himesh',
      time: 'Just now',
      text: text
    };

    thread.messages.push(newMsg);
    saveDiscussions();

    if (input) input.value = '';
    renderThreadsList();
    renderActiveChat();
  });
}

/**
 * 8. Quick Reply Chips
 */
function bindQuickReplyChips() {
  const chips = document.querySelectorAll('.quick-reply-chip');
  const input = document.getElementById('chatInput');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (input) {
        input.value = chip.textContent.replace(/^"|"$/g, '');
        input.focus();
      }
    });
  });
}

/**
 * 9. Auxiliary Buttons (Call, Info, Attachment)
 */
function bindAuxiliaryButtons() {
  document.getElementById('btnAudioCall')?.addEventListener('click', () => {
    showToast('Voice channel connection initiated on Node 259 Intranet.');
  });

  document.getElementById('btnChatInfo')?.addEventListener('click', () => {
    const thread = discussions.find(t => t.id === currentThreadId);
    showToast(`Channel Info: ${thread?.name || 'Channel'} (${thread?.badge || 'Verified'})`);
  });

  document.getElementById('btnAttachment')?.addEventListener('click', () => {
    showToast('Secure document attachment module opened.');
  });
}

/**
 * 10. Check URL Parameters (e.g. ?to=24259-CS-001)
 */
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const toPin = params.get('to');
  if (!toPin) return;

  const targetThread = discussions.find(t => t.pin === toPin);
  if (targetThread) {
    selectThread(targetThread.id);
  }
}

/**
 * 11. Storage Helper
 */
function saveDiscussions() {
  try {
    localStorage.setItem('dc_discussions_data', JSON.stringify(discussions));
  } catch (e) {}
}

/**
 * 12. Escape HTML Helper
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 13. Toast Notification Helper
 */
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;

  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');

  clearTimeout(window._msgToastTimeout);
  window._msgToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
