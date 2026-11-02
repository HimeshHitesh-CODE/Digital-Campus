import re

# 1. Update backend/main.py with DELETE and COMMENT routes for requests
main_py_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\backend\main.py"
with open(main_py_path, "r", encoding="utf-8") as f:
    main_py = f.read()

new_routes = """
@app.delete("/api/v1/requests/{request_id}")
@app.delete("/api/requests/{request_id}")
async def delete_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(DigitalRequestDB).filter(DigitalRequestDB.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    db.delete(req)
    db.commit()
    await ws_manager.broadcast({
        "type": "DIGITAL_REQUEST_DELETED",
        "request_id": request_id
    })
    return {"success": True, "message": f"Request #{request_id} has been withdrawn/removed."}

@app.post("/api/v1/requests/{request_id}/comment")
@app.post("/api/requests/{request_id}/comment")
async def add_request_comment(request_id: int, comment_data: dict, db: Session = Depends(get_db)):
    req = db.query(DigitalRequestDB).filter(DigitalRequestDB.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    author = comment_data.get("author", "User")
    role = comment_data.get("role", "student")
    text = comment_data.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="Comment text cannot be empty.")
    now_ts = datetime.utcnow().strftime("%I:%M %p")
    new_entry = f"[{now_ts}] {author} ({role}): {text}"
    if req.hod_notes:
        req.hod_notes = f"{req.hod_notes} \\n{new_entry}"
    else:
        req.hod_notes = new_entry
    db.commit()
    db.refresh(req)
    await ws_manager.broadcast({
        "type": "DIGITAL_REQUEST_COMMENT_ADDED",
        "request_id": request_id,
        "hod_notes": req.hod_notes
    })
    return {"success": True, "hod_notes": req.hod_notes}
"""

if "delete_request" not in main_py:
    # insert before @app.get("/api/v1/hod/requests")
    main_py = main_py.replace('@app.get("/api/v1/hod/requests")', new_routes + '\n@app.get("/api/v1/hod/requests")')
    with open(main_py_path, "w", encoding="utf-8") as f:
        f.write(main_py)
    print("Added DELETE and comment routes to backend/main.py!")

# 2. Update document-logistics.html
doc_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.html"
with open(doc_html_path, "r", encoding="utf-8") as f:
    dhtml = f.read()

# Add Custom Option to Document Type Dropdown
if '<option value="custom">' not in dhtml:
    dhtml = dhtml.replace(
        '<option value="transcript">Official Semester Transcript Excerpt</option>',
        '<option value="transcript">Official Semester Transcript Excerpt</option>\n<option value="custom">Custom / Other Request</option>'
    )

# Add Custom Title Input field right after docTypeSelect container
custom_field_html = """
<!-- Custom Request Title Container (hidden by default) -->
<div class="space-y-1.5 hidden" id="customTitleContainer">
  <label class="text-[16px] font-bold text-emerald-950 tracking-wide" for="customTitleInput">Custom Request Title <span class="text-rose-600">*</span></label>
  <input class="w-full h-12 px-4 rounded-2xl bg-white/90 border border-emerald-200 text-emerald-950 text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 shadow-sm" id="customTitleInput" placeholder="Enter custom certificate or application title" type="text" />
</div>

<!-- Residential / Permanent Address (Required) -->
<div class="space-y-1.5">
  <label class="text-[16px] font-bold text-emerald-950 tracking-wide" for="reqAddress">Residential / Permanent Address <span class="text-rose-600">*</span></label>
  <textarea class="w-full bg-white/90 rounded-2xl border border-emerald-200 p-3.5 text-[15px] font-medium text-emerald-950 placeholder:text-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 leading-relaxed resize-none shadow-sm" id="reqAddress" required rows="2" placeholder="Full residential street address, mandal, district, and PIN code"></textarea>
</div>

<!-- Parent / Guardian Contact Number (Required) -->
<div class="space-y-1.5">
  <label class="text-[16px] font-bold text-emerald-950 tracking-wide" for="reqParentContact">Parent / Guardian Contact Number <span class="text-rose-600">*</span></label>
  <input class="w-full h-12 px-4 rounded-2xl bg-white/90 border border-emerald-200 text-emerald-950 text-[15px] font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-500 shadow-sm" id="reqParentContact" required type="tel" placeholder="+91 9876543210" />
</div>
"""

# Place it right after the docTypeSelect div closing tag
if 'id="customTitleContainer"' not in dhtml:
    dhtml = re.sub(
        r'(</div>\s*</div>\s*<!-- Purpose of Request Textarea -->)',
        custom_field_html + r'\n\1',
        dhtml
    )

# Completely remove Urgent Priority toggle box
dhtml = re.sub(
    r'<!-- Urgent Priority & Biometric Callout -->\s*<div class="p-3\.5 rounded-2xl bg-emerald-50/80[\s\S]*?</div>\s*</div>',
    '',
    dhtml
)

# Remove the hardcoded OTP box and dummy Bus Pass cards from the right section
# Replace active requests container with dynamic container
old_right_card = r'<!-- Request #1: APPROVED \+ High Visibility Institutional Counter Pickup OTP -->[\s\S]*?<!-- Historical Clearance Archive Accordion -->'

new_right_card = """<div id="activeRequestsContainer" class="space-y-4">
  <!-- Dynamic Student Requests populated in real time with bidirectional comment thread & withdrawal -->
</div>

<!-- Historical Clearance Archive Accordion -->"""

dhtml = re.sub(old_right_card, new_right_card, dhtml)

# Also update section title from "Active Requests & Pickup OTP" to "Active Document Requests"
dhtml = dhtml.replace("Active Requests &amp; Pickup OTP", "Active Document Requests")
dhtml = dhtml.replace("Active Requests & Pickup OTP", "Active Document Requests")

with open(doc_html_path, "w", encoding="utf-8") as f:
    f.write(dhtml)
print("document-logistics.html updated!")

# 3. Update document-logistics.js
doc_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\document-logistics.js"
with open(doc_js_path, "w", encoding="utf-8") as f:
    f.write('''/**
 * Samskruti College Certificate & Bonafide Requests Controller
 * Dynamic fill, Real-Time Bidirectional Comments, Request Withdrawal, and Address/Parent Details
 */

document.addEventListener('DOMContentLoaded', () => {
  initCertificateRequests();
});

let currentStudentRequests = [];

function initCertificateRequests() {
  bindStudentMetadata();
  bindCopiesStepper();
  bindCharCounter();
  bindDocTypeToggle();
  bindArchiveAccordion();
  bindRefreshButton();
  bindFormSubmission();
  loadStudentRequests();
}

function bindStudentMetadata() {
  const user = JSON.parse(localStorage.getItem('dc_user') || '{}');
  const metaEl = document.getElementById('reqStudentMeta');
  if (metaEl) {
    const pin = user.pin || localStorage.getItem('user_pin') || '24259-CS-025';
    const name = user.name || localStorage.getItem('user_name') || 'KARNATI HIMESH';
    metaEl.textContent = `${name.toUpperCase()} (PIN: ${pin})`;
  }
}

function bindDocTypeToggle() {
  const select = document.getElementById('docTypeSelect');
  const customContainer = document.getElementById('customTitleContainer');
  select?.addEventListener('change', () => {
    if (select.value === 'custom') {
      customContainer?.classList.remove('hidden');
      document.getElementById('customTitleInput')?.focus();
    } else {
      customContainer?.classList.add('hidden');
    }
  });
}

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

function bindCharCounter() {
  const textarea = document.getElementById('purposeText');
  const counter = document.getElementById('charCounter');
  textarea?.addEventListener('input', (e) => {
    const len = e.target.value.length;
    if (counter) counter.textContent = `${len} / 220`;
  });
}

function bindArchiveAccordion() {
  const toggleBtn = document.getElementById('toggleArchiveBtn');
  const archiveContent = document.getElementById('archiveContent');
  const arrow = document.getElementById('accordionArrow');

  toggleBtn?.addEventListener('click', () => {
    archiveContent?.classList.toggle('hidden');
    arrow?.classList.toggle('rotate-180');
  });
}

function bindRefreshButton() {
  const refreshBtn = document.getElementById('refreshBtn');
  if (!refreshBtn) return;

  refreshBtn.addEventListener('click', () => {
    loadStudentRequests();
    showToast('Document requests queue refreshed.');
  });
}

async function loadStudentRequests() {
  const pin = localStorage.getItem('user_pin') || '24259-CS-025';
  let requests = [];

  try {
    const res = await fetch(`/api/v1/requests/my?pin=${encodeURIComponent(pin)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.requests) requests = data.requests;
    }
  } catch (e) {
    console.warn('Backend requests fetch fallback:', e);
  }

  // Also read from local cache
  const localReqs = JSON.parse(localStorage.getItem(`requests_${pin}`) || '[]');
  const combined = [...localReqs, ...requests];
  const unique = [];
  const seenIds = new Set();
  for (const r of combined) {
    const key = r.id || r.ref;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      unique.push(r);
    }
  }

  // If none exist yet, add one sample pending request
  if (unique.length === 0) {
    unique.push({
      id: 101,
      ref: '#REQ-24259-082',
      request_type: 'Bonafide Certificate',
      reason: 'Required for Passport Seva Kendra (PSK Begumpet) verification scheduled on March 18.',
      residential_address: 'Flat 402, Green Meadows, Ghatkesar, Hyderabad, PIN 501301',
      parent_contact: '+91 9849012345',
      status: 'APPROVED',
      hod_notes: 'Approved for official PSK passport processing. Collect from Academic Section.',
      submitted_at: 'Issued Today, 09:40 AM'
    });
  }

  currentStudentRequests = unique;
  renderRequests(unique);
}

function renderRequests(reqs) {
  const container = document.getElementById('activeRequestsContainer');
  if (!container) return;

  if (reqs.length === 0) {
    container.innerHTML = `
      <div class="glass-card rounded-[28px] p-8 text-center text-stone-500 font-dg">
        <span class="material-symbols-outlined text-4xl text-emerald-700/60 block mb-2">folder_open</span>
        <p class="font-bold text-lg text-emerald-950">No Active Document Requests</p>
        <p class="text-sm text-stone-600 mt-1">Submit a certificate or bonafide application using the form on the left.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = reqs.map((r, idx) => {
    let statusClass = 'bg-amber-100 text-amber-900 border-amber-300';
    let statusLabel = 'PENDING HOD SIGN-OFF';
    if (r.status === 'APPROVED' || r.status === 'APPROVED BY HOD') {
      statusClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      statusLabel = 'APPROVED BY HOD';
    } else if (r.status === 'REJECTED' || r.status === 'REJECTED BY HOD') {
      statusClass = 'bg-rose-100 text-rose-900 border-rose-300';
      statusLabel = 'REJECTED BY HOD';
    }

    const reqId = r.id || `req-${idx}`;
    const refCode = r.ref || `#REQ-24259-${r.id || idx+100}`;
    const reqType = r.request_type || r.title || 'Official Document';
    const address = r.residential_address || r.address || 'Address provided on file';
    const parentPhone = r.parent_contact || r.parentPhone || '+91 On File';
    const comments = r.hod_notes || 'Pending HOD review and remark.';

    return `
      <div class="glass-card rounded-[28px] p-6 space-y-4 relative border border-emerald-500/20 shadow-xs" id="reqCard-${reqId}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-emerald-900/10">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-emerald-800">${refCode}</span>
              <span class="text-emerald-400">&bull;</span>
              <span class="text-xs text-stone-500">${r.submitted_at || 'Recently Submitted'}</span>
            </div>
            <h3 class="font-bold text-xl text-emerald-950 mt-0.5">${escapeHtml(reqType)}</h3>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${statusClass}">
              <span class="w-2 h-2 rounded-full ${r.status === 'APPROVED' ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}"></span>
              ${statusLabel}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/60">
          <div>
            <span class="font-bold text-emerald-950 block">Purpose of Request:</span>
            <span class="text-stone-700">${escapeHtml(r.reason || r.purpose || 'Official verification')}</span>
          </div>
          <div>
            <span class="font-bold text-emerald-950 block">Residential Address:</span>
            <span class="text-stone-700">${escapeHtml(address)}</span>
          </div>
          <div>
            <span class="font-bold text-emerald-950 block">Parent / Guardian Contact:</span>
            <span class="font-mono text-emerald-900 font-bold">${escapeHtml(parentPhone)}</span>
          </div>
          <div>
            <span class="font-bold text-emerald-950 block">Action / Clearance:</span>
            <span class="text-stone-700">${statusLabel === 'APPROVED BY HOD' ? 'Ready for pickup at Academic Counter' : 'Under HOD review'}</span>
          </div>
        </div>

        <!-- Bidirectional Comment Thread -->
        <div class="rounded-2xl bg-white/90 border border-emerald-900/10 p-3.5 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="font-dg text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">forum</span>
              Official Remarks &amp; Dialogue Thread
            </span>
          </div>
          <div class="text-xs text-stone-700 font-mono bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 whitespace-pre-line" id="comments-${reqId}">
            ${escapeHtml(comments)}
          </div>
          <div class="flex gap-2">
            <input type="text" placeholder="Type a reply or clarification to HOD..." class="flex-1 px-3 py-1.5 rounded-xl border border-emerald-900/15 text-xs text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500" id="replyInput-${reqId}" />
            <button type="button" class="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-dg text-xs font-bold transition-all shrink-0 cursor-pointer" onclick="handleSendReply(${reqId})">
              Reply
            </button>
          </div>
        </div>

        <!-- Footer Actions: Remove / Withdraw Request -->
        <div class="flex items-center justify-between pt-1 border-t border-emerald-900/10">
          <span class="text-xs text-stone-500">Autonomous Node 259 Certified</span>
          <button type="button" class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer active:scale-95" onclick="handleWithdrawRequest(${reqId})">
            <span class="material-symbols-outlined text-[14px]">delete</span>
            <span>Remove / Withdraw Request</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function handleWithdrawRequest(reqId) {
  if (!confirm('Are you sure you want to withdraw and remove this document request?')) return;

  try {
    await fetch(`/api/v1/requests/${reqId}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Offline request deletion fallback:', e);
  }

  const pin = localStorage.getItem('user_pin') || '24259-CS-025';
  let localReqs = JSON.parse(localStorage.getItem(`requests_${pin}`) || '[]');
  localReqs = localReqs.filter(r => (r.id != reqId && r.ref != reqId));
  localStorage.setItem(`requests_${pin}`, JSON.stringify(localReqs));

  currentStudentRequests = currentStudentRequests.filter(r => (r.id != reqId));
  renderRequests(currentStudentRequests);
  showToast('Request withdrawn and removed from HOD queue.');
}

async function handleSendReply(reqId) {
  const input = document.getElementById(`replyInput-${reqId}`);
  if (!input || !input.value.trim()) return;
  const replyText = input.value.trim();
  const user = JSON.parse(localStorage.getItem('dc_user') || '{}');
  const studentName = user.name || 'Student';

  try {
    await fetch(`/api/v1/requests/${reqId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: studentName,
        role: 'student',
        text: replyText
      })
    });
  } catch (e) {
    console.warn('Comment post fallback:', e);
  }

  const commentBox = document.getElementById(`comments-${reqId}`);
  if (commentBox) {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    commentBox.innerHTML += `\\n[${timeNow}] ${escapeHtml(studentName)} (student): ${escapeHtml(replyText)}`;
  }
  input.value = '';
  showToast('Reply dispatched to HOD remark thread.');
}

function bindFormSubmission() {
  window.triggerSubmit = async function () {
    const textarea = document.getElementById('purposeText');
    const docTypeSelect = document.getElementById('docTypeSelect');
    const customTitleInput = document.getElementById('customTitleInput');
    const addressInput = document.getElementById('reqAddress');
    const parentContactInput = document.getElementById('reqParentContact');
    const countDisplay = document.getElementById('copiesCount');
    const btn = document.getElementById('submitRequestBtn');

    if (!textarea || !btn) return;
    const purpose = textarea.value.trim();
    const address = addressInput ? addressInput.value.trim() : '';
    const parentContact = parentContactInput ? parentContactInput.value.trim() : '';

    if (!purpose) {
      showToast('Please state the purpose of your request', 'error');
      textarea.focus();
      return;
    }
    if (!address) {
      showToast('Residential / Permanent Address is required', 'error');
      addressInput?.focus();
      return;
    }
    if (!parentContact) {
      showToast('Parent / Guardian Contact Number is required', 'error');
      parentContactInput?.focus();
      return;
    }

    let docType = docTypeSelect ? docTypeSelect.value : 'Bonafide Certificate';
    if (docType === 'custom') {
      const customTitle = customTitleInput?.value.trim();
      if (!customTitle) {
        showToast('Please specify the custom request title', 'error');
        customTitleInput?.focus();
        return;
      }
      docType = customTitle;
    } else {
      docType = docTypeSelect?.options[docTypeSelect.selectedIndex]?.text || docType;
    }

    const copies = countDisplay ? countDisplay.textContent : '1';
    const randomRefNum = Math.floor(100 + Math.random() * 900);
    const refId = `#REQ-24259-${randomRefNum}`;
    const pin = localStorage.getItem('user_pin') || '24259-CS-025';
    const user = JSON.parse(localStorage.getItem('dc_user') || '{}');
    const studentName = user.name || 'KARNATI HIMESH';

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">refresh</span><span>Transmitting to HOD Terminal...</span>';

    const newRequestObj = {
      id: Date.now(),
      ref: refId,
      student_pin: pin,
      student_name: studentName,
      request_type: docType,
      reason: purpose,
      residential_address: address,
      parent_contact: parentContact,
      copies: copies,
      status: 'PENDING HOD SIGN-OFF',
      hod_notes: 'Under HOD review.',
      submitted_at: 'Just now'
    };

    try {
      await fetch('/api/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_pin: pin,
          student_name: studentName,
          request_type: docType,
          reason: `${purpose} | Address: ${address} | Parent: ${parentContact}`,
          urgency: 'NORMAL'
        })
      });
    } catch (e) {
      console.warn('API request save fallback:', e);
    }

    // Save to local cache
    const localReqs = JSON.parse(localStorage.getItem(`requests_${pin}`) || '[]');
    localReqs.unshift(newRequestObj);
    localStorage.setItem(`requests_${pin}`, JSON.stringify(localReqs));

    setTimeout(() => {
      currentStudentRequests.unshift(newRequestObj);
      renderRequests(currentStudentRequests);

      showToast(`Request ${refId} submitted to HOD!`);
      textarea.value = '';
      if (addressInput) addressInput.value = '';
      if (parentContactInput) parentContactInput.value = '';
      if (customTitleInput) customTitleInput.value = '';
      btn.disabled = false;
      btn.innerHTML = '<span>Submit to Department HOD for Approval</span><span class="material-symbols-outlined text-[20px]">arrow_forward</span>';
    }, 800);
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(message, type = 'success') {
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
''')
print("document-logistics.js updated!")
