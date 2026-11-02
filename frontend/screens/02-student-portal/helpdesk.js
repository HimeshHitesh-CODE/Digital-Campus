/**
 * Samskruti College Help Desk & Grievance Redressal Controller
 * Interactive Dispatch, Category Selection, and Real-Time Requisition Logging
 */

document.addEventListener('DOMContentLoaded', () => {
  initHelpDesk();
});

function initHelpDesk() {
  bindCategoryCards();
  bindHelpdeskForm();
  loadStoredTickets();
}

function bindCategoryCards() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      const select = document.getElementById('issueCategory');
      if (select && cat) {
        select.value = cat;
        select.scrollIntoView({ behavior: 'smooth', block: 'center' });
        select.focus();

        if (navigator.vibrate) navigator.vibrate(10);
        showToast(`Category selected: ${cat}`);
      }
    });
  });
}

function bindHelpdeskForm() {
  const form = document.getElementById('helpdeskForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = document.getElementById('issueCategory')?.value || 'General Inquiry';
    const subject = document.getElementById('issueSubject')?.value.trim();
    const details = document.getElementById('issueDetails')?.value.trim();

    if (!subject || !details) return;

    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `#HD-2026-${randomNum}`;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const ticket = {
      id: ticketId,
      category,
      subject,
      details,
      status: 'Under Review',
      timestamp: `Today, ${timeFormatted}`
    };

    // Save to storage
    saveTicket(ticket);

    // Render in UI
    prependTicketToStream(ticket);

    // Reset Form
    form.reset();

    showToast(`Requisition ${ticketId} successfully lodged! Assigned to Academic Counselor.`);
  });
}

function prependTicketToStream(ticket) {
  const container = document.getElementById('ticketsListContainer');
  if (!container) return;

  const card = document.createElement('div');
  card.className = 'p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 space-y-2 animate-fade-in shadow-xs';
  card.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">${ticket.id}</span>
      <span class="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">${ticket.status}</span>
    </div>
    <h5 class="font-bold text-stone-900 text-sm">${escapeHtml(ticket.subject)}</h5>
    <p class="text-xs text-stone-600">${escapeHtml(ticket.category)} &bull; ${escapeHtml(ticket.details)}</p>
    <div class="text-[11px] text-emerald-800 font-mono font-semibold">Lodged: ${ticket.timestamp}</div>
  `;

  container.insertBefore(card, container.firstChild);

  // Update badge count
  const badge = document.getElementById('ticketCountBadge');
  if (badge) {
    const total = container.children.length;
    badge.textContent = `${total} Active Cases`;
  }
}

function saveTicket(ticket) {
  let stored = [];
  try {
    stored = JSON.parse(localStorage.getItem('campus_helpdesk_tickets') || '[]');
  } catch(e) {}
  stored.unshift(ticket);
  localStorage.setItem('campus_helpdesk_tickets', JSON.stringify(stored));
}

function loadStoredTickets() {
  let stored = [];
  try {
    stored = JSON.parse(localStorage.getItem('campus_helpdesk_tickets') || '[]');
  } catch(e) {}

  stored.forEach(ticket => {
    prependTicketToStream(ticket);
  });
}

function escapeHtml(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  if (!toast) return;

  msgEl.textContent = message;
  toast.classList.remove('hidden');

  clearTimeout(window._hdToastTimeout);
  window._hdToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
