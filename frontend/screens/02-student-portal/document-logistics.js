/**
 * Samskruti College Certificate & Bonafide Requests Controller
 * Dynamic fill and full interactive logic for Stitch Campus Connect Requests
 */

document.addEventListener('DOMContentLoaded', () => {
  initCertificateRequests();
});

function initCertificateRequests() {
  bindStudentMetadata();
  bindCopiesStepper();
  bindCharCounter();
  bindArchiveAccordion();
  bindRefreshButton();
  bindOtpCopy();
  bindPdfPreview();
  bindFormSubmission();
}

/**
 * 1. Bind Student Header Metadata
 */
function bindStudentMetadata() {
  if (typeof StitchState === 'undefined') return;
  const user = StitchState.getUser();

  const metaEl = document.getElementById('reqStudentMeta');
  if (metaEl) {
    metaEl.textContent = `${user.name.toUpperCase()} (PIN: ${user.pin || '24259-CS-025'})`;
  }
}

/**
 * 2. Stepper Count Logic (Clamped 1 to 3)
 */
function bindCopiesStepper() {
  const decBtn = document.getElementById('decCopies');
  const incBtn = document.getElementById('incCopies');
  const countDisplay = document.getElementById('copiesCount');
  let copies = 1;

  decBtn?.addEventListener('click', () => {
    if (copies > 1) {
      copies--;
      countDisplay.textContent = copies;
    }
  });

  incBtn?.addEventListener('click', () => {
    if (copies < 3) {
      copies++;
      countDisplay.textContent = copies;
    }
  });
}

/**
 * 3. Character Counter (Max 220)
 */
function bindCharCounter() {
  const textarea = document.getElementById('purposeText');
  const counter = document.getElementById('charCounter');
  textarea?.addEventListener('input', (e) => {
    const len = e.target.value.length;
    if (counter) counter.textContent = `${len} / 220`;
  });
}

/**
 * 4. Archive Accordion Toggle
 */
function bindArchiveAccordion() {
  const toggleBtn = document.getElementById('toggleArchiveBtn');
  const archiveContent = document.getElementById('archiveContent');
  const arrow = document.getElementById('accordionArrow');

  toggleBtn?.addEventListener('click', () => {
    const isHidden = archiveContent.classList.contains('hidden');
    if (isHidden) {
      archiveContent.classList.remove('hidden');
      arrow?.classList.add('rotate-180');
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      archiveContent.classList.add('hidden');
      arrow?.classList.remove('rotate-180');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * 5. Refresh Action with Feedback
 */
function bindRefreshButton() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (!refreshBtn) return;

  refreshBtn.addEventListener('click', () => {
    refreshBtn.disabled = true;
    const labelSpan = refreshBtn.querySelector('span:last-child');
    const originalText = labelSpan ? labelSpan.textContent : 'Refresh Request Status';
    if (labelSpan) labelSpan.textContent = 'Syncing SBTET Desk...';

    setTimeout(() => {
      refreshBtn.disabled = false;
      if (labelSpan) labelSpan.textContent = originalText;
      showToast('SBTET Clearance Terminal & HOD Direct Queue Synchronized');
    }, 900);
  });
}

/**
 * 6. Copy OTP Token
 */
function bindOtpCopy() {
  const btn = document.getElementById('btnCopyOtp');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const otp = '584386';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(otp).then(() => {
        showToast(`Pickup OTP Token (${otp}) copied to clipboard! Present at Counter 2.`);
      }).catch(() => {
        showToast(`Pickup OTP Token: ${otp}`);
      });
    } else {
      showToast(`Pickup OTP Token: ${otp}`);
    }
  });
}

/**
 * 7. View PDF Preview Modal
 */
function bindPdfPreview() {
  const btn = document.getElementById('btnViewPdfPreview');
  const modal = document.getElementById('modalPdfPreview');
  if (!btn || !modal) return;

  btn.addEventListener('click', () => {
    modal.classList.remove('hidden');
  });

  modal.querySelectorAll('.close-modal-btn').forEach(b => {
    b.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
}

/**
 * 8. Form Submission: Dynamic Prepending & Animate
 */
function bindFormSubmission() {
  window.triggerSubmit = function () {
    const textarea = document.getElementById('purposeText');
    const docTypeSelect = document.getElementById('docTypeSelect');
    const btn = document.getElementById('submitRequestBtn');
    const counter = document.getElementById('charCounter');
    const countDisplay = document.getElementById('copiesCount');

    if (!textarea || !btn) return;
    const purpose = textarea.value.trim();

    if (!purpose) {
      textarea.focus();
      textarea.parentElement?.classList.add('ring-2', 'ring-red-400', 'bg-red-50');
      setTimeout(() => {
        textarea.parentElement?.classList.remove('ring-2', 'ring-red-400', 'bg-red-50');
      }, 1200);
      return;
    }

    const docType = docTypeSelect ? docTypeSelect.value : 'Bonafide Certificate';
    const copies = countDisplay ? countDisplay.textContent : '1';
    const randomRefNum = Math.floor(100 + Math.random() * 900);
    const refId = `#REQ-24259-${randomRefNum}`;

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">refresh</span><span>Routing to Dr. K. Srinivas...</span>';

    setTimeout(() => {
      btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">done_all</span><span>Queued in HOD Direct Terminal</span>';

      // Dynamically create and prepend new request card
      prependRequestCard({
        ref: refId,
        title: docType,
        purpose: purpose,
        copies: copies,
        date: 'Just now'
      });

      // Save to state
      if (typeof StitchState !== 'undefined') {
        StitchState.addRequest({
          id: `req-${randomRefNum}`,
          ref: refId,
          title: docType,
          date: 'Just now',
          purpose: purpose,
          status: 'PENDING HOD SIGN-OFF',
          statusBadge: 'PENDING HOD SIGN-OFF',
          statusColor: 'amber',
          queuePosition: 'Queue Position #1',
          step: 2,
          stepLabel: 'Step 2 of 3 (HOD Desk)',
          progressPct: 50
        });
      }

      showToast(`Request ${refId} created and dispatched to HOD Dr. K. Srinivas!`);

      // Reset form after 2 seconds
      setTimeout(() => {
        textarea.value = '';
        if (counter) counter.textContent = '0 / 220';
        btn.disabled = false;
        btn.innerHTML = `<span>Submit to Department HOD for Approval</span><span class="material-symbols-outlined text-[20px]">arrow_forward</span>`;
      }, 2000);
    }, 1100);
  };
}

function prependRequestCard(data) {
  const container = document.getElementById('activeRequestsContainer');
  if (!container) return;

  const card = document.createElement('div');
  card.className = 'glass-card rounded-[26px] p-6 flex flex-col gap-5 border border-emerald-500/30 transform transition-all duration-500 animate-pulse';
  card.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/10">
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <span class="font-mono text-xs font-bold text-emerald-800 tracking-wider">REF ${data.ref}</span>
          <span class="inline-block w-1 h-1 rounded-full bg-emerald-400"></span>
          <span class="text-xs text-stone-500">${data.date}</span>
        </div>
        <h3 class="font-bold text-2xl text-emerald-950 mt-1">${data.title}</h3>
      </div>
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold border border-amber-300">
        <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
        PENDING HOD SIGN-OFF
      </span>
    </div>

    <div class="flex flex-wrap gap-2 text-xs">
      <span class="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 font-semibold">Purpose: ${data.purpose}</span>
      <span class="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 font-semibold">Copies: ${data.copies}</span>
      <span class="px-3 py-1 rounded-full bg-surface-container-low border border-stone-200 text-stone-700 font-semibold">Queue Position #1</span>
    </div>

    <div class="p-4 rounded-2xl bg-surface-container-low border border-emerald-900/10 flex flex-col gap-2.5">
      <div class="flex justify-between items-center text-xs font-bold text-emerald-950">
        <span class="uppercase tracking-wider">Workflow Clearance Progression</span>
        <span class="font-mono text-emerald-800">STEP 1 OF 3</span>
      </div>
      <div class="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-500 h-2 rounded-full" style="width: 33%;"></div>
      </div>
      <div class="flex justify-between text-[11px] font-semibold text-stone-500">
        <span class="text-emerald-800 font-bold">✓ Submitted</span>
        <span class="text-amber-800 font-bold">● HOD Desk</span>
        <span>Counter Desk</span>
      </div>
    </div>
  `;

  container.insertBefore(card, container.firstChild);

  setTimeout(() => {
    card.classList.remove('animate-pulse');
  }, 1500);
}

/**
 * 9. Toast Helper
 */
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) return;

  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');

  clearTimeout(window._reqToastTimeout);
  window._reqToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
