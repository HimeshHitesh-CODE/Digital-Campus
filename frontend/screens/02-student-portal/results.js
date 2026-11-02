/**
 * Samskruti College SBTET Marks & Examination Results Controller
 * Dynamic fill and full interactive logic for Stitch Campus Connect Results
 */

document.addEventListener('DOMContentLoaded', () => {
  initResults();
});

let currentActiveSem = '4';

function initResults() {
  bindStudentMetadata();
  bindMarksSummary();
  bindSyncButton();
  bindPrintAndDownload();
  bindSemesterTabs();
  bindRecountingModal();

  // Initial render of 4th semester subjects
  renderSemesterMarks('4');
}

/**
 * 1. Bind Student Header Metadata
 */
function bindStudentMetadata() {
  if (typeof StitchState === 'undefined') return;
  const user = StitchState.getUser();

  const nameEl = document.getElementById('marksStudentName');
  if (nameEl) nameEl.textContent = user.name || 'Karnati Himesh';

  const pinEl = document.getElementById('marksStudentPin');
  if (pinEl) pinEl.textContent = `PIN: ${user.pin || '24259-CS-025'}`;

  const branchEl = document.getElementById('marksStudentBranch');
  if (branchEl) branchEl.textContent = `Branch: CS (Diploma Engg.) · ${user.branch || 'CSE'}`;
}

/**
 * 2. Bind CGPA, Credits & Standing
 */
function bindMarksSummary() {
  if (typeof StitchState === 'undefined') return;
  const marks = StitchState.getMarks();

  const cgpaEl = document.getElementById('marksCgpa');
  if (cgpaEl) cgpaEl.textContent = marks.cgpa.toFixed(2);

  const credEl = document.getElementById('marksCredits');
  if (credEl) credEl.textContent = marks.securedCredits.toFixed(1);

  const backEl = document.getElementById('marksBacklogs');
  if (backEl) backEl.textContent = marks.activeBacklogs;
}

/**
 * 3. 3-Stage SBTET Sync State Machine
 */
function bindSyncButton() {
  const syncBtn = document.getElementById('sync-btn');
  if (!syncBtn) return;

  const originalContent = syncBtn.innerHTML;

  syncBtn.addEventListener('click', () => {
    // Stage 1 -> Stage 2: Contacting SBTET Server
    syncBtn.innerHTML = `
      <span class="material-symbols-outlined text-[20px] text-emerald-700 animate-spin">refresh</span>
      <span class="text-lg md:text-xl font-bold tracking-tight">Contacting SBTET Server...</span>
    `;
    syncBtn.disabled = true;

    setTimeout(() => {
      // Stage 2 -> Stage 3: Marks Up to Date
      syncBtn.innerHTML = `
        <span class="material-symbols-outlined text-[20px] text-emerald-700">done_all</span>
        <span class="text-lg md:text-xl font-bold tracking-tight">Marks Up to Date</span>
      `;
      showToast('SBTET State Board Central Ledger: C-24 Academic Memo Verified');

      setTimeout(() => {
        // Stage 3 -> Stage 1: Reset
        syncBtn.innerHTML = originalContent;
        syncBtn.disabled = false;
      }, 2500);
    }, 1200);
  });
}

/**
 * 4. Print & Download Memo
 */
function bindPrintAndDownload() {
  const printBtn = document.getElementById('btnPrintMemo');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const dlBtn = document.getElementById('btnDownloadMemo');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      showToast('Generating official consolidated academic transcript PDF...');
      setTimeout(() => {
        window.print();
      }, 500);
    });
  }
}

/**
 * 5. Interactive Semester Tabs & Subject Rendering
 */
function bindSemesterTabs() {
  const tabBtns = document.querySelectorAll('.sem-tab-btn');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sem = btn.getAttribute('data-sem');
      if (!sem) return;

      tabBtns.forEach(b => {
        b.className = 'sem-tab-btn px-4 py-2 rounded-full bg-white border border-emerald-900/10 text-neutral-600 font-bold text-base md:text-lg hover:bg-emerald-50 hover:text-emerald-900 transition-all cursor-pointer whitespace-nowrap';
      });

      btn.className = 'sem-tab-btn active-tab px-5 py-2 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white font-black text-base md:text-lg shadow-md shadow-emerald-700/25 cursor-pointer whitespace-nowrap';

      currentActiveSem = sem;
      renderSemesterMarks(sem);
    });
  });
}

function renderSemesterMarks(sem) {
  if (typeof StitchState === 'undefined') return;
  const marksData = StitchState.getMarks();
  const semData = marksData.semesters[sem] || marksData.semesters['4'];

  // Update Summary numbers
  const sgpaEl = document.getElementById('tabSgpaVal');
  if (sgpaEl) sgpaEl.textContent = semData.sgpa.toFixed(2);

  const credEl = document.getElementById('tabCreditsVal');
  if (credEl) credEl.textContent = `${semData.credits} Earned`;

  const totalEl = document.getElementById('tabTotalMarksVal');
  if (totalEl) totalEl.textContent = `${semData.totalMarks} / ${semData.maxMarks}`;

  const aggEl = document.getElementById('tabAggregateVal');
  if (aggEl) aggEl.textContent = semData.aggregate;

  // Render Table Rows
  const tbody = document.getElementById('marksTableBody');
  if (!tbody || !semData.subjects) return;

  tbody.innerHTML = semData.subjects.map(sub => `
    <tr class="hover:bg-emerald-50/50 transition-colors">
      <td class="py-3 px-4 font-black text-emerald-900">${sub.code}</td>
      <td class="py-3 px-4 font-bold text-neutral-900">${sub.desc || sub.title}</td>
      <td class="py-3 px-4 text-sm text-neutral-600">${sub.cat || 'Theory'}</td>
      <td class="py-3 px-3 text-center font-bold text-neutral-700">${sub.internal}</td>
      <td class="py-3 px-3 text-center font-bold text-neutral-700">${sub.endSem}</td>
      <td class="py-3 px-3 text-center font-black text-emerald-950">${sub.total}</td>
      <td class="py-3 px-3 text-center font-black text-emerald-800">${sub.gradePoint.toFixed(1)}</td>
      <td class="py-3 px-3 text-center">
        <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-black text-sm">
          ${sub.letter}
        </span>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 font-extrabold text-xs md:text-sm border border-emerald-300">
          ${sub.status}
        </span>
      </td>
    </tr>
  `).join('');
}

/**
 * 6. Recounting Modal & Submission
 */
function bindRecountingModal() {
  const trigger = document.getElementById('btnApplyRecounting');
  const modal = document.getElementById('modalRecounting');
  if (!trigger || !modal) return;

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('hidden');
  });

  modal.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  const form = document.getElementById('formRecounting');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      modal.classList.add('hidden');
      showToast('SBTET Recounting challenge recorded (#RC-24259-88). Fee challan verified.');
      form.reset();
    });
  }
}

/**
 * 7. Toast Helper
 */
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) return;

  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');

  clearTimeout(window._resToastTimeout);
  window._resToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
