/**
 * Samskruti College Idea Hub & Peer Directory Controller
 * Fresh Zero-State Configuration, Interactive Skill Management, and Collaborative Squad Invites
 */

document.addEventListener('DOMContentLoaded', () => {
  initIdeaHub();
  initHelpDeskLinks();
});

let activeSkillFilter = 'all';
let peerSearchQuery = '';

function initIdeaHub() {
  bindStudentMetadata();
  bindCollabToggle();
  bindSkillsManagement();
  bindInvitesModal();
  bindSyncGithub();
  bindFilterPillsAndSearch();
  bindPeerCardActions();
  bindHackathonActions();
}

/**
 * 1. Bind Student Header Metadata
 */
function bindStudentMetadata() {
  if (typeof StitchState === 'undefined') return;
  const user = StitchState.getUser();

  const nameEl = document.getElementById('hubStudentName');
  if (nameEl) nameEl.textContent = user.name || 'Karnati Himesh';

  const pinEl = document.getElementById('hubStudentPin');
  if (pinEl) pinEl.textContent = `PIN: ${user.pin || '24259-CS-025'}`;
}

/**
 * 2. Collab Availability Toggle Switch
 */
function bindCollabToggle() {
  const toggle = document.getElementById('collab-toggle');
  const knob = document.getElementById('collab-knob');
  const statusText = document.getElementById('collabStatusText');

  // Load persisted or default to true
  let isAvailable = localStorage.getItem('campus_collab_available') !== 'false';

  function updateToggleUI(state) {
    if (!toggle || !knob) return;
    if (state) {
      toggle.classList.remove('bg-stone-500');
      toggle.classList.add('bg-emerald-400');
      knob.classList.add('translate-x-5');
      knob.classList.remove('translate-x-0');
      toggle.setAttribute('aria-pressed', 'true');
      if (statusText) statusText.textContent = 'Available for Projects';
    } else {
      toggle.classList.add('bg-stone-500');
      toggle.classList.remove('bg-emerald-400');
      knob.classList.remove('translate-x-5');
      knob.classList.add('translate-x-0');
      toggle.setAttribute('aria-pressed', 'false');
      if (statusText) statusText.textContent = 'Offline / In Sprint';
    }
  }

  updateToggleUI(isAvailable);

  toggle?.addEventListener('click', () => {
    isAvailable = !isAvailable;
    localStorage.setItem('campus_collab_available', isAvailable ? 'true' : 'false');
    updateToggleUI(isAvailable);
    if (navigator.vibrate) navigator.vibrate(10);
    showToast(isAvailable ? 'Status updated: You are now Available for Projects!' : 'Status updated: Offline / In Sprint (Invites paused)');
  });
}

/**
 * 3. Dynamic Skills: Add & Remove Tag Pills
 */
function bindSkillsManagement() {
  const addBtn = document.getElementById('btnAddSkillBtn');
  const editHeaderBtn = document.getElementById('btnEditMySkills');
  const modal = document.getElementById('modalAddSkill');
  const form = document.getElementById('formAddSkill');
  const container = document.getElementById('skillsTagsContainer');

  function openSkillModal() {
    if (modal) modal.classList.remove('hidden');
    document.getElementById('newSkillInput')?.focus();
  }

  addBtn?.addEventListener('click', openSkillModal);
  editHeaderBtn?.addEventListener('click', openSkillModal);

  modal?.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => modal.classList.add('hidden'));
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Load stored skills
  let storedSkills = [];
  try {
    storedSkills = JSON.parse(localStorage.getItem('campus_user_skills') || '[]');
  } catch(e) {}

  storedSkills.forEach(s => addSkillTag(s, false));

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newSkillInput');
      const skillName = input?.value.trim();
      if (!skillName) return;

      addSkillTag(skillName, true);
      input.value = '';
      modal.classList.add('hidden');
      showToast(`Skill "${skillName}" published to your verified profile!`);
    });
  }

  // Bind removal on existing skill pill '×'
  container?.addEventListener('click', (e) => {
    if (e.target.closest('.remove-skill-btn') || e.target.textContent.trim() === '×') {
      const pill = e.target.closest('span');
      if (pill && pill !== addBtn) {
        const text = pill.textContent.replace('×', '').trim();
        pill.remove();

        // Remove from storage
        let skills = [];
        try {
          skills = JSON.parse(localStorage.getItem('campus_user_skills') || '[]');
        } catch(err) {}
        skills = skills.filter(item => item !== text);
        localStorage.setItem('campus_user_skills', JSON.stringify(skills));

        showToast(`Skill "${text}" removed from profile.`);
      }
    }
  });
}

function addSkillTag(name, saveToStorage = true) {
  const container = document.getElementById('skillsTagsContainer');
  const addBtn = document.getElementById('btnAddSkillBtn');
  if (!container) return;

  const tag = document.createElement('span');
  tag.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-400/40 text-white font-medium hover:border-emerald-300 transition-all text-xs';
  tag.innerHTML = `${escapeHtml(name)} <button type="button" class="remove-skill-btn text-emerald-300 hover:text-white font-bold ml-1 cursor-pointer">×</button>`;

  if (addBtn) {
    container.insertBefore(tag, addBtn);
  } else {
    container.appendChild(tag);
  }

  if (saveToStorage) {
    let skills = [];
    try {
      skills = JSON.parse(localStorage.getItem('campus_user_skills') || '[]');
    } catch(e) {}
    if (!skills.includes(name)) skills.push(name);
    localStorage.setItem('campus_user_skills', JSON.stringify(skills));
  }
}

/**
 * 4. Invites Modal
 */
function bindInvitesModal() {
  const trigger = document.getElementById('btnPendingInvites');
  const modal = document.getElementById('modalInvites');
  if (!trigger || !modal) return;

  trigger.addEventListener('click', () => modal.classList.remove('hidden'));

  modal.querySelectorAll('.close-modal-btn').forEach(b => {
    b.addEventListener('click', () => modal.classList.add('hidden'));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  window.acceptInvite = function (btn) {
    const card = btn.closest('.p-4');
    if (card) {
      card.innerHTML = `<span class="text-sm font-bold text-emerald-700">✓ Accepted! Squad thread unlocked in Messages.</span>`;
    }
    showToast('Collaboration invite accepted! Opening direct messages...');
    setTimeout(() => {
      window.location.href = './messages.html';
    }, 1000);
  };
}

/**
 * 5. Sync GitHub / Portfolio Action
 */
function bindSyncGithub() {
  const btn = document.getElementById('btnSyncGithub');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const original = btn.innerHTML;
    btn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span> Syncing...`;
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = `<span class="material-symbols-outlined text-[16px]">done_all</span> Synced`;
      showToast('GitHub repositories & commits verified via Academic Student Pack');
      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
      }, 2500);
    }, 1200);
  });
}

/**
 * 6. Filter Pills & Search (Ctrl+K)
 */
function bindFilterPillsAndSearch() {
  const filterButtons = document.querySelectorAll('.skill-filter-btn');
  const searchInput = document.getElementById('peer-search-input');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm', 'border-emerald-600');
        b.classList.add('bg-white', 'text-stone-800', 'border-emerald-900/15');
      });
      btn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm', 'border-emerald-600');
      btn.classList.remove('bg-white', 'text-stone-800', 'border-emerald-900/15');

      activeSkillFilter = btn.getAttribute('data-filter') || 'all';
      filterPeerCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      peerSearchQuery = e.target.value.toLowerCase().trim();
      filterPeerCards();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
}

function filterPeerCards() {
  const peerCards = document.querySelectorAll('.peer-card');

  peerCards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const matchesSearch = (!peerSearchQuery || text.includes(peerSearchQuery));

    let matchesFilter = (activeSkillFilter === 'all');
    if (activeSkillFilter === 'web') {
      matchesFilter = (text.includes('web') || text.includes('react') || text.includes('next.js') || text.includes('html'));
    } else if (activeSkillFilter === 'python') {
      matchesFilter = text.includes('python');
    } else if (activeSkillFilter === 'design') {
      matchesFilter = (text.includes('ui/ux') || text.includes('figma'));
    } else if (activeSkillFilter === 'poster') {
      matchesFilter = (text.includes('poster') || text.includes('branding'));
    } else if (activeSkillFilter === 'ppt') {
      matchesFilter = (text.includes('ppt') || text.includes('presentation') || text.includes('orator'));
    } else if (activeSkillFilter === 'video') {
      matchesFilter = (text.includes('video') || text.includes('media') || text.includes('creative'));
    }

    if (matchesSearch && matchesFilter) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

/**
 * 7. Peer Card Action Buttons: Invite to Project & Chat
 */
function bindPeerCardActions() {
  document.addEventListener('click', (e) => {
    const target = e.target;

    // 1. Invite to project button
    const inviteBtn = target.closest('button');
    if (inviteBtn && inviteBtn.textContent.includes('Invite')) {
      e.preventDefault();
      const card = inviteBtn.closest('.peer-card');
      const peerName = card ? (card.querySelector('h3, .font-bold')?.textContent.trim() || 'Peer') : 'Peer';

      inviteBtn.innerHTML = `<span>Invite Sent ✓</span>`;
      inviteBtn.className = 'flex-1 py-2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-sm flex items-center justify-center gap-1 shadow-2xs';

      if (navigator.vibrate) navigator.vibrate(15);
      showToast(`Collaboration invitation dispatched to ${peerName}!`);
      return;
    }

    // 2. Chat bubble button
    if (target.closest('button') && (target.textContent.includes('chat') || target.closest('button').querySelector('.material-symbols-outlined')?.textContent.includes('chat'))) {
      const card = target.closest('.peer-card');
      const peerName = card ? (card.querySelector('h3, .font-bold')?.textContent.trim() || '') : '';
      if (peerName) {
        showToast(`Opening direct encrypted chat with ${peerName}...`);
        setTimeout(() => {
          window.location.href = `./messages.html?peer=${encodeURIComponent(peerName)}`;
        }, 500);
      }
    }
  });
}

/**
 * 8. Hackathon Banner Actions
 */
function bindHackathonActions() {
  const regBtn = document.getElementById('btnRegisterHackathon');
  if (regBtn) {
    regBtn.addEventListener('click', () => {
      showToast('SBTET State Hackathon 2025 registration portal opened. Team slot reserved (#HACK-SCET-09)');
    });
  }

  const guideBtn = document.getElementById('btnHackathonGuidelines');
  if (guideBtn) {
    guideBtn.addEventListener('click', () => {
      showToast('Downloading SBTET Hackathon 2025 Evaluation Guidelines PDF...');
    });
  }
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

function escapeHtml(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) return;

  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');

  clearTimeout(window._hubToastTimeout);
  window._hubToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
