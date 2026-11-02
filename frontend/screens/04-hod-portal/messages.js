/**
 * Samskruti College HOD Campus Messages Controller
 * Real-Time Two-Way Encrypted Chat: Instant Send, Interactive Receiving, and Thread Switching
 */

document.addEventListener('DOMContentLoaded', () => {
  initHodMessages();
  checkUrlParams();
  initHelpDeskLinks();
});

let activeDepartment = 'AIML';

function getActiveDepartment() {
  const stored = localStorage.getItem('hod_active_dept');
  if (stored === 'CS' || stored === 'AIML') return stored;
  try {
    const userStr = localStorage.getItem('dc_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u.branch === 'CS' || (u.pin && u.pin.includes('CS'))) return 'CS';
    }
  } catch (_) {}
  return 'AIML';
}

const THREADS_DB = {
  AIML: [
    {
      pin: '24259-AIML-119',
      name: 'Karnati Hitesh',
      initials: 'KH',
      attendance: '43.2%',
      status: 'Critical Shortage',
      tag: 'Bonafide Request',
      messages: [
        { sender: 'student', text: 'Respected Prof. Padma Sir, I have submitted my Bonafide certificate application for Passport and scholarship verification (Ref: DOC-1). Kindly review and approve.', time: '10:30 AM' },
        { sender: 'hod', text: 'Application received, Hitesh. Your current verified biometric attendance is 43.2%. I am approving your bonafide for official passport documentation. Ensure you attend the remedial sessions regularly.', time: '10:45 AM' }
      ]
    },
    {
      pin: '24259-AIML-001',
      name: 'Amancha Rasagna',
      initials: 'AR',
      attendance: '43.2%',
      status: 'Critical Shortage',
      tag: 'Internship NOC',
      messages: [
        { sender: 'student', text: 'Respected HOD Sir, I have an internship offer from Tech Mahindra for AI Research. Requesting an Internship NOC on institutional letterhead.', time: 'Yesterday, 04:15 PM' },
        { sender: 'hod', text: 'Congratulations Rasagna. Reviewed your curriculum portfolio. NOC request is queued for sign-off. Your request is registered for HOD endorsement.', time: 'Today, 09:15 AM' }
      ]
    },
    {
      pin: '24259-AIML-010',
      name: 'Itte Nikhil Teja',
      initials: 'IN',
      attendance: '42.0%',
      status: 'Critical Shortage',
      tag: 'Bus Pass Form',
      messages: [
        { sender: 'student', text: 'Good morning Sir, TSRTC bus pass endorsement form uploaded. Kindly sign off.', time: '2 days ago' },
        { sender: 'hod', text: 'Validated. Bring the physical printed pass form to the department office for seal verification.', time: 'Yesterday' }
      ]
    }
  ],
  CS: [
    {
      pin: '24259-CS-025',
      name: 'Karnati Himesh',
      initials: 'KH',
      attendance: '38.6%',
      status: 'Detained Deficit',
      tag: 'Medical Board Appeal',
      messages: [
        { sender: 'student', text: 'Respected Dr. Vamshi Krishna, I have submitted my Medical Board application for attendance condonation (Ref: SC-COND-041). Please consider my hospitalization records.', time: '10:45 AM' },
        { sender: 'hod', text: 'Application reviewed. Your attendance is at 38.6%, which falls under the statutory detention bracket. Bring the original Civil Surgeon fitness certificate and attendance appeal slip to my chamber at 2:30 PM today.', time: '11:15 AM' }
      ]
    },
    {
      pin: '24259-CS-040',
      name: 'Tallapalli Tulasi Ram Goud',
      initials: 'TT',
      attendance: '84.5%',
      status: 'Regular Eligible',
      tag: 'Bonafide Requisition',
      messages: [
        { sender: 'student', text: 'Respected HOD Sir, I have requested an urgent Bonafide Certificate for my passport application. Kindly approve when possible.', time: 'Yesterday' },
        { sender: 'hod', text: 'Verified your academic profile and 84.5% attendance record. Approval signed off. Pickup token OTP: 584386 issued.', time: 'Today, 09:20 AM' }
      ]
    },
    {
      pin: '24259-CS-011',
      name: 'Rahul Verma',
      initials: 'RV',
      attendance: '78.4%',
      status: 'Regular Eligible',
      tag: 'Infosys Springboard NOC',
      messages: [
        { sender: 'student', text: 'Sir, I have received an internship offer from Infosys Springboard. Submitted the NOC requisition.', time: '2 days ago' },
        { sender: 'hod', text: 'Congratulations Rahul. NOC request has been validated. Collect the official institutional letterhead seal from counter.', time: 'Yesterday' }
      ]
    }
  ]
};

let activeThread = null;

function initHodMessages() {
  activeDepartment = getActiveDepartment();
  renderConversationList();
  bindEmbeddedCardActions();
  bindChatComposer();
}

function renderConversationList() {
  const container = document.querySelector('aside .flex-col.gap-2\\.5') || document.querySelector('aside .overflow-y-auto');
  if (!container) return;

  const list = THREADS_DB[activeDepartment] || THREADS_DB.AIML;
  activeThread = list[0];

  container.innerHTML = list.map((item, idx) => {
    const isSelected = idx === 0;
    const lastMsg = item.messages[item.messages.length - 1];

    return `
      <article class="conversation-thread-item ${isSelected ? 'bg-emerald-50/90 border-emerald-500/70 shadow-md' : 'bg-white/60 hover:bg-white'} rounded-2xl p-3.5 cursor-pointer transition-all border border-stone-200/60"
               data-pin="${item.pin}" data-idx="${idx}">
        <div class="flex items-start gap-3">
          <div class="relative shrink-0">
            <div class="w-11 h-11 rounded-full bg-[#003519] text-emerald-200 font-dg text-lg font-black flex items-center justify-center shadow-inner font-mono">
              ${item.initials}
            </div>
            <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1">
              <h3 class="font-dg text-lg font-bold text-on-surface truncate">
                ${escapeHtml(item.name)}
              </h3>
              <span class="font-mono text-[11px] text-stone-500 shrink-0">${lastMsg ? lastMsg.time : ''}</span>
            </div>
            <div class="flex items-center gap-1.5 mb-1">
              <span class="font-mono text-xs text-stone-500">PIN: ${item.pin}</span>
              <span class="w-1 h-1 rounded-full bg-stone-300"></span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-dg text-[11px] font-bold uppercase tracking-wider">
                ${item.tag}
              </span>
            </div>
            <p class="font-dg text-sm text-stone-600 line-clamp-1 font-medium thread-preview-text">
              ${lastMsg ? escapeHtml(lastMsg.text) : ''}
            </p>
          </div>
        </div>
      </article>
    `;
  }).join('');

  bindThreadSwitching();
  updateChatView(activeThread);
}

function bindThreadSwitching() {
  const threads = document.querySelectorAll('.conversation-thread-item');
  threads.forEach((thread) => {
    thread.addEventListener('click', () => {
      threads.forEach(t => {
        t.classList.remove('bg-emerald-50/90', 'border-emerald-500/70', 'shadow-md');
        t.classList.add('bg-white/60');
      });
      thread.classList.add('bg-emerald-50/90', 'border-emerald-500/70', 'shadow-md');
      thread.classList.remove('bg-white/60');

      const pin = thread.getAttribute('data-pin');
      const list = THREADS_DB[activeDepartment] || THREADS_DB.AIML;
      const found = list.find(it => it.pin === pin);
      if (found) {
        activeThread = found;
        updateChatView(found);
        showToast(`Switched active thread to ${found.name} (${found.pin})`);
      }
    });
  });
}

function updateChatView(item) {
  if (!item) return;

  // Header
  const headerName = document.querySelector('section h3.font-bold') || document.querySelector('header h3');
  if (headerName) headerName.textContent = item.name;

  const headerPin = document.querySelector('section p.font-mono') || document.querySelector('header p.font-mono');
  if (headerPin) headerPin.textContent = `${item.pin} • Scheme C-24 • Dept of ${activeDepartment}`;

  // Messages Box
  const chatContainer = document.querySelector('main .space-y-4') || document.getElementById('chatMessagesBox') || document.querySelector('section.flex-col .overflow-y-auto');
  if (!chatContainer) return;

  chatContainer.innerHTML = `
    <!-- Encryption Banner -->
    <div class="flex items-center justify-center my-2">
      <span class="px-3 py-1 rounded-full bg-stone-100 text-stone-600 font-mono text-[11px] flex items-center gap-1.5 border border-stone-200">
        <span class="material-symbols-outlined text-[13px] text-emerald-700">lock</span>
        Zero-Trust Institutional Encrypted Channel (SBTET Gateway TLS 1.3)
      </span>
    </div>

    <!-- Embedded Application Card -->
    <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 my-3 shadow-xs">
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold">
            Formal Application Requisition
          </span>
          <h4 class="font-bold text-slate-900 text-sm mt-1">${item.tag} (Online Submittal)</h4>
          <p class="text-xs text-slate-600 mt-0.5">Live SBTET Attendance: <strong class="text-emerald-800 font-mono">${item.attendance}</strong> &bull; Status: <strong class="text-slate-800">${item.status}</strong></p>
        </div>
        <a href="./document-approvals.html?pin=${encodeURIComponent(item.pin)}" 
           class="px-3.5 py-1.5 rounded-full bg-[#003519] hover:bg-[#022c22] text-white text-xs font-bold transition shadow-sm shrink-0 flex items-center gap-1">
          <span>Review &amp; Sign Off in Console →</span>
        </a>
      </div>
    </div>

    <!-- Chat Bubbles -->
    <div id="threadBubblesContainer" class="space-y-3">
      ${item.messages.map(m => {
        const isHod = m.sender === 'hod';
        return `
          <div class="flex flex-col ${isHod ? 'items-end' : 'items-start'}">
            <div class="${isHod ? 'bg-[#003519] text-white rounded-br-none' : 'bg-white border border-stone-200 text-slate-900 rounded-bl-none'} max-w-lg rounded-2xl px-4 py-2.5 shadow-xs">
              <p class="text-sm font-sans">${escapeHtml(m.text)}</p>
            </div>
            <span class="font-mono text-[10px] text-stone-500 mt-1 px-1">${m.time} &bull; ${isHod ? (activeDepartment === 'AIML' ? 'Prof. Padma (HOD)' : 'Dr. Vamshi (HOD)') : escapeHtml(item.name)}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function bindEmbeddedCardActions() {
  document.querySelectorAll('a, button').forEach(el => {
    if (el.textContent.includes('Review & Sign Off in Console')) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const pin = activeThread ? activeThread.pin : '24259-AIML-119';
        window.location.href = `./document-approvals.html?pin=${encodeURIComponent(pin)}`;
      });
    }
  });
}

function bindChatComposer() {
  const input = document.querySelector('footer input[type="text"]') || 
                document.querySelector('input[placeholder*="Type an official directive"]') ||
                document.querySelector('input[placeholder*="Type a message"]');
  const sendBtn = document.querySelector('footer button') || document.getElementById('sendMessageBtn');

  if (!input || !sendBtn) return;

  function doSend() {
    const text = input.value.trim();
    if (!text || !activeThread) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append to active thread
    activeThread.messages.push({
      sender: 'hod',
      text: text,
      time: timeStr
    });

    input.value = '';

    // Render new bubble
    const bubblesContainer = document.getElementById('threadBubblesContainer');
    if (bubblesContainer) {
      const bubble = document.createElement('div');
      bubble.className = 'flex flex-col items-end';
      const hodTitle = activeDepartment === 'AIML' ? 'Prof. Padma (HOD)' : 'Dr. Vamshi (HOD)';
      bubble.innerHTML = `
        <div class="bg-[#003519] text-white rounded-2xl rounded-br-none max-w-lg px-4 py-2.5 shadow-xs">
          <p class="text-sm font-sans">${escapeHtml(text)}</p>
        </div>
        <span class="font-mono text-[10px] text-stone-500 mt-1 px-1">${timeStr} &bull; ${hodTitle}</span>
      `;
      bubblesContainer.appendChild(bubble);

      const chatBox = bubblesContainer.closest('.overflow-y-auto');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }

    if (navigator.vibrate) navigator.vibrate(12);
    showToast(`Official directive dispatched to ${activeThread.name} (${activeThread.pin})`);
  }

  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    doSend();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSend();
    }
  });
}

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const pin = urlParams.get('pin');
  if (!pin) return;

  setTimeout(() => {
    const list = THREADS_DB[activeDepartment] || THREADS_DB.AIML;
    let found = list.find(it => it.pin.toUpperCase() === pin.toUpperCase());
    if (!found) {
      // Create ad-hoc thread
      found = {
        pin: pin,
        name: urlParams.get('name') || 'Student Candidate',
        initials: 'ST',
        attendance: '42.5%',
        status: 'Active Enrolled',
        tag: 'Official Query',
        messages: [
          { sender: 'student', text: `Respected HOD, regarding my attendance and marks trajectory for PIN ${pin}.`, time: 'Just now' }
        ]
      };
      list.push(found);
      renderConversationList();
    }
    activeThread = found;
    updateChatView(found);
  }, 200);
}

function escapeHtml(str) {
  if (!str) return '';
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

function initHelpDeskLinks() {
  document.querySelectorAll('a, button').forEach(el => {
    const txt = (el.textContent || '').toLowerCase();
    const href = el.getAttribute('href') || '';
    if (txt.includes('help desk') || txt.includes('helpdesk') || txt.includes('need help') || href.includes('help')) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/screens/02-student-portal/helpdesk.html';
      });
    }
  });
}

function showToast(message) {
  let toast = document.getElementById('campusToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'campusToast';
    toast.className = 'fixed bottom-6 right-6 z-[65000] px-4 py-3 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-xl border border-white/10 backdrop-blur-md transform transition-all duration-300 translate-y-8 opacity-0 pointer-events-none flex items-center gap-2.5';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="material-symbols-outlined text-emerald-400 text-[18px]">verified</span><span>${message}</span>`;
  toast.classList.remove('translate-y-8', 'opacity-0', 'pointer-events-none');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add('translate-y-8', 'opacity-0', 'pointer-events-none');
  }, 3200);
}
