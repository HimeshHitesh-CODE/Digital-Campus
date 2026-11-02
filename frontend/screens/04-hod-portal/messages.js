/**
 * Samskruti College HOD Campus Messages Controller
 * Real-Time Two-Way Encrypted Chat: Instant Send, Interactive Receiving, and Thread Switching
 */

document.addEventListener('DOMContentLoaded', () => {
  initHodMessages();
  checkUrlParams();
  initHelpDeskLinks();
});

let activeThreadStudent = {
  name: 'Karnati Himesh',
  pin: '24259-CS-025',
  attendance: '27.8%',
  status: 'Detained Deficit'
};

const THREAD_DATA = {
  '24259-CS-025': {
    name: 'Karnati Himesh',
    pin: '24259-CS-025',
    attendance: '27.8%',
    status: 'Detained Deficit',
    messages: [
      { sender: 'student', text: 'Respected Dr. Vamshi Krishna, I have submitted my Medical Board application for attendance condonation (Ref: SC-COND-041). Please consider my hospitalization records.', time: '10:45 AM' },
      { sender: 'hod', text: 'Application reviewed. Your attendance is at 27.8%, which falls under the statutory detention bracket. Bring the original Civil Surgeon fitness certificate and attendance appeal slip to my chamber at 2:30 PM today.', time: '11:15 AM' }
    ]
  },
  '24259-CS-040': {
    name: 'Tallapalli Tulasi Ram Goud',
    pin: '24259-CS-040',
    attendance: '84.5%',
    status: 'Regular Eligible',
    messages: [
      { sender: 'student', text: 'Respected HOD Sir, I have requested an urgent Bonafide Certificate for my passport application. Kindly approve when possible.', time: 'Yesterday' },
      { sender: 'hod', text: 'Verified your academic profile and 84.5% attendance record. Approval signed off. Pickup token OTP: 584386 issued.', time: 'Today, 09:20 AM' }
    ]
  },
  '24259-CS-011': {
    name: 'Rahul Verma',
    pin: '24259-CS-011',
    attendance: '78.4%',
    status: 'Regular Eligible',
    messages: [
      { sender: 'student', text: 'Sir, I have received an internship offer from Infosys Springboard. Submitted the NOC requisition.', time: '2 days ago' },
      { sender: 'hod', text: 'Congratulations Rahul. NOC request has been validated. Collect the official institutional letterhead seal from counter.', time: 'Yesterday' }
    ]
  }
};

function initHodMessages() {
  bindThreadSwitching();
  bindEmbeddedCardActions();
  bindChatComposer();
}

function bindThreadSwitching() {
  const threads = document.querySelectorAll('article, [data-purpose="conversation-item"]');
  threads.forEach((thread, idx) => {
    thread.style.cursor = 'pointer';
    thread.addEventListener('click', () => {
      // Highlight active thread
      threads.forEach(t => {
        t.classList.remove('bg-emerald-50/90', 'border-emerald-500/70', 'shadow-md');
        t.classList.add('bg-white/60');
      });
      thread.classList.add('bg-emerald-50/90', 'border-emerald-500/70', 'shadow-md');
      thread.classList.remove('bg-white/60');

      // Clear unread badge
      const unread = thread.querySelector('span.bg-emerald-500, span.rounded-full.bg-emerald-600');
      if (unread) unread.remove();

      const name = thread.querySelector('span.font-bold, span.font-extrabold, h3')?.textContent.trim() || 'Student';
      const pin = idx === 0 ? '24259-CS-025' : (idx === 1 ? '24259-CS-040' : '24259-CS-011');

      activeThreadStudent = {
        name,
        pin,
        attendance: pin === '24259-CS-025' ? '27.8%' : (pin === '24259-CS-040' ? '84.5%' : '78.4%'),
        status: pin === '24259-CS-025' ? 'Detained Deficit' : 'Regular Eligible'
      };

      updateActiveChatHeader(activeThreadStudent);
      showToast(`Encrypted communication relay switched to ${name} (${pin})`);
    });
  });
}

function updateActiveChatHeader(student) {
  const headerName = document.querySelector('section.flex-col h3') || document.querySelector('section h3.font-bold');
  if (headerName) headerName.textContent = student.name;

  const headerPin = document.querySelector('section.flex-col p.font-mono') || document.querySelector('section p.font-mono');
  if (headerPin) headerPin.textContent = `${student.pin} • Scheme C-24 • Dept of CSE`;
}

function bindEmbeddedCardActions() {
  // Wire "Review & Sign Off in Console →" inside embedded card to route to Approvals
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent || '';
    if (txt.includes('Review & Sign Off in Console')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Routing to Document Approvals terminal for immediate sign-off...');
        setTimeout(() => {
          window.location.href = `./document-approvals.html?pin=${encodeURIComponent(activeThreadStudent.pin)}`;
        }, 400);
      });
    }
  });
}

function bindChatComposer() {
  const input = document.querySelector('input[placeholder*="Type your message"]') || document.querySelector('input[type="text"]');
  const sendBtn = document.querySelector('button[type="submit"]') || Array.from(document.querySelectorAll('button')).find(b => b.querySelector('.material-symbols-outlined')?.textContent === 'send');

  function sendMessage() {
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    if (navigator.vibrate) navigator.vibrate(10);

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Find message scroll stream
    const stream = document.querySelector('.overflow-y-auto') || document.querySelector('section .flex-grow');
    if (!stream) return;

    // Append outgoing bubble
    const bubble = document.createElement('div');
    bubble.className = 'flex flex-col items-end gap-1 mt-4 animate-fade-in';
    bubble.innerHTML = `
      <div class="max-w-[85%] sm:max-w-[70%] p-3.5 sm:p-4 rounded-[22px] rounded-tr-none text-white font-dg text-lg font-medium shadow-sm leading-relaxed" 
           style="background: linear-gradient(135deg, #003519, #047857);">
        ${escapeHtml(text)}
      </div>
      <div class="flex items-center gap-1 px-2 font-dg text-xs text-stone-500 font-bold">
        <span>${timeFormatted}</span>
        <span class="material-symbols-outlined text-[14px] text-emerald-600">done_all</span>
      </div>
    `;
    stream.appendChild(bubble);
    stream.scrollTop = stream.scrollHeight;

    input.value = '';
    showToast(`Dispatched message to ${activeThreadStudent.name}.`);

    // Simulate Receiving Reply from Student
    simulateStudentReply(text, stream);
  }

  sendBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function simulateStudentReply(outgoingText, stream) {
  // Show Typing Indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'flex items-center gap-2 mt-3 text-stone-500 font-dg text-sm italic font-medium px-2 animate-pulse';
  typingEl.id = 'studentTypingIndicator';
  typingEl.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
    <span>${activeThreadStudent.name} is drafting a response...</span>
  `;
  stream.appendChild(typingEl);
  stream.scrollTop = stream.scrollHeight;

  setTimeout(() => {
    typingEl.remove();

    // Contextual reply based on student & message
    let replyText = 'Thank you for the instructions Dr. Vamshi Krishna, I will comply immediately and report back.';

    if (activeThreadStudent.pin === '24259-CS-025') {
      if (outgoingText.toLowerCase().includes('condonation') || outgoingText.toLowerCase().includes('medical') || outgoingText.toLowerCase().includes('certificate')) {
        replyText = 'Understood Dr. Vamshi Krishna. I have the civil hospital medical memo and attendance appeal docket ready. I will bring both hardcopies to your chamber at 2:30 PM.';
      } else {
        replyText = 'Noted sir. Thank you for your guidance on my semester progress. I will attend the remedial sessions regularly.';
      }
    } else if (activeThreadStudent.pin === '24259-CS-040') {
      replyText = 'Thank you very much sir! I will collect the counter token and head to the administrative desk for the stamped copy.';
    } else if (activeThreadStudent.pin === '24259-CS-011') {
      replyText = 'Thank you HOD Sir! I will ensure my company joining report is submitted through the department portal.';
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const incomingBubble = document.createElement('div');
    incomingBubble.className = 'flex flex-col items-start gap-1 mt-3 animate-fade-in';
    incomingBubble.innerHTML = `
      <div class="flex items-center gap-2 mb-0.5">
        <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center font-mono">
          ${activeThreadStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </span>
        <span class="font-dg text-xs text-stone-600 font-bold">${escapeHtml(activeThreadStudent.name)}</span>
      </div>
      <div class="max-w-[85%] sm:max-w-[70%] p-3.5 sm:p-4 rounded-[22px] rounded-tl-none bg-white text-stone-800 font-dg text-lg font-medium shadow-xs border border-stone-200 leading-relaxed">
        ${escapeHtml(replyText)}
      </div>
      <div class="px-2 font-dg text-xs text-stone-400 font-semibold">
        ${timeFormatted} &bull; Verified Student Session
      </div>
    `;

    stream.appendChild(incomingBubble);
    stream.scrollTop = stream.scrollHeight;

    if (navigator.vibrate) navigator.vibrate([10, 40, 10]);
    showToast(`Incoming reply from ${activeThreadStudent.name}`);
  }, 1400);
}

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const pin = urlParams.get('pin');
  const name = urlParams.get('name');
  if (!pin) return;

  activeThreadStudent = {
    name: name || 'Student',
    pin: pin,
    attendance: 'Live Verified',
    status: 'Inquired'
  };

  updateActiveChatHeader(activeThreadStudent);

  const input = document.querySelector('input[placeholder*="Type your message"]') || document.querySelector('input[type="text"]');
  if (input) {
    input.focus();
    input.placeholder = `Type directive for ${activeThreadStudent.name}...`;
  }
}

function escapeHtml(str) {
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
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  if (!toast) return;

  msgEl.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(window._hodMsgToastTimeout);
  window._hodMsgToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
