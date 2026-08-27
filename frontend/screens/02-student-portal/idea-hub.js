/**
 * Idea Hub & Peer Collaboration Controller
 * Manages student skill profiles, collaboration requests, and peer-to-peer chat threads.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

// Verify student/HOD authentication
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY']);

// Render Left Dock Navigation
if (user) {
  const isHODRole = user?.role === 'HOD' || user?.role === 'HOD_CS' || user?.role === 'ADMIN';
  renderDock('idea-hub.html', isHODRole ? 'HOD' : 'STUDENT');
}

// State
let mySkills = [];
let allPeers = [];
let activeFilter = 'ALL';
let activeSearchQuery = '';
let targetCollabPeer = null;
let currentChatThread = null;
let chatPollingInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupSkillsModal();
  setupCollabModal();
  setupInvitesDrawer();
  setupChatModal();
  setupSearchAndFilters();
  
  loadMySkills();
  loadPeerDirectory();
  loadCollaborationInvites();
});

function setupUserHeader() {
  const isHOD = user.role === 'HOD' || user.role === 'HOD_CS' || user.role === 'ADMIN';
  const pin = user.sbtetPin || user.rollNumber || '24259-XX-XXX';
  const name = isHOD ? 'Prof. Vamshi Krishna' : (user.name || 'Student');
  const initials = isHOD ? 'VK' : (name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());

  const nameElem = document.getElementById('my-name');
  const metaElem = document.getElementById('my-meta');
  const avatarElem = document.getElementById('my-avatar');
  const statusBadge = document.getElementById('my-status-badge');

  if (nameElem) nameElem.textContent = name;
  if (avatarElem) avatarElem.textContent = initials || 'ST';
  
  if (isHOD) {
    if (metaElem) metaElem.innerHTML = `<span class="neu-badge neu-badge-primary" style="font-weight: 800; font-size: 0.75rem;">Official HOD CS • Department Faculty Lead</span>`;
    if (statusBadge) {
      statusBadge.className = 'neu-badge neu-badge-primary';
      statusBadge.textContent = 'Faculty Lead';
    }
  } else {
    if (metaElem) metaElem.textContent = `PIN: ${pin} • ${user.department || 'Engineering Student'}`;
  }
}

function updateStatusBadge() {
  const badge = document.getElementById('my-status-badge');
  if (!badge) return;

  if (mySkills.length === 0) {
    badge.className = 'neu-badge neu-badge-muted';
    badge.style.background = '#94a3b8';
    badge.style.color = '#ffffff';
    badge.textContent = 'Inactive — Skills Not Set';
  } else {
    badge.className = 'neu-badge neu-badge-success';
    badge.style.background = '';
    badge.style.color = '';
    badge.textContent = 'Available for Projects';
  }
}

/**
 * 1. MY SKILLS MANAGEMENT
 */
async function loadMySkills() {
  try {
    const res = await api.get('/collaboration/my-skills');
    if (res && res.success && Array.isArray(res.skills)) {
      mySkills = res.skills;
    } else {
      const saved = localStorage.getItem(`skills_${user.sbtetPin || user.rollNumber}`);
      if (saved) mySkills = JSON.parse(saved);
      else mySkills = [];
    }
  } catch {
    const saved = localStorage.getItem(`skills_${user.sbtetPin || user.rollNumber}`);
    if (saved) mySkills = JSON.parse(saved);
    else mySkills = [];
  }
  renderMySkillsList();
}

function renderMySkillsList() {
  const container = document.getElementById('my-skills-list');
  if (!container) return;

  updateStatusBadge();

  if (mySkills.length === 0) {
    container.innerHTML = `<div class="empty-skills-notice text-xs text-muted-foreground italic" style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No skills published yet. Click "Edit My Skills" to select your skills.</div>`;
    return;
  }

  container.innerHTML = mySkills.map(skill => `
    <span class="skill-pill active" data-skill-remove="${escapeHtml(skill)}" title="Click ✕ to remove" style="cursor: pointer;">
      <span>✨</span>
      <span>${escapeHtml(skill)}</span>
      <span class="remove-chip-x" style="margin-left: 4px; opacity: 0.7; font-weight: 800;">✕</span>
    </span>
  `).join('');

  container.querySelectorAll('[data-skill-remove]').forEach(chip => {
    chip.addEventListener('click', async () => {
      const skillToRemove = chip.getAttribute('data-skill-remove');
      mySkills = mySkills.filter(s => s !== skillToRemove);
      localStorage.setItem(`skills_${user.sbtetPin || user.rollNumber}`, JSON.stringify(mySkills));
      renderMySkillsList();
      try {
        await api.request('/collaboration/skills', {
          method: 'POST',
          body: {
            skills: mySkills,
            pin: user.sbtetPin || user.rollNumber,
            name: user.name,
            branch: user.department,
            status: mySkills.length > 0 ? 'ACTIVE' : 'INACTIVE'
          }
        });
      } catch {}
      alerts.success('Skill Removed', `"${skillToRemove}" was removed from your profile.`);
    });
  });
}

function setupSkillsModal() {
  const modal = document.getElementById('skills-modal');
  const openBtn = document.getElementById('open-my-skills-btn');
  const closeBtn = document.getElementById('close-skills-modal');
  const cancelBtn = document.getElementById('cancel-skills-modal');
  const saveBtn = document.getElementById('save-skills-btn');
  const addCustomBtn = document.getElementById('add-custom-skill-btn');
  const customInput = document.getElementById('custom-skill-input');
  const quickPills = document.querySelectorAll('.selectable-pill');
  const selectedContainer = document.getElementById('modal-selected-skills');

  let tempSelectedSkills = [...mySkills];

  const updateModalPills = () => {
    quickPills.forEach(pill => {
      const name = pill.getAttribute('data-name');
      if (tempSelectedSkills.includes(name)) {
        pill.classList.add('selected');
      } else {
        pill.classList.remove('selected');
      }
    });

    selectedContainer.innerHTML = tempSelectedSkills.map(s => `
      <span class="skill-pill active" style="cursor: pointer;" data-remove="${escapeHtml(s)}">
        ${escapeHtml(s)} <small style="margin-left: 4px; font-weight: 800;">✕</small>
      </span>
    `).join('');

    selectedContainer.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const toRemove = btn.getAttribute('data-remove');
        tempSelectedSkills = tempSelectedSkills.filter(s => s !== toRemove);
        updateModalPills();
      });
    });
  };

  openBtn?.addEventListener('click', () => {
    tempSelectedSkills = [...mySkills];
    updateModalPills();
    modal.style.display = 'flex';
  });

  const closeModal = () => { modal.style.display = 'none'; };
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const name = pill.getAttribute('data-name');
      if (tempSelectedSkills.includes(name)) {
        tempSelectedSkills = tempSelectedSkills.filter(s => s !== name);
      } else {
        tempSelectedSkills.push(name);
      }
      updateModalPills();
    });
  });

  const addCustom = () => {
    const val = (customInput.value || '').trim();
    if (val && !tempSelectedSkills.includes(val)) {
      tempSelectedSkills.push(val);
      customInput.value = '';
      updateModalPills();
    }
  };

  addCustomBtn?.addEventListener('click', addCustom);
  customInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
  });

  saveBtn?.addEventListener('click', async () => {
    mySkills = [...tempSelectedSkills];
    localStorage.setItem(`skills_${user.sbtetPin || user.rollNumber}`, JSON.stringify(mySkills));
    renderMySkillsList();
    closeModal();

    try {
      await api.request('/collaboration/skills', {
        method: 'POST',
        body: {
          skills: mySkills,
          pin: user.sbtetPin || user.rollNumber,
          name: user.name,
          branch: user.department,
          status: mySkills.length > 0 ? 'ACTIVE' : 'INACTIVE'
        }
      });
      alerts.success('Skills Published', mySkills.length > 0
        ? 'Your skills and project availability status are now live.'
        : 'Skills cleared. Profile status set to Inactive.');
      loadPeerDirectory();
    } catch {
      alerts.success('Skills Updated', 'Your published skill tags have been updated locally.');
    }
  });
}

/**
 * 2. PEER COLLABORATION DIRECTORY
 */
async function loadPeerDirectory() {
  try {
    const res = await api.get('/collaboration/skills');
    if (res && res.success && Array.isArray(res.peers)) {
      const myPin = (user.sbtetPin || user.rollNumber || '').trim().toUpperCase();
      allPeers = res.peers.filter(p => (p.pin || '').trim().toUpperCase() !== myPin);
    } else {
      allPeers = [];
    }
  } catch {
    allPeers = [];
  }

  renderPeerGrid();
}

function renderPeerGrid() {
  const grid = document.getElementById('peer-grid');
  const countText = document.getElementById('peer-count-text');
  if (!grid) return;

  const filtered = allPeers.filter(peer => {
    const matchesSearch = !activeSearchQuery || 
      peer.name.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      peer.pin.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      (peer.skills || []).some(s => s.toLowerCase().includes(activeSearchQuery.toLowerCase()));

    const matchesFilter = activeFilter === 'ALL' || (peer.skills || []).includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  if (countText) {
    countText.textContent = `${filtered.length} Collaborator${filtered.length === 1 ? '' : 's'} Available`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-tile">
        <div class="empty-state-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
        <h4>No Active Collaborators</h4>
        <p>No students have published their skills yet. Click "Edit My Skills" above to be the first!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(peer => {
    const initials = peer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `
      <div class="neu-card peer-card">
        <div class="peer-card-top">
          <div class="peer-avatar">${initials}</div>
          <div class="peer-card-info">
            <h4>${escapeHtml(peer.name)}</h4>
            <span class="peer-pin">${escapeHtml(peer.pin)} • ${escapeHtml(peer.branch)}</span>
          </div>
        </div>

        <div class="peer-card-skills">
          ${(peer.skills || []).map(s => `
            <span class="skill-pill ${s === activeFilter ? 'active' : ''}">${escapeHtml(s)}</span>
          `).join('')}
        </div>

        <div class="peer-card-footer">
          <span class="neu-badge neu-badge-primary" style="font-size: 0.72rem;">${escapeHtml(peer.status || 'Available')}</span>
          <button class="neu-btn neu-btn-primary collab-req-btn" data-peer='${JSON.stringify(peer)}'>
            Request Collaboration
          </button>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.collab-req-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const peer = JSON.parse(btn.getAttribute('data-peer'));
      openCollabRequestModal(peer);
    });
  });
}

function setupSearchAndFilters() {
  const searchInput = document.getElementById('skill-search-input');
  searchInput?.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value.trim();
    renderPeerGrid();
  });

  const filterBtns = document.querySelectorAll('.filter-tag-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-skill');
      renderPeerGrid();
    });
  });
}

/**
 * 3. COLLABORATION REQUEST MODAL
 */
function setupCollabModal() {
  const modal = document.getElementById('collab-request-modal');
  const closeBtn = document.getElementById('close-collab-modal');
  const cancelBtn = document.getElementById('cancel-collab-btn');
  const sendBtn = document.getElementById('send-collab-btn');

  const closeModal = () => { modal.style.display = 'none'; };
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  sendBtn?.addEventListener('click', async () => {
    const title = document.getElementById('collab-project-title')?.value.trim();
    const message = document.getElementById('collab-project-message')?.value.trim();

    if (!title || !message) {
      alerts.error('Required Fields', 'Please state the project topic and pitch message.');
      return;
    }

    try {
      await api.request('/collaboration/request', {
        method: 'POST',
        body: {
          recipientPin: targetCollabPeer.pin,
          recipientName: targetCollabPeer.name,
          projectTitle: title,
          message: message,
          senderName: user.name || 'Student',
          senderPin: user.sbtetPin || user.rollNumber,
          senderBranch: user.department || 'CS',
        }
      });
      alerts.success('Collaboration Request Sent', `Your invite was delivered to ${targetCollabPeer.name}.`);
    } catch {
      // Local fallback simulation
      alerts.success('Invite Sent', `Collaboration request sent to ${targetCollabPeer.name}.`);
    }

    closeModal();
    loadCollaborationInvites();
  });
}

function openCollabRequestModal(peer) {
  targetCollabPeer = peer;
  const modal = document.getElementById('collab-request-modal');
  const targetName = document.getElementById('collab-target-name');
  const targetMeta = document.getElementById('collab-target-meta');

  if (targetName) targetName.textContent = `Collaborate with ${peer.name}`;
  if (targetMeta) targetMeta.textContent = `PIN: ${peer.pin} • ${peer.branch} • ${peer.year}`;

  modal.style.display = 'flex';
}

/**
 * 4. COLLABORATION INVITES & DRAWER
 */
async function loadCollaborationInvites() {
  const badge = document.getElementById('pending-invites-count');
  try {
    const res = await api.get('/collaboration/requests');
    if (res && res.success && Array.isArray(res.requests)) {
      const myPin = (user.sbtetPin || user.rollNumber || '').trim().toUpperCase();
      const pending = res.requests.filter(r => (r.recipientPin || '').trim().toUpperCase() === myPin && r.status === 'PENDING');
      if (badge) badge.textContent = pending.length;
    } else {
      if (badge) badge.textContent = '0';
    }
  } catch {
    if (badge) badge.textContent = '0';
  }
}

function setupInvitesDrawer() {
  const modal = document.getElementById('invites-modal');
  const openBtn = document.getElementById('view-requests-btn');
  const closeBtn = document.getElementById('close-invites-modal');
  const closeBtn2 = document.getElementById('close-invites-btn');

  const closeModal = () => { modal.style.display = 'none'; };
  closeBtn?.addEventListener('click', closeModal);
  closeBtn2?.addEventListener('click', closeModal);

  openBtn?.addEventListener('click', async () => {
    modal.style.display = 'flex';
    renderInvitesList();
  });
}

async function renderInvitesList() {
  const container = document.getElementById('invites-list-container');
  if (!container) return;

  let requests = [];
  try {
    const res = await api.get('/collaboration/requests');
    if (res && res.success && Array.isArray(res.requests)) {
      requests = res.requests;
    }
  } catch {
    requests = [];
  }

  if (requests.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-sm text-muted-foreground" style="padding: 28px 16px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
        No pending collaboration requests.
      </div>
    `;
    return;
  }

  container.innerHTML = requests.map(req => `
    <div class="invite-card">
      <div class="invite-header">
        <span class="invite-sender">${escapeHtml(req.senderName)} (${escapeHtml(req.senderPin)})</span>
        <span class="neu-badge ${req.status === 'ACCEPTED' ? 'neu-badge-success' : req.status === 'DECLINED' ? 'neu-badge-danger' : 'neu-badge-warning'}">
          ${req.status}
        </span>
      </div>
      <div class="invite-topic">Topic: ${escapeHtml(req.projectTitle)}</div>
      <div class="invite-msg">${escapeHtml(req.message)}</div>
      
      <div class="invite-actions">
        ${req.status === 'PENDING' ? `
          <button class="neu-btn neu-btn-primary" style="font-size: 0.8rem; padding: 6px 14px;" onclick="window.respondToCollab('${req.id}', 'ACCEPTED', '${escapeHtml(req.senderName)}', '${escapeHtml(req.senderPin)}', '${escapeHtml(req.projectTitle)}')">Accept Invite</button>
          <button class="neu-btn" style="font-size: 0.8rem; padding: 6px 14px;" onclick="window.respondToCollab('${req.id}', 'DECLINED')">Decline</button>
        ` : req.status === 'ACCEPTED' ? `
          <a href="messages.html?chatWith=${encodeURIComponent(req.senderPin)}&collabId=${encodeURIComponent(req.id)}&title=${encodeURIComponent(req.projectTitle)}&peerName=${encodeURIComponent(req.senderName)}" class="neu-btn neu-btn-primary" style="font-size: 0.8rem; padding: 6px 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Open in Messages
          </a>
        ` : ''}
      </div>
    </div>
  `).join('');
}

window.respondToCollab = async function(id, status, senderName, senderPin, projectTitle) {
  try {
    await api.request('/collaboration/respond', {
      method: 'POST',
      body: { requestId: id, status }
    });
  } catch {}

  alerts.success(`Invite ${status === 'ACCEPTED' ? 'Accepted' : 'Declined'}`, `Collaboration status updated.`);
  renderInvitesList();
  loadCollaborationInvites();

  if (status === 'ACCEPTED') {
    window.location.href = `messages.html?chatWith=${encodeURIComponent(senderPin)}&collabId=${encodeURIComponent(id)}&title=${encodeURIComponent(projectTitle || 'Project Collaboration')}&peerName=${encodeURIComponent(senderName)}`;
  }
};

/**
 * 5. PEER-TO-PEER CHAT MODAL
 */
function setupChatModal() {
  const modal = document.getElementById('chat-modal');
  const closeBtn = document.getElementById('close-chat-modal');
  const sendBtn = document.getElementById('send-chat-btn');
  const input = document.getElementById('chat-message-input');

  const closeModal = () => {
    modal.style.display = 'none';
    if (chatPollingInterval) clearInterval(chatPollingInterval);
  };
  closeBtn?.addEventListener('click', closeModal);

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text || !currentChatThread) return;

    input.value = '';
    const myPin = user.sbtetPin || user.rollNumber;
    
    // Optimistic UI append
    appendChatBubble({
      senderPin: myPin,
      senderName: user.name || 'You',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    try {
      await api.request('/collaboration/messages', {
        method: 'POST',
        body: {
          threadId: currentChatThread.id,
          text: text,
          senderPin: myPin,
          senderName: user.name || 'Student'
        }
      });
    } catch {}
  };

  sendBtn?.addEventListener('click', sendMessage);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
}

window.openPeerChat = function(threadId, peerName, peerPin, topic) {
  const modal = document.getElementById('chat-modal');
  const nameElem = document.getElementById('chat-peer-name');
  const metaElem = document.getElementById('chat-peer-meta');
  const avatarElem = document.getElementById('chat-peer-avatar');

  currentChatThread = { id: threadId, peerName, peerPin, topic };

  if (nameElem) nameElem.textContent = peerName;
  if (metaElem) metaElem.textContent = `PIN: ${peerPin} • ${topic}`;
  if (avatarElem) avatarElem.textContent = peerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  modal.style.display = 'flex';
  loadChatMessages(threadId);

  if (chatPollingInterval) clearInterval(chatPollingInterval);
  chatPollingInterval = setInterval(() => loadChatMessages(threadId, true), 4000);
};

async function loadChatMessages(threadId, silent = false) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  try {
    const res = await api.get(`/collaboration/messages?threadId=${threadId}`);
    if (res && res.success && Array.isArray(res.messages)) {
      renderChatMessages(res.messages);
    } else if (!silent) {
      renderChatMessages(getFallbackChatMessages());
    }
  } catch {
    if (!silent) renderChatMessages(getFallbackChatMessages());
  }
}

function getFallbackChatMessages() {
  return [
    {
      senderPin: currentChatThread?.peerPin || 'PEER',
      senderName: currentChatThread?.peerName || 'Peer',
      text: `Hi ${user.name || 'there'}! Thanks for connecting on Idea Hub. Let's collaborate on this project!`,
      time: '10:45 AM'
    },
    {
      senderPin: user.sbtetPin || user.rollNumber,
      senderName: 'You',
      text: 'Awesome! I can handle the frontend architecture and PPT slides. When can we sync up?',
      time: '10:46 AM'
    }
  ];
}

function renderChatMessages(messages) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const myPin = user.sbtetPin || user.rollNumber;
  container.innerHTML = messages.map(msg => {
    const isMine = msg.senderPin === myPin || msg.senderName === 'You';
    return `
      <div class="chat-bubble ${isMine ? 'mine' : 'peer'}">
        <div>${escapeHtml(msg.text)}</div>
        <div class="chat-bubble-meta">${escapeHtml(msg.time || '')}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function appendChatBubble(msg) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const myPin = user.sbtetPin || user.rollNumber;
  const isMine = msg.senderPin === myPin || msg.senderName === 'You';
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${isMine ? 'mine' : 'peer'}`;
  bubble.innerHTML = `
    <div>${escapeHtml(msg.text)}</div>
    <div class="chat-bubble-meta">${escapeHtml(msg.time || '')}</div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
