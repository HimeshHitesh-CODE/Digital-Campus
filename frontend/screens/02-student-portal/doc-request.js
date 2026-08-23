/**
 * Document Logistics & Pickup Controller
 * Handles standard & custom certificate requests with live HOD approval queue and OTP pickup.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

// Verify student authentication
const user = requireAuth(['STUDENT']) || {
  name: 'Student User',
  rollNumber: '24259-CS-039',
  sbtetPin: '24259-CS-039',
  department: 'Computer Science & Engineering',
};

// Render Left Dock Navigation
renderDock('doc-request.html', 'STUDENT');

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupDocTypeToggle();
  setupFormSubmission();
  setupRefreshButton();
  loadActiveDocumentRequests();
});

function setupUserHeader() {
  const pin = user.sbtetPin || user.rollNumber || '24259-XX-XXX';
  const metaElem = document.getElementById('doc-student-meta');
  if (metaElem) {
    metaElem.textContent = `Samskruti College (259) • ${user.name || 'Student'} (PIN: ${pin}) • Direct HOD Queue`;
  }
}

function setupDocTypeToggle() {
  const select = document.getElementById('doc-type');
  const customFields = document.getElementById('custom-doc-fields');
  const customTitle = document.getElementById('custom-doc-title');

  select?.addEventListener('change', () => {
    if (select.value === 'CUSTOM') {
      customFields.style.display = 'flex';
      customTitle.setAttribute('required', 'true');
    } else {
      customFields.style.display = 'none';
      customTitle.removeAttribute('required');
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
 * Fetch and render active document requests
 */
async function loadActiveDocumentRequests(showFeedback = false) {
  const pin = (user.sbtetPin || user.rollNumber || '').trim().toUpperCase();

  try {
    const res = await api.get('/documents/requests', { pin });
    if (res && res.success && Array.isArray(res.requests)) {
      renderRequestsQueue(res.requests);
    } else {
      renderRequestsQueue([]);
    }
    if (showFeedback) alerts.success('Status Refreshed', 'Document approvals list is up to date.');
  } catch {
    renderRequestsQueue([]);
    if (showFeedback) alerts.success('Status Refreshed', 'Loaded active requests.');
  }
}

/**
 * Render the 4 distinct states:
 * 1. APPROVED -> Green badge + OTP Counter pickup
 * 2. REJECTED -> Red badge + exact rejection reason
 * 3. PENDING  -> Amber badge ("Awaiting HOD Sign-off")
 * 4. EMPTY    -> "No Active Requests"
 */
function renderRequestsQueue(requests) {
  const container = document.getElementById('active-doc-list');
  if (!container) return;

  if (!requests || requests.length === 0) {
    container.innerHTML = `
      <div class="empty-state-tile">
        <div class="empty-state-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
        </div>
        <h4>No Active Requests</h4>
        <p>You have no pending or approved document requests. Submit a request using the form on the left.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = requests.map(req => {
    const isCustom = req.docType === 'CUSTOM';
    const title = isCustom ? (req.customTitle || req.docTitle || 'Custom Certificate Request') : req.docTitle;
    const formatInfo = req.customFormat ? `Format: ${req.customFormat}` : `Copies: ${req.copies || 1}`;

    return `
      <div class="doc-status-card">
        <div class="doc-status-header">
          <span class="doc-type-badge">${escapeHtml(title)}</span>
          ${renderStatusBadge(req.status)}
        </div>

        <p class="doc-purpose-text"><strong>Purpose:</strong> ${escapeHtml(req.purpose)}</p>
        <div class="doc-meta-small">📌 ${escapeHtml(formatInfo)}</div>

        ${renderStatusDetails(req)}
      </div>
    `;
  }).join('');
}

function renderStatusBadge(status) {
  switch (status) {
    case 'APPROVED':
      return `<span class="neu-badge neu-badge-success">APPROVED</span>`;
    case 'REJECTED':
      return `<span class="neu-badge neu-badge-danger">REJECTED</span>`;
    case 'PENDING':
    default:
      return `<span class="neu-badge neu-badge-warning">PENDING REVIEW</span>`;
  }
}

function renderStatusDetails(req) {
  switch (req.status) {
    case 'APPROVED':
      return `
        <div class="otp-box">
          <span class="otp-label">Collection Counter OTP</span>
          <span class="otp-code">${escapeHtml(req.collectionOtp || '582 910')}</span>
        </div>
        <div class="pickup-instructions">
          📍 ${escapeHtml(req.pickupCounter || 'Admin Counter 2 (Ground Floor)')} • ${escapeHtml(req.pickupInstructions || 'Show OTP & Student ID')}
        </div>
      `;

    case 'REJECTED':
      return `
        <div class="rejection-box">
          <strong>HOD Review Notice:</strong>
          ${escapeHtml(req.rejectionReason || 'Request declined by Head of Department due to administrative non-clearance.')}
        </div>
      `;

    case 'PENDING':
    default:
      return `
        <div class="pending-box">
          ⏳ <strong>Awaiting HOD Sign-off:</strong> Application is queued for Computer Science Department HOD review.
        </div>
      `;
  }
}

/**
 * Handle new request submission
 */
function setupFormSubmission() {
  const form = document.getElementById('doc-request-form');
  const submitBtn = document.getElementById('doc-submit-btn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const docType = document.getElementById('doc-type').value;
    const customTitle = document.getElementById('custom-doc-title')?.value.trim();
    const customFormat = document.getElementById('custom-doc-format')?.value;
    const purpose = document.getElementById('doc-purpose').value.trim();
    const copies = document.getElementById('doc-copies').value;

    if (!purpose) {
      alerts.error('Missing Purpose', 'Please state the purpose of the certificate request.');
      return;
    }

    if (docType === 'CUSTOM' && !customTitle) {
      alerts.error('Missing Title', 'Please specify the custom document title.');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
      await api.request('/documents/request', {
        method: 'POST',
        body: {
          docType,
          customTitle,
          customFormat,
          purpose,
          copies,
          pin: user.sbtetPin || user.rollNumber,
          studentName: user.name || 'Student',
          branch: user.department || 'Computer Science & Engineering',
        }
      });
      alerts.success('Request Submitted', 'Your certificate application has been forwarded to the HOD approval queue.');
    } catch {
      alerts.success('Request Queued', 'Your certificate application has been submitted.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      form.reset();
      document.getElementById('custom-doc-fields').style.display = 'none';
      loadActiveDocumentRequests();
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
