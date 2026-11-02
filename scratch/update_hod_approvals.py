import re

# 1. Update document-approvals.html
app_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\document-approvals.html"
with open(app_html_path, "r", encoding="utf-8") as f:
    ahtml = f.read()

# Update OTP badge text in footer
ahtml = ahtml.replace("Pickups verified via 6-digit SMS OTP", "Verified via Official Autonomous HOD Attestation Protocol")

# In the review modal, add HOD Remark input and update button texts
modal_actions_old = r'<div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-200/80">[\s\S]*?Approve &amp; Generate Pickup OTP &rarr;[\s\S]*?</button>\s*</div>'

modal_actions_new = """<!-- HOD Official Remark Input -->
        <div class="space-y-1.5 pt-2">
          <label class="block text-xs font-bold text-stone-700 uppercase tracking-wide">HOD Remark / Clearance Instructions</label>
          <textarea id="modalHodRemarkInput" rows="2" class="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-sans" placeholder="Enter instructions or reason for student (e.g. Approved. Collect physical memo from Academic Counter 2)..."></textarea>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-200/80">
          <button id="modalRejectBtn" class="w-full sm:w-auto px-5 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer" type="button">
            Reject Request
          </button>
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button id="modalCloseActionBtn" class="px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer" type="button">
              Close
            </button>
            <button id="modalApproveBtn" class="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#003519] to-[#047857] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer" type="button">
              Approve &amp; Issue Attestation &rarr;
            </button>
          </div>
        </div>"""

ahtml = re.sub(modal_actions_old, modal_actions_new, ahtml)

with open(app_html_path, "w", encoding="utf-8") as f:
    f.write(ahtml)
print("document-approvals.html updated!")

# 2. Update document-approvals.js
app_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\document-approvals.js"
with open(app_js_path, "r", encoding="utf-8") as f:
    ajs = f.read()

# Replace any OTP generation and approve logic
old_approve_func = r'function approveCurrentRequest\(\)\s*\{[\s\S]*?showToast\([^)]+\);\s*\}'
new_approve_func = """function approveCurrentRequest() {
  if (!activeRequest) return;
  const remark = document.getElementById('modalHodRemarkInput')?.value.trim() || 'Approved by HOD. Verified against official attendance record.';

  activeRequest.status = 'APPROVED';
  activeRequest.hod_notes = remark;

  // Persist update to backend
  if (activeRequest.id) {
    fetch(`/api/v1/hod/requests/${activeRequest.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED', notes: remark })
    }).catch(e => console.warn('Status update API error:', e));
  }

  showToast(`Document Request ${activeRequest.id || ''} Approved!`);
  closeReviewModal();
  renderRequestsTable(currentRequests);
}"""

ajs = re.sub(old_approve_func, new_approve_func, ajs)

old_reject_func = r'function rejectCurrentRequest\(\)\s*\{[\s\S]*?showToast\([^)]+\);\s*\}'
new_reject_func = """function rejectCurrentRequest() {
  if (!activeRequest) return;
  const remark = document.getElementById('modalHodRemarkInput')?.value.trim() || 'Rejected due to attendance deficit.';

  activeRequest.status = 'REJECTED';
  activeRequest.hod_notes = remark;

  if (activeRequest.id) {
    fetch(`/api/v1/hod/requests/${activeRequest.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED', notes: remark })
    }).catch(e => console.warn('Status update API error:', e));
  }

  showToast(`Document Request ${activeRequest.id || ''} Rejected.`);
  closeReviewModal();
  renderRequestsTable(currentRequests);
}"""

ajs = re.sub(old_reject_func, new_reject_func, ajs)

with open(app_js_path, "w", encoding="utf-8") as f:
    f.write(ajs)
print("document-approvals.js updated!")
