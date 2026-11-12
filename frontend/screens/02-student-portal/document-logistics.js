/**
 * Samskruti Digital Campus — Student Certificate Logistics Controller (v4.0)
 * 3 Simplified Form Fields (No OTP, No Address, No Copies).
 * Real-Time Bidirectional HOD Updates via WebSockets.
 */

(function () {
  'use strict';

  let myPin = '';
  let myName = 'Student';
  let myDept = 'CS';
  let ws = null;
  let requestsList = [];

  document.addEventListener('DOMContentLoaded', init);

  function getUser() {
    try {
      const stored = localStorage.getItem('dc_user') || localStorage.getItem('smsk_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.pin || u.name)) return u;
      }
    } catch (e) {}

    const pin = localStorage.getItem('student_pin') || localStorage.getItem('user_pin');
    const name = localStorage.getItem('user_name');
    if (pin) {
      return { pin, name: name || 'Student', role: 'STUDENT' };
    }
    return null;
  }

  function init() {
    const user = getUser();
    if (!user || !user.pin) {
      window.location.replace('/screens/01-auth/login.html');
      return;
    }

    myPin = user.pin.trim().toUpperCase();
    myName = user.name || 'Student';
    myDept = myPin.includes('-AI') ? 'AIML' : 'CS';

    bindFormEvents();
    bindRefreshButton();
    loadRequests();
    initWebSocket();
  }

  function bindFormEvents() {
    const reasonEl = document.getElementById('reqReason');
    const charCountEl = document.getElementById('charCount');
    if (reasonEl && charCountEl) {
      reasonEl.addEventListener('input', () => {
        charCountEl.textContent = `${reasonEl.value.length}/200`;
      });
    }

    const form = document.getElementById('docRequestForm');
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }
  }

  function bindRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        loadRequests();
      });
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    const docType = document.getElementById('reqDocType').value;
    const phoneInput = document.getElementById('reqGuardianPhone');
    const phone = phoneInput.value.trim();
    const reason = document.getElementById('reqReason').value.trim();

    // 10-digit phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      phoneInput.focus();
      return;
    }

    if (!reason || reason.length < 5) {
      alert('Please provide a brief justification of at least 5 characters.');
      document.getElementById('reqReason').focus();
      return;
    }

    const submitBtn = document.getElementById('btnSubmitDoc');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">refresh</span><span>Submitting...</span>';

    try {
      const payload = {
        student_pin: myPin,
        student_name: myName,
        request_type: docType,
        guardian_phone: phone,
        reason: reason,
        department: myDept,
        urgency: 'NORMAL'
      };

      const res = await fetch('/api/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok && json.success) {
        document.getElementById('docRequestForm').reset();
        document.getElementById('charCount').textContent = '0/200';
        await loadRequests();
      } else {
        alert(json.detail || json.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('Network error submitting request. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">send</span><span>Submit to HOD</span>';
    }
  }

  async function loadRequests() {
    const container = document.getElementById('requestsContainer');
    const countEl = document.getElementById('historyCount');

    try {
      const res = await fetch(`/api/v1/requests/my?pin=${encodeURIComponent(myPin)}`);
      const json = await res.json();

      if (res.ok && json.requests) {
        requestsList = json.requests;
        renderRequests(requestsList);
      } else {
        container.innerHTML = '<div class="p-8 text-center text-xs text-[var(--color-muted)]">No active requests found.</div>';
        if (countEl) countEl.textContent = '0 requests';
      }
    } catch (err) {
      console.error('Error loading requests:', err);
      container.innerHTML = '<div class="p-8 text-center text-xs text-rose-500">Failed to load request records.</div>';
    }
  }

  function renderRequests(list) {
    const container = document.getElementById('requestsContainer');
    const countEl = document.getElementById('historyCount');

    if (countEl) {
      countEl.textContent = `${list.length} request${list.length === 1 ? '' : 's'}`;
    }

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="p-10 text-center flex flex-col items-center justify-center gap-2 text-[var(--color-muted)]">
          <span class="material-symbols-outlined text-3xl">inbox</span>
          <span class="text-xs">No certificate requests submitted yet.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(req => {
      const status = (req.status || 'PENDING').toUpperCase();
      let statusBadge = '';

      if (status === 'ACCEPTED' || status === 'APPROVED') {
        statusBadge = `
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-lime)] text-[var(--color-lime-ink)] text-xs font-bold">
            <span class="material-symbols-outlined text-[14px]">check_circle</span>
            <span>Approved</span>
          </span>
        `;
      } else if (status === 'REJECTED' || status === 'DENIED') {
        statusBadge = `
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/15 text-rose-500 text-xs font-bold border border-rose-500/20">
            <span class="material-symbols-outlined text-[14px]">cancel</span>
            <span>Denied</span>
          </span>
        `;
      } else if (status === 'HOLD') {
        statusBadge = `
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 text-xs font-bold border border-amber-500/20">
            <span class="material-symbols-outlined text-[14px]">pause_circle</span>
            <span>On Hold</span>
          </span>
        `;
      } else {
        statusBadge = `
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-card-subtle)] text-[var(--color-muted)] text-xs font-medium border border-[var(--color-hairline)]">
            <span class="material-symbols-outlined text-[14px]">schedule</span>
            <span>Pending HOD</span>
          </span>
        `;
      }

      const formattedTime = (window.DateUtils && window.DateUtils.formatTimestamp)
        ? window.DateUtils.formatTimestamp(req.submitted_at)
        : req.submitted_at || 'Recently';

      return `
        <div class="p-4 rounded-2xl bg-[var(--color-card-subtle)] border border-[var(--color-hairline)] flex flex-col gap-3 transition-all" id="reqCard-${req.id}">
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-col">
              <span class="text-sm font-bold text-[var(--color-ink)]">${escapeHtml(req.request_type)}</span>
              <span class="text-[11px] text-[var(--color-muted)] tabular">${formattedTime}</span>
            </div>
            ${statusBadge}
          </div>

          <div class="text-xs text-[var(--color-ink)] bg-[var(--color-card)] p-3 rounded-xl border border-[var(--color-hairline)]">
            <div class="text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-semibold mb-1">Purpose</div>
            <p class="leading-relaxed">${escapeHtml(req.reason)}</p>
          </div>

          ${req.guardian_phone ? `
            <div class="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <span class="material-symbols-outlined text-[15px]">call</span>
              <span class="tabular">Guardian Contact: ${escapeHtml(req.guardian_phone)}</span>
            </div>
          ` : ''}

          ${req.hod_notes ? `
            <div class="text-xs bg-[var(--color-lime)]/10 text-[var(--color-ink)] p-3 rounded-xl border border-[var(--color-lime)]/30 flex items-start gap-2">
              <span class="material-symbols-outlined text-[16px] text-[var(--color-lime-ink)] shrink-0 mt-0.5">info</span>
              <div>
                <span class="font-bold">HOD Remarks:</span>
                <p class="mt-0.5">${escapeHtml(req.hod_notes)}</p>
              </div>
            </div>
          ` : ''}

          ${status === 'PENDING' ? `
            <div class="flex justify-end pt-1">
              <button class="px-3 py-1.5 rounded-full text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors border border-rose-500/20 cursor-pointer" onclick="window.withdrawRequest(${req.id})">
                Withdraw Request
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  window.withdrawRequest = async function (id) {
    if (!confirm('Are you sure you want to withdraw this certificate request?')) return;

    try {
      const res = await fetch(`/api/v1/requests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        requestsList = requestsList.filter(r => r.id !== id);
        renderRequests(requestsList);
      } else {
        alert('Failed to withdraw request');
      }
    } catch (err) {
      console.error('Error withdrawing request:', err);
      alert('Network error while withdrawing request.');
    }
  };

  function initWebSocket() {
    const loc = window.location;
    const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${proto}//${loc.host}/ws/${myPin}`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = function (event) {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'REQUEST_UPDATED' || data.type === 'REQUEST_STATUS_UPDATED') {
            if (data.student_pin === myPin || String(data.request_id) in requestsList.map(r => String(r.id))) {
              loadRequests();
              const card = document.getElementById(`reqCard-${data.request_id}`);
              if (card) {
                card.classList.add('highlight-pulse');
                setTimeout(() => card.classList.remove('highlight-pulse'), 2400);
              }
            }
          }
        } catch (e) {}
      };

      ws.onclose = function () {
        setTimeout(initWebSocket, 6000);
      };
    } catch (err) {
      console.warn('WebSocket connection not established:', err);
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
