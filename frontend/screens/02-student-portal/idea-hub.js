/**
 * Samskruti College Idea Hub & Peer Directory Controller
 * Kinetic Bento Tactile Design System Engine
 * SBTET Code 259 Student Peer Directory & Collaborative Capstone Hub
 */

document.addEventListener('DOMContentLoaded', () => {
  initIdeaHub();
});

let peersList = [];
let activeSkillFilter = 'all';
let searchQuery = '';
let selectedPeer = null;

function initIdeaHub() {
  bindStudentMetadata();
  bindEditSkillsModal();
  bindInvitesModal();
  bindInviteProjectModal();
  bindSearchAndFilters();
  loadPeers();
}

/**
 * 1. Default Peers Dataset
 */
function getDefaultPeers() {
  return [
    {
      id: 1,
      name: 'Gona Laxmi Narasimha Swami',
      pin: '24259-CS-001',
      roll: 'Roll #1',
      dept: 'CSE · Year II',
      specialty: 'Embedded IoT & Telemetry',
      domain: 'iot',
      bio: 'Working on low-power LoRa mesh nodes for agricultural automation. Experienced with ESP32, FreeRTOS, and C/C++.',
      skills: ['Embedded C', 'ESP32', 'FreeRTOS', 'LoRa', 'MQTT', 'Hardware Debugging'],
      available: true
    },
    {
      id: 2,
      name: 'Dulipudi Tarun',
      pin: '24259-CS-002',
      roll: 'Roll #2',
      dept: 'CSE · Year II',
      specialty: 'Distributed Systems & Cloud APIs',
      domain: 'backend',
      bio: 'Class Representative and backend developer focused on scalable FastAPI microservices, Postgres, and Docker pipelines.',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis', 'Linux'],
      available: true
    },
    {
      id: 3,
      name: 'Anaboina Dilip',
      pin: '24259-CS-003',
      roll: 'Roll #3',
      dept: 'CSE · Year II',
      specialty: 'Mobile App Architecture',
      domain: 'frontend',
      bio: 'Building cross-platform academic logistics tools with Flutter and React Native. Clean architecture advocate.',
      skills: ['Flutter', 'Dart', 'React Native', 'TailwindCSS', 'Firebase'],
      available: true
    },
    {
      id: 4,
      name: 'Pittala Bhavya',
      pin: '24259-CS-004',
      roll: 'Roll #4',
      dept: 'CSE · Year II',
      specialty: 'Deep Learning & NLP',
      domain: 'aiml',
      bio: 'Researching transformer architectures for multilingual Indian educational transcripts. Hugging Face and PyTorch power user.',
      skills: ['PyTorch', 'HuggingFace', 'Computer Vision', 'Data Science', 'Python'],
      available: true
    },
    {
      id: 5,
      name: 'Chaganti Srija',
      pin: '24259-CS-005',
      roll: 'Roll #5',
      dept: 'CSE · Year II',
      specialty: 'Design Systems & UI Engineering',
      domain: 'frontend',
      bio: 'Passionate about accessible tactile interfaces, micro-interactions, typography, and responsive component libraries.',
      skills: ['Figma', 'UI/UX', 'TailwindCSS', 'HTML/CSS', 'TypeScript', 'A11y'],
      available: true
    },
    {
      id: 6,
      name: 'Bolloju Satya Pavani',
      pin: '24259-CS-006',
      roll: 'Roll #6',
      dept: 'CSE · Year II',
      specialty: 'Cybersecurity & Network Auditing',
      domain: 'backend',
      bio: 'Conducting vulnerability assessments on academic intranets and wireless access points. Ethical hacking and cryptography.',
      skills: ['Network Security', 'Cryptography', 'Wireshark', 'Python', 'Linux Kernel'],
      available: false
    }
  ];
}

/**
 * 2. Bind Student Header & Hero Profile
 */
function bindStudentMetadata() {
  const user = getActiveUser();
  const name = user.name || 'Karnati Himesh';
  const pin = user.pin || '24259-CS-025';

  const nameEl = document.getElementById('hubStudentName');
  if (nameEl) nameEl.textContent = name;

  const pinEl = document.getElementById('hubStudentPin');
  if (pinEl) pinEl.textContent = `PIN: ${pin} · ${user.branch || 'CSE'} DEPT`;

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const initEl = document.getElementById('hubStudentInitials');
  if (initEl) initEl.textContent = initials;

  // Load custom saved skills
  const savedBio = localStorage.getItem('dc_my_bio');
  if (savedBio && document.getElementById('hubStudentBio')) {
    document.getElementById('hubStudentBio').textContent = savedBio;
  }

  const savedSkills = localStorage.getItem('dc_my_skills');
  if (savedSkills) {
    const list = JSON.parse(savedSkills);
    const container = document.getElementById('hubMySkillsContainer');
    if (container && Array.isArray(list)) {
      container.innerHTML = list.map(s => `
        <span class="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-stone-200">${escapeHtml(s)}</span>
      `).join('');
    }
  }
}

function getActiveUser() {
  if (typeof StitchState !== 'undefined' && StitchState.getUser) {
    return StitchState.getUser();
  }
  try {
    const stored = localStorage.getItem('dc_user');
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { name: 'Karnati Himesh', pin: '24259-CS-025', branch: 'CSE' };
}

/**
 * 3. Load Peers Directory
 */
function loadPeers() {
  peersList = getDefaultPeers();
  renderPeers();
}

/**
 * 4. Search and Filter Handling
 */
function bindSearchAndFilters() {
  const searchInput = document.getElementById('peerSearchInput');
  const clearBtn = document.getElementById('clearPeerSearchBtn');

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', searchQuery.length === 0);
    }
    renderPeers();
  });

  clearBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    searchQuery = '';
    clearBtn.classList.add('hidden');
    renderPeers();
  });

  const pills = document.querySelectorAll('.skill-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      activeSkillFilter = pill.getAttribute('data-skill') || 'all';

      pills.forEach(p => {
        p.className = 'skill-pill px-3.5 py-1.5 rounded-full text-[var(--color-muted)] hover:text-[var(--color-ink)] bg-[var(--color-card-subtle)] hover:bg-[var(--color-hairline)] whitespace-nowrap transition-colors cursor-pointer';
      });

      pill.className = 'skill-pill px-3.5 py-1.5 rounded-full font-medium bg-[var(--color-lime)] text-[var(--color-lime-ink)] shadow-2xs whitespace-nowrap active-pill cursor-pointer';

      renderPeers();
    });
  });
}

/**
 * 5. Render Peer Cards
 */
function renderPeers() {
  const grid = document.getElementById('peersGrid');
  const countEl = document.getElementById('peersCount');
  if (!grid) return;

  const filtered = peersList.filter(peer => {
    const matchesDomain = (activeSkillFilter === 'all' || peer.domain === activeSkillFilter);
    const matchesSearch = !searchQuery ||
      peer.name.toLowerCase().includes(searchQuery) ||
      peer.specialty.toLowerCase().includes(searchQuery) ||
      peer.skills.some(s => s.toLowerCase().includes(searchQuery));
    return matchesDomain && matchesSearch;
  });

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bento-card p-10 text-center flex flex-col items-center justify-center gap-3">
        <span class="material-symbols-outlined text-4xl text-[var(--color-muted)]">person_search</span>
        <h3 class="text-sm font-semibold text-[var(--color-ink)]">No students match these filters</h3>
        <p class="text-xs text-[var(--color-muted)]">Try selecting a different domain filter or searching with a broader keyword.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(peer => {
    const initials = peer.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return `
      <div class="bento-card p-5 flex flex-col justify-between gap-4 border border-[var(--color-hairline)] hover:translate-y-[-2px] transition-all min-w-0 overflow-hidden" data-id="${peer.id}">
        
        <!-- Top: Avatar, Name & Specialty -->
        <div class="flex items-start justify-between gap-2 pb-3 border-b border-[var(--color-hairline)] min-w-0">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <div class="relative w-10 h-10 rounded-full bg-[var(--color-feature-card)] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
              ${initials}
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${peer.available ? 'bg-emerald-500' : 'bg-stone-400'} ring-2 ring-[var(--color-card)]"></span>
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <h3 class="text-sm font-bold text-[var(--color-ink)] truncate">${escapeHtml(peer.name)}</h3>
              <span class="font-mono text-[11px] text-[var(--color-muted)] truncate">${peer.pin} · ${peer.dept}</span>
            </div>
          </div>
          <span class="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-lavender)] text-[#22174C] shrink-0 max-w-[120px] truncate" title="${escapeHtml(peer.specialty)}">
            ${escapeHtml(peer.specialty)}
          </span>
        </div>

        <!-- Middle: Bio & Skills -->
        <div class="flex flex-col gap-2 flex-1">
          <p class="text-xs text-[var(--color-muted)] line-clamp-2 leading-relaxed">${escapeHtml(peer.bio)}</p>
          <div class="flex flex-wrap gap-1 pt-1">
            ${peer.skills.map(s => `
              <span class="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-card-subtle)] text-[var(--color-ink)] border border-[var(--color-hairline)]">${escapeHtml(s)}</span>
            `).join('')}
          </div>
        </div>

        <!-- Bottom: Actions -->
        <div class="pt-3 border-t border-[var(--color-hairline)] flex items-center justify-between gap-2">
          <span class="font-mono text-[11px] ${peer.available ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-[var(--color-muted)]'} flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full ${peer.available ? 'bg-emerald-500' : 'bg-stone-400'}"></span>
            <span>${peer.available ? 'Open to Collab' : 'Busy'}</span>
          </span>

          <div class="flex items-center gap-1.5">
            <a href="/screens/02-student-portal/messages.html?to=${peer.pin}" class="btn-message-peer px-3 py-1.5 rounded-full bg-[var(--color-card-subtle)] hover:bg-[var(--color-hairline)] text-[var(--color-ink)] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">chat</span>
              <span>Message</span>
            </a>
            <button type="button" onclick="openInviteModal(${peer.id})" class="btn-invite-peer px-3.5 py-1.5 rounded-full bg-[var(--color-lime)] text-[var(--color-lime-ink)] text-xs font-semibold hover:opacity-90 active:scale-95 cursor-pointer transition-all flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">group_add</span>
              <span>Invite</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

/**
 * 6. Edit Skills Modal
 */
function bindEditSkillsModal() {
  const openBtn = document.getElementById('open-edit-skills-btn');
  const modal = document.getElementById('editSkillsModal');
  const form = document.getElementById('editSkillsForm');
  if (!modal) return;

  openBtn?.addEventListener('click', () => {
    const currentBio = document.getElementById('hubStudentBio')?.textContent.trim() || '';
    const bioInput = document.getElementById('modalBioInput');
    if (bioInput) bioInput.value = currentBio;

    const skillsEls = document.querySelectorAll('#hubMySkillsContainer span');
    const skillsArr = Array.from(skillsEls).map(s => s.textContent.trim());
    const skillsInput = document.getElementById('modalSkillsInput');
    if (skillsInput) skillsInput.value = skillsArr.join(', ');

    modal.classList.remove('hidden');
    bioInput?.focus();
  });

  modal.querySelectorAll('.close-skills-btn').forEach(btn => {
    btn.addEventListener('click', () => modal.classList.add('hidden'));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const newBio = document.getElementById('modalBioInput')?.value.trim();
    const skillsText = document.getElementById('modalSkillsInput')?.value.trim();
    const isCollab = document.getElementById('modalCollabCheckbox')?.checked;

    if (newBio) {
      localStorage.setItem('dc_my_bio', newBio);
      const bioEl = document.getElementById('hubStudentBio');
      if (bioEl) bioEl.textContent = newBio;
    }

    if (skillsText) {
      const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      localStorage.setItem('dc_my_skills', JSON.stringify(skills));
      const container = document.getElementById('hubMySkillsContainer');
      if (container) {
        container.innerHTML = skills.map(s => `
          <span class="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-stone-200">${escapeHtml(s)}</span>
        `).join('');
      }
    }

    const badge = document.getElementById('collabStatusBadge');
    if (badge) {
      badge.textContent = isCollab ? 'Open to Collaborate' : 'Currently Busy';
      badge.className = isCollab 
        ? 'font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--color-lime)] text-[var(--color-lime-ink)] font-semibold'
        : 'font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-stone-500 text-white font-medium';
    }

    modal.classList.add('hidden');
    showToast('Your skill profile has been updated and published.');
  });
}

/**
 * 7. Invite Project Modal
 */
function bindInviteProjectModal() {
  const modal = document.getElementById('inviteProjectModal');
  if (!modal) return;

  modal.querySelectorAll('.close-invite-btn').forEach(btn => {
    btn.addEventListener('click', () => modal.classList.add('hidden'));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  const sendBtn = document.getElementById('btnSendInvite');
  sendBtn?.addEventListener('click', () => {
    const role = document.getElementById('inviteRoleInput')?.value.trim();
    if (!role) {
      showToast('Please specify a role for this invitation.');
      document.getElementById('inviteRoleInput')?.focus();
      return;
    }

    modal.classList.add('hidden');
    document.getElementById('inviteRoleInput').value = '';
    const noteEl = document.getElementById('inviteNoteInput');
    if (noteEl) noteEl.value = '';

    showToast(`Project invitation sent to ${selectedPeer?.name || 'student'}.`);
  });
}

window.openInviteModal = function (peerId) {
  const peer = peersList.find(p => p.id == peerId);
  if (!peer) return;

  selectedPeer = peer;
  const modal = document.getElementById('inviteProjectModal');
  if (!modal) return;

  const targetNameEl = document.getElementById('inviteTargetName');
  if (targetNameEl) targetNameEl.textContent = peer.name;

  modal.classList.remove('hidden');
  document.getElementById('inviteRoleInput')?.focus();
};

/**
 * 8. Collaboration Invites Modal
 */
function bindInvitesModal() {
  const openBtn = document.getElementById('open-invites-btn');
  const modal = document.getElementById('collaborationInvitesModal');
  if (!modal) return;

  openBtn?.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  modal.querySelectorAll('.close-invites-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => modal.classList.add('hidden'));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Accept & Decline Handlers
  modal.querySelectorAll('.btn-accept-invite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('div.p-3\\.5') || e.target.closest('div');
      card?.remove();
      updateInvitesCount(-1);
      showToast('Project collaboration invitation accepted!');
    });
  });

  modal.querySelectorAll('.btn-decline-invite').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('div.p-3\\.5') || e.target.closest('div');
      card?.remove();
      updateInvitesCount(-1);
      showToast('Collaboration invitation declined.');
    });
  });
}

function updateInvitesCount(delta) {
  const pill = document.getElementById('invitesCountPill');
  if (!pill) return;
  let count = parseInt(pill.textContent) || 0;
  count = Math.max(0, count + delta);
  pill.textContent = count;
}

/**
 * 9. Escape HTML Helper
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
 * 10. Toast Notification Helper
 */
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;

  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');

  clearTimeout(window._hubToastTimeout);
  window._hubToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
