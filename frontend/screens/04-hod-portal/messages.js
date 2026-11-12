/**
 * Samskruti College HOD Campus Messages Controller
 * Real-time bidirectional WebSocket & REST API communication (/api/v1/messages)
 * Department-scoped student conversations, responsive split-pane layout & mobile navigation
 */

let activeDepartment = 'CS';
let activeStudent = null;
let activeThreads = [];
let activeCategoryFilter = 'all';
let ws = null;

const DEPARTMENT_HOD_INFO = {
  CS: {
    pin: 'VAMSHI-CS-HOD',
    name: 'Dr. J. Vamshi Krishna (HOD CS)',
    branch: 'CS'
  },
  AIML: {
    pin: 'AIML-HOD',
    name: 'Prof. Padma (HOD AIML)',
    branch: 'AIML'
  }
};

const DEFAULT_CONVERSATIONS = {
  CS: [
    {
      pin: '24259-CS-025',
      name: 'KARNATI HIMESH',
      branch: 'CS',
      category: 'direct',
      tag: 'Medical Board Appeal',
      lastMessage: 'Respected Dr. Vamshi Krishna, I have submitted my Medical Board application for attendance condonation (Ref: SC-COND-041). Please consider my hospitalization records.',
      lastTime: '10:45 AM',
      initials: 'KH'
    },
    {
      pin: '24259-CS-037',
      name: 'EDAMANAPALLY SAMISAAC',
      branch: 'CS',
      category: 'direct',
      tag: 'Internship NOC',
      lastMessage: 'Respected HOD Sir, I have received an internship offer from Infosys Springboard AI Cohort. Kindly approve my NOC.',
      lastTime: 'Yesterday',
      initials: 'ES'
    },
    {
      pin: '24259-CS-040',
      name: 'TALLAPALLI TULASI RAM GOUD',
      branch: 'CS',
      category: 'direct',
      tag: 'Bonafide Certificate',
      lastMessage: 'Respected HOD Sir, I have submitted an urgent Bonafide Certificate request for passport physical verification.',
      lastTime: '2 days ago',
      initials: 'TT'
    },
    {
      pin: '24259-CS-001',
      name: 'GONA LAXMI NARASIMHA SWAMI',
      branch: 'CS',
      category: 'idea_hub',
      tag: 'Idea Hub · LoRa IoT Node',
      lastMessage: 'Respected HOD Sir, submitted our LoRa telemetry node architecture under Idea Hub incubator for evaluation.',
      lastTime: '3 days ago',
      initials: 'GS'
    },
    {
      pin: '24259-CS-004',
      name: 'PITTALA BHAVYA',
      branch: 'CS',
      category: 'idea_hub',
      tag: 'Idea Hub · NLP Transformer',
      lastMessage: 'Respected HOD Sir, we uploaded the Transformer NLP research dataset on Idea Hub for academic grant review.',
      lastTime: 'Nov 01',
      initials: 'PB'
    },
    {
      pin: '24259-CS-012',
      name: 'K. SAI TEJA',
      branch: 'CS',
      category: 'marketplace',
      tag: 'Market · Drafting Kit',
      lastMessage: 'Sir, seeking permission to hand over the Mini Drafter & Roller Scale kit at the workshop store counter.',
      lastTime: 'Today 11:20',
      initials: 'ST'
    }
  ],
  AIML: [
    {
      pin: '24259-AIML-019',
      name: 'KARNATI HITESH',
      branch: 'AIML',
      category: 'direct',
      tag: 'Bonafide Request',
      lastMessage: 'Respected Prof. Padma, I have submitted my Bonafide certificate application for State scholarship verification. Kindly review and approve.',
      lastTime: '10:30 AM',
      initials: 'KH'
    },
    {
      pin: '24259-AIML-001',
      name: 'AMANCHA RASAGNA',
      branch: 'AIML',
      category: 'direct',
      tag: 'Internship NOC',
      lastMessage: 'Respected HOD Sir, I have an internship offer from Tech Mahindra for AI Research. Requesting an Internship NOC on institutional letterhead.',
      lastTime: 'Yesterday',
      initials: 'AR'
    },
    {
      pin: '24259-AIML-010',
      name: 'ITTE NIKHIL TEJA',
      branch: 'AIML',
      category: 'direct',
      tag: 'Bus Pass Form',
      lastMessage: 'Good morning Sir, TSRTC bus pass endorsement form uploaded. Kindly sign off when convenient.',
      lastTime: '2 days ago',
      initials: 'IN'
    },
    {
      pin: '24259-AIML-015',
      name: 'CHINTA SRILEKHA',
      branch: 'AIML',
      category: 'idea_hub',
      tag: 'Idea Hub · Drone Vision',
      lastMessage: 'Respected Madam, our Autonomous Drone Computer Vision project proposal has been submitted to Idea Hub.',
      lastTime: 'Yesterday',
      initials: 'CS'
    },
    {
      pin: '24259-AIML-022',
      name: 'M. HARSHITHA',
      branch: 'AIML',
      category: 'marketplace',
      tag: 'Market · AI Textbooks',
      lastMessage: 'Madam, verification inquiry regarding Deep Learning textbook hand-off at Central Library.',
      lastTime: '2 days ago',
      initials: 'MH'
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  initMessagesModule();
});

function getActiveDepartment() {
  const stored = localStorage.getItem('hod_active_dept');
  if (stored === 'CS' || stored === 'AIML') return stored;
  try {
    const userStr = localStorage.getItem('dc_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.branch === 'AIML' || (u.pin && u.pin.includes('AIML'))) return 'AIML';
      if (u.branch === 'CS' || (u.pin && u.pin.includes('CS'))) return 'CS';
    }
  } catch (_) {}
  return 'CS';
}

function initMessagesModule() {
  activeDepartment = getActiveDepartment();
  bindDepartmentSwitcher();
  bindCategoryFilters();
  bindSearchInput();
  bindChatComposer();
  bindQuickChips();
  bindMobileBackButton();
  initWebSocket();
  loadConversations(activeDepartment);
}

function bindCategoryFilters() {
  const tabs = document.querySelectorAll('.hod-filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeCategoryFilter = tab.getAttribute('data-filter') || 'all';

      tabs.forEach(t => {
        t.className = 'hod-filter-tab px-3 py-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-code-mono text-[11px] font-bold cursor-pointer';
      });

      tab.className = 'hod-filter-tab px-3 py-1 rounded-full bg-primary text-on-primary font-code-mono text-[11px] font-bold active-tab cursor-pointer';

      renderThreadList();
    });
  });
}

function bindDepartmentSwitcher() {
  const csBtn = document.getElementById('deptCsBtn');
  const aimlBtn = document.getElementById('deptAimlBtn');

  const updateSwitcherUI = () => {
    const activeClass = 'px-4 py-1.5 rounded-full text-xs font-bold font-code-mono uppercase tracking-wide transition-all bg-primary text-on-primary shadow-xs cursor-pointer';
    const inactiveClass = 'px-4 py-1.5 rounded-full text-xs font-bold font-code-mono uppercase tracking-wide transition-all text-on-surface-variant hover:text-on-surface cursor-pointer';

    if (csBtn) csBtn.className = activeDepartment === 'CS' ? activeClass : inactiveClass;
    if (aimlBtn) aimlBtn.className = activeDepartment === 'AIML' ? activeClass : inactiveClass;
  };

  csBtn?.addEventListener('click', () => {
    activeDepartment = 'CS';
    localStorage.setItem('hod_active_dept', 'CS');
    updateSwitcherUI();
    loadConversations('CS');
    showToast('Switched to CS Department Messages');
  });

  aimlBtn?.addEventListener('click', () => {
    activeDepartment = 'AIML';
    localStorage.setItem('hod_active_dept', 'AIML');
    updateSwitcherUI();
    loadConversations('AIML');
    showToast('Switched to AIML Department Messages');
  });

  updateSwitcherUI();
}

function loadConversations(dept) {
  activeThreads = [...(DEFAULT_CONVERSATIONS[dept] || DEFAULT_CONVERSATIONS.CS)];

  const countBadge = document.getElementById('activeThreadsCount');
  if (countBadge) countBadge.textContent = `${activeThreads.length} Active`;

  renderThreadList();

  // Automatically select first thread
  if (activeThreads.length > 0) {
    selectThread(activeThreads[0]);
  }
}

function bindSearchInput() {
  const searchInput = document.getElementById('threadSearch');
  searchInput?.addEventListener('input', () => {
    renderThreadList();
  });

  document.getElementById('btnRefreshThreads')?.addEventListener('click', () => {
    loadConversations(activeDepartment);
    showToast('Refreshed conversations');
  });
}

function renderThreadList() {
  const container = document.getElementById('threadsListContainer');
  if (!container) return;

  const query = (document.getElementById('threadSearch')?.value || '').toLowerCase().trim();

  const filtered = activeThreads.filter(t => {
    const cat = (t.category || 'direct').toLowerCase();
    const tag = (t.tag || '').toUpperCase();
    const matchesCategory = (activeCategoryFilter === 'all') ||
      (activeCategoryFilter === 'direct' && (cat === 'direct' || tag.includes('APPEAL') || tag.includes('NOC') || tag.includes('BONAFIDE') || tag.includes('HALL TICKET') || tag.includes('BUS PASS'))) ||
      (activeCategoryFilter === 'idea_hub' && (cat === 'idea_hub' || tag.includes('IDEA') || tag.includes('CAPSTONE') || tag.includes('VISION'))) ||
      (activeCategoryFilter === 'marketplace' && (cat === 'marketplace' || tag.includes('MARKET') || tag.includes('DRAFT') || tag.includes('BOOK')));

    if (!matchesCategory) return false;

    if (!query) return true;
    return (t.name || '').toLowerCase().includes(query) ||
           (t.pin || '').toLowerCase().includes(query) ||
           (t.tag || '').toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-on-surface-variant text-xs">
        <span class="material-symbols-outlined text-3xl mb-1 text-outline">search_off</span>
        <div>No matching conversations</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(t => {
    const isSelected = activeStudent && activeStudent.pin === t.pin;
    const selectedClass = isSelected
      ? 'bg-primary-container/20 border-primary-fixed/40 shadow-xs'
      : 'bg-surface-container-low hover:bg-surface-container-high/60 border-hairline';

    return `
      <article class="thread-item ${selectedClass} rounded-2xl p-3.5 cursor-pointer transition-all border flex items-start gap-3"
               data-pin="${t.pin}">
        <div class="relative shrink-0">
          <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-code-mono text-xs font-bold flex items-center justify-center border border-hairline">
            ${t.initials}
          </div>
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface-container"></span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <h4 class="font-bold text-on-surface text-xs sm:text-sm truncate">
              ${escapeHtml(t.name)}
            </h4>
            <span class="font-code-mono-sm text-[10px] text-on-surface-variant shrink-0">${t.lastTime}</span>
          </div>
          <div class="flex items-center gap-1.5 mt-0.5 mb-1">
            <span class="font-code-mono-sm text-[10px] text-on-surface-variant">${t.pin}</span>
            <span class="w-1 h-1 rounded-full bg-hairline"></span>
            <span class="px-1.5 py-0.2 rounded-full bg-surface-container-high text-primary-fixed font-code-mono-sm text-[9px] font-bold">
              ${escapeHtml(t.tag)}
            </span>
          </div>
          <p class="text-xs text-on-surface-variant line-clamp-1 leading-normal font-sans">
            ${escapeHtml(t.lastMessage)}
          </p>
        </div>
      </article>
    `;
  }).join('');

  container.querySelectorAll('.thread-item').forEach(item => {
    item.addEventListener('click', () => {
      const pin = item.getAttribute('data-pin');
      const found = activeThreads.find(t => t.pin === pin);
      if (found) {
        selectThread(found);

        // Mobile responsiveness: show chat workspace panel, hide left panel
        if (window.innerWidth < 1024) {
          const convPanel = document.getElementById('conversationsPanel');
          const chatPanel = document.getElementById('chatWorkspacePanel');
          if (convPanel) convPanel.classList.add('hidden');
          if (chatPanel) {
            chatPanel.classList.remove('hidden');
            chatPanel.classList.add('flex');
          }
        }
      }
    });
  });
}

function bindMobileBackButton() {
  const backBtn = document.getElementById('btnBackToThreads');
  backBtn?.addEventListener('click', () => {
    const convPanel = document.getElementById('conversationsPanel');
    const chatPanel = document.getElementById('chatWorkspacePanel');
    if (chatPanel) {
      chatPanel.classList.add('hidden');
      chatPanel.classList.remove('flex');
    }
    if (convPanel) {
      convPanel.classList.remove('hidden');
    }
  });
}

async function selectThread(student) {
  activeStudent = student;
  renderThreadList();

  const avatar = document.getElementById('chatHeaderAvatar');
  const nameEl = document.getElementById('chatHeaderName');
  const metaEl = document.getElementById('chatHeaderMeta');
  const tagEl = document.getElementById('chatHeaderTag');
  const dossierLink = document.getElementById('chatViewLedgerLink');

  if (avatar) avatar.textContent = student.initials;
  if (nameEl) nameEl.textContent = student.name;
  if (metaEl) metaEl.textContent = `${student.pin} • Scheme C-24 • Dept of ${activeDepartment}`;
  if (tagEl) tagEl.textContent = student.tag;
  if (dossierLink) dossierLink.href = `./students-info.html?search=${encodeURIComponent(student.pin)}`;

  await loadChatHistory(student);
}

async function loadChatHistory(student) {
  const chatBox = document.getElementById('chatMessagesBox');
  if (!chatBox) return;

  chatBox.innerHTML = `
    <div class="py-10 text-center text-on-surface-variant text-xs">
      <span class="material-symbols-outlined text-2xl animate-spin mb-1">progress_activity</span>
      <div>Connecting secure channel...</div>
    </div>
  `;

  const hod = DEPARTMENT_HOD_INFO[activeDepartment] || DEPARTMENT_HOD_INFO.CS;
  let messages = [];

  try {
    const res = await fetch(`/api/v1/messages/history?user_pin=${encodeURIComponent(hod.pin)}&other_pin=${encodeURIComponent(student.pin)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.messages) && data.messages.length > 0) {
        messages = data.messages;
      }
    }
  } catch (_) {}

  // If server history is empty, populate with initial welcome/context messages
  if (messages.length === 0) {
    messages = [
      {
        sender_pin: student.pin,
        sender_name: student.name,
        content: student.lastMessage,
        timestamp: new Date().toISOString()
      },
      {
        sender_pin: hod.pin,
        sender_name: hod.name,
        content: `Application logged in the ${activeDepartment === 'AIML' ? 'AI & Machine Learning' : 'Computer Science & Engineering'} executive queue. Review in progress.`,
        timestamp: new Date().toISOString()
      }
    ];
  }

  renderChatBubbles(messages, hod.pin);
}

function renderChatBubbles(messages, hodPin) {
  const chatBox = document.getElementById('chatMessagesBox');
  if (!chatBox) return;

  chatBox.innerHTML = messages.map(msg => {
    const isHod = msg.sender_pin === hodPin || msg.sender_pin.includes('HOD') || (msg.sender_name && msg.sender_name.includes('HOD'));
    const timeFormatted = formatTime(msg.timestamp);

    if (isHod) {
      // Outgoing message bubble from HOD
      return `
        <div class="flex flex-col items-end gap-1">
          <div class="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-code-mono pr-1">
            <span class="font-bold text-primary-fixed">Executive Reply</span>
            <span>·</span>
            <span>${timeFormatted}</span>
          </div>
          <div class="max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl rounded-tr-xs bg-primary-container text-on-primary-container text-xs font-medium shadow-xs leading-relaxed border border-primary-container/40">
            ${escapeHtml(msg.content)}
          </div>
        </div>
      `;
    } else {
      // Incoming student message
      return `
        <div class="flex flex-col items-start gap-1">
          <div class="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-code-mono pl-1">
            <span class="font-bold text-on-surface">${escapeHtml(msg.sender_name || activeStudent.name)}</span>
            <span>·</span>
            <span>${timeFormatted}</span>
          </div>
          <div class="max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl rounded-tl-xs bg-surface-container-high text-on-surface text-xs shadow-xs leading-relaxed border border-hairline">
            ${escapeHtml(msg.content)}
          </div>
        </div>
      `;
    }
  }).join('');

  scrollChatToBottom();
}

function scrollChatToBottom() {
  const chatBox = document.getElementById('chatMessagesBox');
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function formatTime(isoStr) {
  if (!isoStr) return 'Just now';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return 'Just now';
  }
}

function bindChatComposer() {
  const form = document.getElementById('chatComposerForm');
  const input = document.getElementById('messageInput');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = (input?.value || '').trim();
    if (!text || !activeStudent) return;

    input.value = '';
    const hod = DEPARTMENT_HOD_INFO[activeDepartment] || DEPARTMENT_HOD_INFO.CS;

    // Optimistically render message bubble in chat box
    appendOutgoingBubble(text, hod.pin);

    // Update thread preview
    activeStudent.lastMessage = text;
    activeStudent.lastTime = 'Just now';
    renderThreadList();

    try {
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_pin: hod.pin,
          sender_name: hod.name,
          receiver_pin: activeStudent.pin,
          receiver_name: activeStudent.name,
          content: text,
          category: 'DIRECT'
        })
      });

      if (res.ok) {
        showToast('Message dispatched');
      }
    } catch (err) {
      console.error('Failed to dispatch message:', err);
    }
  });
}

function appendOutgoingBubble(text, hodPin) {
  const chatBox = document.getElementById('chatMessagesBox');
  if (!chatBox) return;

  const bubble = document.createElement('div');
  bubble.className = 'flex flex-col items-end gap-1';
  bubble.innerHTML = `
    <div class="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-code-mono pr-1">
      <span class="font-bold text-primary-fixed">Executive Reply</span>
      <span>·</span>
      <span>${formatTime(new Date().toISOString())}</span>
    </div>
    <div class="max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl rounded-tr-xs bg-primary-container text-on-primary-container text-xs font-medium shadow-xs leading-relaxed border border-primary-container/40">
      ${escapeHtml(text)}
    </div>
  `;
  chatBox.appendChild(bubble);
  scrollChatToBottom();
}

function bindQuickChips() {
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-text');
      const input = document.getElementById('messageInput');
      if (input && text) {
        input.value = text;
        input.focus();
      }
    });
  });
}

function initWebSocket() {
  const hod = DEPARTMENT_HOD_INFO[activeDepartment] || DEPARTMENT_HOD_INFO.CS;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws?pin=${encodeURIComponent(hod.pin)}&name=${encodeURIComponent(hod.name)}`;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      const textEl = document.getElementById('socketStatusText');
      if (textEl) textEl.textContent = 'Socket: Active';
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'NEW_MESSAGE' && payload.message) {
          handleIncomingMessage(payload.message);
        }
      } catch (_) {}
    };

    ws.onerror = () => {
      const textEl = document.getElementById('socketStatusText');
      if (textEl) textEl.textContent = 'Socket: Reconnecting';
    };

    ws.onclose = () => {
      const textEl = document.getElementById('socketStatusText');
      if (textEl) textEl.textContent = 'Socket: Offline';
      setTimeout(initWebSocket, 5000);
    };
  } catch (_) {}
}

function handleIncomingMessage(msg) {
  const senderPin = (msg.sender_pin || '').toUpperCase();

  // If message is from current student thread
  if (activeStudent && activeStudent.pin.toUpperCase() === senderPin) {
    const chatBox = document.getElementById('chatMessagesBox');
    if (chatBox) {
      const bubble = document.createElement('div');
      bubble.className = 'flex flex-col items-start gap-1';
      bubble.innerHTML = `
        <div class="flex items-center gap-1.5 text-[10px] text-on-surface-variant font-code-mono pl-1">
          <span class="font-bold text-on-surface">${escapeHtml(msg.sender_name || activeStudent.name)}</span>
          <span>·</span>
          <span>${formatTime(msg.timestamp)}</span>
        </div>
        <div class="max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl rounded-tl-xs bg-surface-container-high text-on-surface text-xs shadow-xs leading-relaxed border border-hairline">
          ${escapeHtml(msg.content)}
        </div>
      `;
      chatBox.appendChild(bubble);
      scrollChatToBottom();
    }
  }

  // Update thread list preview
  const thread = activeThreads.find(t => t.pin.toUpperCase() === senderPin);
  if (thread) {
    thread.lastMessage = msg.content;
    thread.lastTime = formatTime(msg.timestamp);
    renderThreadList();
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2600);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
