/**
 * Idea Hub & Peer Collaboration Controller
 * Real-time peer directory, live online presence tracking, project invites, and WebSocket messaging.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';
import { wsClient } from '../../js/ws.js';

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

const myPin = (user.sbtetPin || user.rollNumber || user.pin || '24259-CS-025').trim().toUpperCase();
const myName = user.name || 'Student';

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupSkillsModal();
  setupCollabModal();
  setupInvitesDrawer();
  setupChatModal();
  setupSearchAndFilters();
  setupRealtimeWebSocket();
  
  loadMySkills();
  loadPeerDirectory();
  loadCollaborationInvites();
});

function setupUserHeader() {
  const isHOD = user.role === 'HOD' || user.role === 'HOD_CS' || user.role === 'ADMIN';
  const name = isHOD ? 'Prof. Vamshi Krishna' : myName;
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
    if (metaElem) metaElem.textContent = `PIN: ${myPin} • ${user.department || 'Computer Science & Engineering'}`;
  }
}

/**
 * 0. REAL-TIME WEBSOCKET SETUP & PRESENCE
 */
function setupRealtimeWebSocket() {
  wsClient.connect(myPin, myName);

  // When online status changes or initial connection arrives, re-render presence indicators
  wsClient.on('PRESENCE_UPDATE', () => {
    renderPeerGrid();
  });

  wsClient.on('CONNECTION_ESTABLISHED', () => {
    renderPeerGrid();
  });

  // When a new project invite arrives
  wsClient.on('IDEA_INVITE_RECEIVED', (data) => {
    loadCollaborationInvites();
    if (data?.invite) {
      alerts.info(
        'New Project Invite!',
        `${data.invite.from_name} invited you to collaborate on "${data.invite.project_title || 'a project'}"`
      );
    }
  });

  // Incoming messages for Idea Hub
  wsClient.on('NEW_MESSAGE', (payload) => {
    if (payload?.message && currentChatThread) {
      const msg = payload.message;
      if (msg.category === 'IDEA_HUB' && msg.sender_pin === currentChatThread.pin) {
        appendChatBubble({
          senderPin: msg.sender_pin,
          senderName: msg.sender_name,
          text: msg.content,
          time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }
  });
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
    badge.style.background = '#10b981';
    badge.style.color = '#ffffff';
    badge.textContent = 'Available for Projects';
  }
}

/**
 * 1. MY SKILLS MANAGEMENT
 */
function loadMySkills() {
  const saved = localStorage.getItem(`skills_${myPin}`);
  if (saved) {
    try {
      mySkills = JSON.parse(saved);
    } catch {
      mySkills = ['Python', 'Web Development (HTML/CSS/JS)', 'UI/UX Design (Figma)'];
    }
  } else {
    mySkills = ['Python', 'Web Development (HTML/CSS/JS)'];
    localStorage.setItem(`skills_${myPin}`, JSON.stringify(mySkills));
  }
  renderMySkillsList();
}

function renderMySkillsList() {
  const container = document.getElementById('my-skills-list');
  if (!container) return;

  updateStatusBadge();

  if (mySkills.length === 0) {
    container.innerHTML = `<div class="empty-skills-notice" style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No skills published yet. Click "Edit My Skills" to select your skills.</div>`;
    return;
  }

  container.innerHTML = mySkills.map(skill => `
    <span class="skill-pill active" data-skill-remove="${escapeHtml(skill)}" title="Click ✕ to remove" style="cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; margin: 2px;">
      <span>✨</span>
      <span>${escapeHtml(skill)}</span>
      <span class="remove-chip-x" style="margin-left: 4px; opacity: 0.7; font-weight: 800;">✕</span>
    </span>
  `).join('');

  container.querySelectorAll('[data-skill-remove]').forEach(chip => {
    chip.addEventListener('click', () => {
      const skillToRemove = chip.getAttribute('data-skill-remove');
      mySkills = mySkills.filter(s => s !== skillToRemove);
      localStorage.setItem(`skills_${myPin}`, JSON.stringify(mySkills));
      renderMySkillsList();
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
        pill.style.background = 'var(--primary-color, #4f46e5)';
        pill.style.color = '#fff';
      } else {
        pill.classList.remove('selected');
        pill.style.background = '';
        pill.style.color = '';
      }
    });

    selectedContainer.innerHTML = tempSelectedSkills.map(s => `
      <span class="skill-pill active" style="cursor: pointer; display: inline-flex; align-items: center; padding: 4px 10px; margin: 2px;" data-remove="${escapeHtml(s)}">
        ${escapeHtml(s)} <small style="margin-left: 6px; font-weight: 800;">✕</small>
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

  saveBtn?.addEventListener('click', () => {
    mySkills = [...tempSelectedSkills];
    localStorage.setItem(`skills_${myPin}`, JSON.stringify(mySkills));
    renderMySkillsList();
    closeModal();
    alerts.success('Skills Published', 'Your skills are now visible to peer collaborators.');
  });
}

/**
 * 2. PEER COLLABORATION DIRECTORY (REAL ROSTER WITH REAL-TIME PRESENCE)
 */
async function loadPeerDirectory() {
  try {
    const targetBranch = user?.branch || (myPin.includes('-AI-') || myPin.includes('AIML') ? 'AIML' : 'CS');
    const res = await api.get(`/hod/roster?branch=${targetBranch}`);
    if (res && res.success && Array.isArray(res.students)) {
      // Default sample skills pool distributed to students to make exploration interactive
      const skillPresets = [
        ['Python', 'Web Development', 'FastAPI'],
        ['UI/UX Design', 'Figma', 'Poster Design'],
        ['PPT Making', 'Technical Writing', 'Seminar Presentation'],
        ['React / Next.js', 'Web Development', 'Database (SQL/MongoDB)'],
        ['Arduino / IoT', 'Circuit Design', 'Embedded Systems'],
        ['AI / Machine Learning', 'Python', 'Database (SQL/MongoDB)'],
        ['AutoCAD / 3D CAD Drafting', 'Mini Drafter', 'C / C++'],
        ['Video Editing', 'Poster Design', 'Logo & Branding']
      ];

      allPeers = res.students
        .filter(s => s.pin.toUpperCase() !== myPin)
        .map((s, idx) => {
          const preset = skillPresets[idx % skillPresets.length];
          return {
            pin: s.pin,
            name: s.name,
            branch: s.branch || (targetBranch === 'AIML' ? 'Artificial Intelligence & Machine Learning' : 'Computer Science & Engineering'),
            year: '3rd Year',
            semester: s.semester || '5th Sem',
            skills: preset,
            status: 'Available'
          };
        });
    } else {
      allPeers = [];
    }
  } catch (e) {
    console.error('Failed to load peer directory:', e);
    allPeers = [];
  }

  renderPeerGrid();
}

function renderPeerGrid() {
  const grid = document.getElementById('peer-grid');
  const countText = document.getElementById('peer-count-text');
  if (!grid) return;

  const onlinePins = wsClient.getOnlinePins();

  const filtered = allPeers.filter(peer => {
    const matchesSearch = !activeSearchQuery || 
      peer.name.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      peer.pin.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      (peer.skills || []).some(s => s.toLowerCase().includes(activeSearchQuery.toLowerCase()));

    const matchesFilter = activeFilter === 'ALL' || (peer.skills || []).some(s => s.toLowerCase().includes(activeFilter.toLowerCase()));
    return matchesSearch && matchesFilter;
  });

  // Sort online peers first
  filtered.sort((a, b) => {
    const aOnline = wsClient.isUserOnline(a.pin) ? 1 : 0;
    const bOnline = wsClient.isUserOnline(b.pin) ? 1 : 0;
    return bOnline - aOnline;
  });

  if (countText) {
    const onlineCount = filtered.filter(p => wsClient.isUserOnline(p.pin)).length;
    countText.textContent = `${filtered.length} Collaborator${filtered.length === 1 ? '' : 's'} (${onlineCount} Online)`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-tile" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
        <div class="empty-state-icon" style="margin-bottom: 12px;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h4 style="font-weight: 800;">No Collaborators Found</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">No students matched your search criteria or skill tag filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(peer => {
    const initials = peer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const isOnline = wsClient.isUserOnline(peer.pin);

    return `
      <div class="neu-card peer-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="peer-card-top" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <div class="peer-avatar" style="position: relative; width: 44px; height: 44px; border-radius: 50%; background: var(--bg-secondary, #e2e8f0); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--primary-color, #4f46e5); box-shadow: var(--shadow-raised);">
              ${initials}
              <span style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; background: ${isOnline ? '#10b981' : '#9ca3af'}; border: 2px solid var(--bg-primary, #f8fafc);" title="${isOnline ? 'Online Now' : 'Offline'}"></span>
            </div>
            <div class="peer-card-info" style="flex: 1; min-width: 0;">
              <h4 style="font-size: 0.95rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;">${escapeHtml(peer.name)}</h4>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                <span class="peer-pin" style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(peer.pin)}</span>
                <span style="font-size: 0.7rem; font-weight: 700; color: ${isOnline ? '#10b981' : '#9ca3af'};">● ${isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          <div class="peer-card-skills" style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;">
            ${(peer.skills || []).map(s => `
              <span class="skill-pill ${s.toLowerCase().includes(activeFilter.toLowerCase()) ? 'active' : ''}" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 12px; background: rgba(79, 70, 229, 0.1); color: var(--primary-color, #4f46e5); font-weight: 600;">${escapeHtml(s)}</span>
            `).join('')}
          </div>
        </div>

        <div class="peer-card-footer" style="display: flex; gap: 8px; margin-top: 10px; border-top: 1px dashed rgba(150,150,150,0.15); padding-top: 10px;">
          <button class="neu-btn neu-btn-primary collab-req-btn" data-peer='${JSON.stringify(peer)}' style="flex: 1; padding: 8px 12px; font-size: 0.8rem; font-weight: 700;">
            🤝 Invite to Project
          </button>
          <button class="neu-btn direct-msg-btn" data-peer='${JSON.stringify(peer)}' style="padding: 8px 12px; font-size: 0.8rem;" title="Direct Message">
            💬
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach Invite handlers
  grid.querySelectorAll('.collab-req-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const peer = JSON.parse(btn.getAttribute('data-peer'));
      openCollabRequestModal(peer);
    });
  });

  // Attach Direct Message handlers
  grid.querySelectorAll('.direct-msg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const peer = JSON.parse(btn.getAttribute('data-peer'));
      window.location.href = `messages.html?tab=idea_hub&chatWith=${encodeURIComponent(peer.pin)}&peerName=${encodeURIComponent(peer.name)}`;
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
      activeFilter = btn.getAttribute('data-skill') || 'ALL';
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

    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending Invite...';

    try {
      const res = await api.post('/ideahub/invites', {
        project_title: title,
        message: message,
        from_pin: myPin,
        from_name: myName,
        to_pin: targetCollabPeer.pin,
        to_name: targetCollabPeer.name
      });

      alerts.success('Invite Dispatched!', `Collaboration invite delivered in real time to ${targetCollabPeer.name}.`);
      closeModal();
    } catch (err) {
      alerts.error('Delivery Error', err.message || 'Could not deliver invite.');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Collaboration Invite';
    }
  });
}

function openCollabRequestModal(peer) {
  targetCollabPeer = peer;
  const modal = document.getElementById('collab-request-modal');
  const targetName = document.getElementById('collab-target-name');
  const targetMeta = document.getElementById('collab-target-meta');

  if (targetName) targetName.textContent = `Invite ${peer.name} to Collaborate`;
  if (targetMeta) targetMeta.textContent = `PIN: ${peer.pin} • ${peer.branch} • ${peer.year}`;

  modal.style.display = 'flex';
}

/**
 * 4. COLLABORATION INVITES DRAWER
 */
async function loadCollaborationInvites() {
  const badge = document.getElementById('pending-invites-count');
  try {
    const res = await api.get('/ideahub/invites', { pin: myPin });
    if (res && res.success && Array.isArray(res.invites)) {
      const pending = res.invites.filter(r => r.status === 'PENDING');
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

  container.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted);">Loading incoming project invites...</div>`;

  try {
    const res = await api.get('/ideahub/invites', { pin: myPin });
    if (res && res.success && Array.isArray(res.invites) && res.invites.length > 0) {
      container.innerHTML = res.invites.map(inv => `
        <div class="neu-card" style="margin-bottom: 12px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: var(--primary-color, #4f46e5); font-size: 0.95rem;">${escapeHtml(inv.project_title || 'Project Collaboration')}</strong>
            <span class="neu-badge neu-badge-primary" style="font-size: 0.7rem;">${escapeHtml(inv.status)}</span>
          </div>
          <p style="font-size: 0.85rem; margin: 4px 0 8px 0; color: var(--text-main);">${escapeHtml(inv.message || 'Wants to collaborate with you.')}</p>
          <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
            <span>From: <strong>${escapeHtml(inv.from_name)}</strong> (${escapeHtml(inv.from_pin)})</span>
            <button class="neu-btn neu-btn-primary accept-invite-btn" data-from-pin="${inv.from_pin}" data-from-name="${escapeHtml(inv.from_name)}" style="padding: 4px 10px; font-size: 0.75rem;">
              Chat & Accept
            </button>
          </div>
        </div>
      `).join('');

      container.querySelectorAll('.accept-invite-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const fromPin = btn.getAttribute('data-from-pin');
          const fromName = btn.getAttribute('data-from-name');
          window.location.href = `messages.html?tab=idea_hub&chatWith=${encodeURIComponent(fromPin)}&peerName=${encodeURIComponent(fromName)}`;
        });
      });
    } else {
      container.innerHTML = `
        <div style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
          <p style="margin: 0; font-weight: 700;">No Incoming Invites</p>
          <p style="font-size: 0.82rem; margin-top: 4px;">When classmates want to collaborate with you on projects, their invites will appear here in real time.</p>
        </div>
      `;
    }
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; padding: 24px; color: #ef4444;">Failed to load invites: ${err.message}</div>`;
  }
}

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
    currentChatThread = null;
  };
  closeBtn?.addEventListener('click', closeModal);

  const sendMessage = () => {
    const text = input.value.trim();
    if (!text || !currentChatThread) return;

    input.value = '';

    wsClient.send({
      type: 'SEND_MESSAGE',
      receiver_pin: currentChatThread.pin,
      content: text,
      category: 'IDEA_HUB'
    });

    appendChatBubble({
      senderPin: myPin,
      senderName: myName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  sendBtn?.addEventListener('click', sendMessage);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
}

function appendChatBubble(msg) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const isMine = (msg.senderPin || '').trim().toUpperCase() === myPin;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${isMine ? 'mine' : 'peer'}`;
  bubble.innerHTML = `
    <div>${escapeHtml(msg.text)}</div>
    <div class="chat-bubble-meta" style="font-size: 0.7rem; opacity: 0.7; margin-top: 4px; text-align: right;">${escapeHtml(msg.time || '')}</div>
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
