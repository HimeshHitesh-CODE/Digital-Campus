/**
 * Samskruti College Campus Messages & Peer Threads Controller
 * Dynamic fill and full interactive logic for Stitch Campus Connect Messages
 */

document.addEventListener('DOMContentLoaded', () => {
  initMessages();
});

let currentThreadId = 'thread-gl';
let activeFilter = 'All';

function initMessages() {
  bindStudentMetadata();
  bindFilterChips();
  bindThreadSearch();
  bindThreadSelection();
  bindChatComposer();
  bindAuxiliaryActions();
  checkUrlParams();
}

/**
 * 1. Bind Student Header Metadata
 */
function bindStudentMetadata() {
  if (typeof StitchState === 'undefined') return;
  const user = StitchState.getUser();

  const metaEl = document.getElementById('msgStudentMeta');
  if (metaEl) {
    metaEl.textContent = `${user.name.toUpperCase()} (PIN: ${user.pin || '24259-CS-025'})`;
  }
}

/**
 * 2. Filter Chips (All, Direct & HOD, Idea Hub, Marketplace)
 */
function bindFilterChips() {
  const chips = document.querySelectorAll('.flex.items-center.gap-2.overflow-x-auto button');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => {
        c.className = 'px-4 py-1.5 rounded-full bg-white/70 hover:bg-white text-stone-600 border border-emerald-900/10 font-dg text-base font-semibold transition-all whitespace-nowrap';
      });
      chip.className = 'px-4 py-1.5 rounded-full bg-emerald-800 text-white font-dg text-base font-bold shadow-sm whitespace-nowrap';

      activeFilter = chip.textContent.trim().replace(/\(\d+\)/, '').trim();
      filterThreads();
    });
  });
}

/**
 * 3. Thread Search
 */
function bindThreadSearch() {
  const input = document.getElementById('threadSearchInput');
  if (!input) return;

  input.addEventListener('input', () => {
    filterThreads();
  });
}

function filterThreads() {
  const searchInput = document.getElementById('threadSearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const articles = document.querySelectorAll('#threadsListContainer article');

  articles.forEach(article => {
    const text = article.textContent.toLowerCase();
    const matchesSearch = (!query || text.includes(query));

    let matchesFilter = true;
    if (activeFilter === 'Direct & HOD') {
      matchesFilter = text.includes('hod') || text.includes('vamshi');
    } else if (activeFilter === 'Idea Hub') {
      matchesFilter = text.includes('idea hub');
    } else if (activeFilter === 'Marketplace') {
      matchesFilter = text.includes('marketplace') || text.includes('item') || text.includes('coat');
    }

    if (matchesSearch && matchesFilter) {
      article.style.display = 'flex';
    } else {
      article.style.display = 'none';
    }
  });
}

/**
 * 4. Thread Selection & Switching
 */
function bindThreadSelection() {
  const articles = document.querySelectorAll('#threadsListContainer article');
  articles.forEach((art, idx) => {
    art.addEventListener('click', () => {
      // Clear borders
      articles.forEach(a => {
        a.className = 'p-3.5 rounded-[24px] bg-white/60 hover:bg-white border border-emerald-900/5 hover:border-emerald-200/80 transition-all flex items-start gap-3.5 cursor-pointer shadow-sm';
      });

      // Highlight active
      art.className = 'p-3.5 rounded-[24px] bg-white border-2 border-emerald-500/80 transition-all flex items-start gap-3.5 cursor-pointer shadow-md';

      // Clear unread dot
      const unreadDot = art.querySelector('span.w-3.h-3.rounded-full');
      if (unreadDot) unreadDot.remove();

      // Extract thread metadata
      const name = art.querySelector('h3, span.text-xl, span.text-on-surface')?.textContent.trim() || 'Chat Peer';
      const pin = art.querySelector('span.text-sm.truncate')?.textContent.trim() || 'PIN: 24259-CS-XXX';
      const badge = art.querySelector('.rounded-full.bg-emerald-100, .rounded-full.bg-stone-200, .rounded-full.bg-emerald-900\\/10')?.textContent.trim() || 'Peer';
      const initials = art.querySelector('.w-12.h-12')?.textContent.trim() || 'CP';

      updateChatHeader({ name, pin, badge, initials });
    });
  });
}

function updateChatHeader(data) {
  const nameEl = document.getElementById('activeChatName');
  const pinEl = document.getElementById('activeChatPin');
  const badgeEl = document.getElementById('activeChatBadge');
  const avatarEl = document.getElementById('activeChatAvatar');

  if (nameEl) nameEl.textContent = data.name;
  if (pinEl) pinEl.textContent = data.pin;
  if (badgeEl) badgeEl.textContent = data.badge;
  if (avatarEl) avatarEl.textContent = data.initials;
}

/**
 * 5. Live Chat Stream & Composer
 */
function bindChatComposer() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');
  const stream = document.getElementById('chatMessageStream');

  function handleSend(e) {
    if (e) e.preventDefault();
    if (!input || !stream) return;

    const text = input.value.trim();
    if (!text) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Append my message bubble
    const myMsg = document.createElement('div');
    myMsg.className = 'flex flex-col items-end gap-1';
    myMsg.innerHTML = `
      <div class="max-w-[85%] sm:max-w-[70%] p-3.5 sm:p-4 rounded-[22px] rounded-tr-none text-white font-dg text-lg font-medium shadow-sm leading-relaxed" 
           style="background: linear-gradient(135deg, #059669, #047857);">
        ${escapeHtml(text)}
      </div>
      <span class="font-dg text-xs text-stone-500 font-bold px-2">${timeFormatted}</span>
    `;
    stream.appendChild(myMsg);

    // Update active thread snippet
    const activeArt = document.querySelector('#threadsListContainer article.border-2');
    if (activeArt) {
      const snippet = activeArt.querySelector('p.font-dg');
      if (snippet) snippet.textContent = text;
      const timeEl = activeArt.querySelector('span.text-sm.font-bold');
      if (timeEl) timeEl.textContent = timeFormatted;
    }

    input.value = '';
    stream.scrollTop = stream.scrollHeight;

    // Simulate realistic contextual response after 1.4s
    setTimeout(() => {
      const replyMsg = document.createElement('div');
      replyMsg.className = 'flex flex-col items-start gap-1';
      replyMsg.innerHTML = `
        <div class="max-w-[85%] sm:max-w-[70%] p-3.5 sm:p-4 rounded-[22px] rounded-tl-none bg-white text-emerald-950 font-dg text-lg font-medium border border-emerald-900/10 shadow-sm leading-relaxed">
          Acknowledged, Himesh! Verified on our college portal registry.
        </div>
        <span class="font-dg text-xs text-stone-500 font-bold px-2">${timeFormatted}</span>
      `;
      stream.appendChild(replyMsg);
      stream.scrollTop = stream.scrollHeight;
    }, 1400);
  }

  sendBtn?.addEventListener('click', handleSend);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/**
 * 6. Check URL Parameters to auto-switch or seed thread
 */
function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const peer = params.get('peer');
  const seller = params.get('seller');
  const targetName = peer || seller;

  if (targetName) {
    // If thread exists in list, click it to activate
    const articles = document.querySelectorAll('#threadsListContainer article');
    let matched = false;
    articles.forEach(art => {
      if (art.textContent.toLowerCase().includes(targetName.toLowerCase())) {
        art.click();
        matched = true;
      }
    });

    if (!matched) {
      updateChatHeader({
        name: targetName.toUpperCase(),
        pin: params.get('pin') || 'PIN: 24259-CS-XXX',
        badge: seller ? 'Marketplace Seller' : 'Idea Hub Collab',
        initials: targetName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      });
      showToast(`Encrypted direct message thread opened with ${targetName}`);
    }
  }
}

/**
 * 7. Auxiliary Popovers & Actions
 */
function bindAuxiliaryActions() {
  document.querySelectorAll('button').forEach(btn => {
    const text = btn.textContent || '';
    const span = btn.querySelector('.material-symbols-outlined');
    const icon = span ? span.textContent.trim() : '';

    if (icon === 'attach_file') {
      btn.addEventListener('click', () => {
        showToast('Encrypted document & image attachment drawer ready (Max 15MB)');
      });
    } else if (icon === 'sentiment_satisfied') {
      btn.addEventListener('click', () => {
        showToast('Campus stickers & academic emojis unlocked: 🎓 📚 💻 ⚡');
      });
    } else if (icon === 'call' || text.includes('Call')) {
      btn.addEventListener('click', () => {
        showToast('Establishing peer voice session via SCET campus VoIP relay...');
      });
    }
  });
}

/**
 * 8. Toast Helper
 */
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) return;

  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');

  clearTimeout(window._msgToastTimeout);
  window._msgToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
