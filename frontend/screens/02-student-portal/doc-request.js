/**
 * Document Logistics & Pickup Controller
 * Real-time document request management connected to FastAPI and WebSockets.
 * Instant HOD approval/rejection updates with 6-digit OTP delivery.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';
import { wsClient } from '../../js/ws.js';

// Verify student authentication
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN']);

// Render Left Dock Navigation
if (user) {
  renderDock('document-logistics.html', user.role || 'STUDENT');
}

const myPin = (user.sbtetPin || user.rollNumber || user.pin || '24259-CS-025').trim().toUpperCase();
const myName = user.name || 'Student';

let allRequests = [];

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupDocTypeToggle();
  setupFormSubmission();
  setupRefreshButton();
  setupRealtimeWebSocket();
  loadActiveDocumentRequests();
});

function setupUserHeader() {
  const metaElem = document.getElementById('doc-student-meta');
  if (metaElem) {
    metaElem.textContent = `Samskruti College (259) • ${myName} (PIN: ${myPin}) • Direct HOD Queue & Instant OTP`;
  }
}

/**
 * 0. REAL-TIME WEBSOCKET SUBSCRIPTION
 */
function setupRealtimeWebSocket() {
  wsClient.connect(myPin, myName);

  wsClient.on('REQUEST_STATUS_UPDATED', (data) => {
    if (!data) return;

    if (data.student_pin === myPin) {
      // Find request in list and update
      const req = allRequests.find(r => r.id === data.request_id);
      if (req) {
        req.status = data.status;
        req.pickup_otp = data.pickup_otp;
        req.hod_notes = data.hod_notes;
        req.updated_at = data.updated_at;
      } else {
        allRequests.unshift({
          id: data.request_id,
          student_pin: data.student_pin,
          student_name: myName,
          request_type: 'Certificate Request',
          status: data.status,
          pickup_otp: data.pickup_otp,
          hod_notes: data.hod_notes,
          updated_at: data.updated_at
        });
      }

      renderRequestsQueue(allRequests);

      if (data.status === 'ACCEPTED') {
        alerts.success(
          'Document Approved! 🎉',
          `Your request was approved by the HOD. Counter Pickup OTP: ${data.pickup_otp}`
        );
      } else if (data.status === 'REJECTED') {
        alerts.error(
          'Request Rejected',
          `HOD note: ${data.hod_notes || 'Attendance or clearance condition not met.'}`
        );
      } else {
        alerts.info('Status Updated', `Your request status changed to ${data.status}.`);
      }
    }
  });
}

function setupDocTypeToggle() {
  const select = document.getElementById('doc-type');
  const customFields = document.getElementById('custom-doc-fields');
  const customTitle = document.getElementById('custom-doc-title');

  select?.addEventListener('change', () => {
    if (select.value === 'CUSTOM') {
      if (customFields) customFields.style.display = 'flex';
      customTitle?.setAttribute('required', 'true');
    } else {
      if (customFields) customFields.style.display = 'none';
      customTitle?.removeAttribute('required');
    }
  });
}

function setupRefreshButton() {
  const btn = document.getElementById('refresh-docs-btn');
  btn?.addEventListener('click', () => {
    loadActiveDocumentRequests(true);
  });
}

/**
 * 1. FETCH AND RENDER ACTIVE DOCUMENT REQUESTS
 */
async function loadActiveDocumentRequests(showFeedback = false) {
  try {
    const res = await api.get('/requests/my', { pin: myPin });
    if (res && res.success && Array.isArray(res.requests)) {
      allRequests = res.requests;
    } else {
      allRequests = [];
    }
    renderRequestsQueue(allRequests);
    if (showFeedback) alerts.success('Status Refreshed', 'Document approvals list is up to date.');
  } catch (e) {
    console.error('Failed to load requests:', e);
    renderRequestsQueue([]);
    if (showFeedback) alerts.error('Sync Error', 'Could not refresh requests.');
  }
}

/**
 * 2. RENDER REQUESTS QUEUE
 */
function renderRequestsQueue(requests) {
  const container = document.getElementById('active-doc-list');
  if (!container) return;

  if (!requests || requests.length === 0) {
    container.innerHTML = `
      <div class="empty-state-tile" style="text-align: center; padding: 36px 16px;">
        <div class="empty-state-icon" style="margin-bottom: 12px;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        </div>
        <h4 style="font-weight: 800; font-size: 1rem; margin-bottom: 4px;">No Active Requests</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted);">You have no pending or approved document requests. Submit a request using the form on the left.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = requests.map(req => {
    const title = req.request_type || 'Certificate Request';
    const reason = req.reason || 'Academic / Scholarship purpose';
    const status = (req.status || 'PENDING').toUpperCase();

    return `
      <div class="doc-status-card neu-card" style="margin-bottom: 14px; padding: 16px; border-left: 4px solid ${getStatusBorderColor(status)};">
        <div class="doc-status-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="doc-type-badge" style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">${escapeHtml(title)}</span>
          ${renderStatusBadge(status)}
        </div>

        <p class="doc-purpose-text" style="font-size: 0.85rem; color: var(--text-muted); margin: 6px 0;"><strong>Purpose:</strong> ${escapeHtml(reason)}</p>
        
        ${req.attendance_snapshot ? `
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
            <span>Verified Attendance at Submission: <strong>${escapeHtml(req.attendance_snapshot)}</strong></span>
          </div>
        ` : ''}

        ${renderStatusDetails(req, status)}
      </div>
    `;
  }).join('');
}

function getStatusBorderColor(status) {
  if (status === 'ACCEPTED' || status === 'APPROVED') return '#10b981';
  if (status === 'REJECTED') return '#ef4444';
  if (status === 'HOLD') return '#f59e0b';
  return '#6366f1';
}

function renderStatusBadge(status) {
  if (status === 'ACCEPTED' || status === 'APPROVED') {
    return `<span class="neu-badge neu-badge-success" style="background: #10b981; color: #fff; font-weight: 800; font-size: 0.72rem;">ACCEPTED</span>`;
  }
  if (status === 'REJECTED') {
    return `<span class="neu-badge neu-badge-danger" style="background: #ef4444; color: #fff; font-weight: 800; font-size: 0.72rem;">REJECTED</span>`;
  }
  if (status === 'HOLD') {
    return `<span class="neu-badge neu-badge-warning" style="background: #f59e0b; color: #fff; font-weight: 800; font-size: 0.72rem;">ON HOLD</span>`;
  }
  return `<span class="neu-badge neu-badge-warning" style="background: #6366f1; color: #fff; font-weight: 800; font-size: 0.72rem;">PENDING HOD REVIEW</span>`;
}

function renderStatusDetails(req, status) {
  if (status === 'ACCEPTED' || status === 'APPROVED') {
    return `
      <div class="otp-box" style="background: rgba(16, 185, 129, 0.1); border: 1px dashed #10b981; border-radius: 8px; padding: 12px; margin-top: 10px; text-align: center;">
        <span class="otp-label" style="display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 800; color: #059669;">Counter Collection OTP</span>
        <span class="otp-code" style="display: block; font-size: 1.5rem; font-weight: 900; letter-spacing: 0.2em; color: #047857; margin: 4px 0;">${escapeHtml(req.pickup_otp || '394821')}</span>
        <div style="font-size: 0.75rem; color: #065f46;">📍 Samskruti Examination Section (Counter 2) • Present OTP & Student ID</div>
      </div>
    `;
  }

  if (status === 'REJECTED') {
    return `
      <div class="rejection-box" style="background: rgba(239, 68, 68, 0.08); border-radius: 8px; padding: 10px 14px; margin-top: 8px; font-size: 0.8rem; color: #b91c1c;">
        <strong>HOD Review Notice:</strong>
        <p style="margin: 2px 0 0 0;">${escapeHtml(req.hod_notes || 'Attendance below mandatory threshold or pending departmental clearance.')}</p>
      </div>
    `;
  }

  if (status === 'HOLD') {
    return `
      <div style="background: rgba(245, 158, 11, 0.08); border-radius: 8px; padding: 10px 14px; margin-top: 8px; font-size: 0.8rem; color: #b45309;">
        <strong>On Hold:</strong> ${escapeHtml(req.hod_notes || 'Please meet Prof. Vamshi Krishna in the HOD chamber with fee receipt.')}
      </div>
    `;
  }

  return `
    <div class="pending-box" style="background: rgba(99, 102, 241, 0.08); border-radius: 8px; padding: 10px 14px; margin-top: 8px; font-size: 0.8rem; color: #4338ca;">
      ⏳ <strong>Awaiting HOD Sign-off:</strong> Queued for Computer Science Department HOD review.
    </div>
  `;
}

/**
 * 3. SUBMIT NEW DIGITAL REQUEST
 */
function setupFormSubmission() {
  const form = document.getElementById('doc-request-form');
  const submitBtn = document.getElementById('doc-submit-btn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const docType = document.getElementById('doc-type').value;
    const customTitle = document.getElementById('custom-doc-title')?.value.trim();
    const purpose = document.getElementById('doc-purpose').value.trim();
    const copies = document.getElementById('doc-copies')?.value || 1;

    let finalTitle = docType;
    if (docType === 'BONAFIDE') finalTitle = 'Bonafide Certificate';
    else if (docType === 'CUSTODIAN') finalTitle = 'Custodian Certificate';
    else if (docType === 'NO_OBJECTION') finalTitle = 'No Objection Certificate (NOC)';
    else if (docType === 'TRANSCRIPT') finalTitle = 'Official Academic Transcript';
    else if (docType === 'CUSTOM') finalTitle = customTitle || 'Custom Certificate';

    if (!purpose) {
      alerts.error('Missing Purpose', 'Please state the reason for the certificate request.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting to HOD...';
    }

    try {
      const res = await api.post('/requests', {
        student_pin: myPin,
        student_name: myName,
        request_type: `${finalTitle} (${copies} Cop${copies > 1 ? 'ies' : 'y'})`,
        reason: purpose,
        urgency: 'NORMAL'
      });

      alerts.success('Request Submitted', 'Your certificate application has been forwarded to the HOD approval queue.');
      form.reset();
      const customFields = document.getElementById('custom-doc-fields');
      if (customFields) customFields.style.display = 'none';
      await loadActiveDocumentRequests();
    } catch (err) {
      alerts.error('Submission Failed', err.message || 'Could not submit request.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit to Department HOD for Approval';
      }
    }
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
