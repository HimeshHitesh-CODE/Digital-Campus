/**
 * Samskruti College Biometric Attendance Controller
 * Dynamic fill and full interactive logic for Stitch Campus Connect Attendance
 */

document.addEventListener('DOMContentLoaded', () => {
  initAttendance();
});

const MONTH_DATA = {
  'Oct 2024': {
    days: [
      { date: '01', status: 'holiday', label: 'Holiday' },
      { date: '02', status: 'holiday', label: 'Gandhi Jayanti' },
      { date: '03', status: 'absent', label: 'Absent' },
      { date: '04', status: 'absent', label: 'Absent' },
      { date: '05', status: 'weekoff', label: 'Sat Off' },
      { date: '06', status: 'weekoff', label: 'Sun Off' },
      { date: '07', status: 'present', label: 'Present' },
      { date: '08', status: 'absent', label: 'Absent' },
      { date: '09', status: 'absent', label: 'Absent' },
      { date: '10', status: 'holiday', label: 'Dussehra' },
      { date: '11', status: 'holiday', label: 'Dussehra' },
      { date: '12', status: 'weekoff', label: 'Sat Off' },
      { date: '13', status: 'weekoff', label: 'Sun Off' },
      { date: '14', status: 'absent', label: 'Absent' },
      { date: '15', status: 'absent', label: 'Absent' },
      { date: '16', status: 'present', label: 'Present' },
      { date: '17', status: 'absent', label: 'Absent' },
      { date: '18', status: 'absent', label: 'Absent' },
      { date: '19', status: 'weekoff', label: 'Sat Off' },
      { date: '20', status: 'weekoff', label: 'Sun Off' },
      { date: '21', status: 'absent', label: 'Absent' },
      { date: '22', status: 'absent', label: 'Absent' },
      { date: '23', status: 'absent', label: 'Absent' },
      { date: '24', status: 'present', label: 'Present' },
      { date: '25', status: 'present', label: 'Present (Today)', isToday: true },
      { date: '26', status: 'weekoff', label: 'Sat Off' },
      { date: '27', status: 'weekoff', label: 'Sun Off' }
    ],
    summary: 'This Month: 5 / 22 Sess',
    rate: '22.7%'
  },
  'Sep': {
    days: [
      { date: '02', status: 'present', label: 'Present' },
      { date: '03', status: 'present', label: 'Present' },
      { date: '04', status: 'absent', label: 'Absent' },
      { date: '05', status: 'present', label: 'Present' },
      { date: '06', status: 'present', label: 'Present' },
      { date: '09', status: 'absent', label: 'Absent' },
      { date: '10', status: 'absent', label: 'Absent' },
      { date: '11', status: 'present', label: 'Present' },
      { date: '12', status: 'present', label: 'Present' },
      { date: '13', status: 'present', label: 'Present' },
      { date: '16', status: 'holiday', label: 'Milad-un-Nabi' },
      { date: '17', status: 'present', label: 'Present' },
      { date: '18', status: 'present', label: 'Present' },
      { date: '19', status: 'absent', label: 'Absent' },
      { date: '20', status: 'present', label: 'Present' },
      { date: '23', status: 'present', label: 'Present' },
      { date: '24', status: 'present', label: 'Present' },
      { date: '25', status: 'absent', label: 'Absent' },
      { date: '26', status: 'present', label: 'Present' },
      { date: '27', status: 'present', label: 'Present' },
      { date: '30', status: 'present', label: 'Present' }
    ],
    summary: 'This Month: 15 / 21 Sess',
    rate: '71.4%'
  },
  'Aug': {
    days: [
      { date: '01', status: 'present', label: 'Present' },
      { date: '02', status: 'present', label: 'Present' },
      { date: '05', status: 'absent', label: 'Absent' },
      { date: '06', status: 'absent', label: 'Absent' },
      { date: '07', status: 'absent', label: 'Absent' },
      { date: '08', status: 'present', label: 'Present' },
      { date: '09', status: 'present', label: 'Present' },
      { date: '12', status: 'present', label: 'Present' },
      { date: '13', status: 'present', label: 'Present' },
      { date: '14', status: 'present', label: 'Present' },
      { date: '15', status: 'holiday', label: 'Independence Day' },
      { date: '16', status: 'holiday', label: 'Varalakshmi' },
      { date: '19', status: 'absent', label: 'Absent' },
      { date: '20', status: 'absent', label: 'Absent' },
      { date: '21', status: 'present', label: 'Present' },
      { date: '22', status: 'present', label: 'Present' },
      { date: '23', status: 'present', label: 'Present' },
      { date: '26', status: 'holiday', label: 'Janmashtami' },
      { date: '27', status: 'absent', label: 'Absent' },
      { date: '28', status: 'absent', label: 'Absent' },
      { date: '29', status: 'present', label: 'Present' },
      { date: '30', status: 'present', label: 'Present' }
    ],
    summary: 'This Month: 12 / 20 Sess',
    rate: '60.0%'
  },
  'Jul': {
    days: [
      { date: '01', status: 'present', label: 'Present' },
      { date: '02', status: 'present', label: 'Present' },
      { date: '03', status: 'present', label: 'Present' },
      { date: '04', status: 'present', label: 'Present' },
      { date: '05', status: 'present', label: 'Present' },
      { date: '08', status: 'absent', label: 'Absent' },
      { date: '09', status: 'absent', label: 'Absent' },
      { date: '10', status: 'present', label: 'Present' },
      { date: '11', status: 'present', label: 'Present' },
      { date: '12', status: 'present', label: 'Present' },
      { date: '15', status: 'present', label: 'Present' },
      { date: '16', status: 'present', label: 'Present' },
      { date: '17', status: 'holiday', label: 'Muharram' },
      { date: '18', status: 'present', label: 'Present' },
      { date: '19', status: 'present', label: 'Present' },
      { date: '22', status: 'absent', label: 'Absent' },
      { date: '23', status: 'absent', label: 'Absent' },
      { date: '24', status: 'present', label: 'Present' },
      { date: '25', status: 'present', label: 'Present' },
      { date: '26', status: 'present', label: 'Present' },
      { date: '29', status: 'holiday', label: 'Bonalu' },
      { date: '30', status: 'present', label: 'Present' },
      { date: '31', status: 'present', label: 'Present' }
    ],
    summary: 'This Month: 16 / 21 Sess',
    rate: '76.2%'
  },
  'Jun': {
    days: [
      { date: '03', status: 'present', label: 'Present' },
      { date: '04', status: 'present', label: 'Present' },
      { date: '05', status: 'present', label: 'Present' },
      { date: '06', status: 'present', label: 'Present' },
      { date: '07', status: 'present', label: 'Present' },
      { date: '10', status: 'present', label: 'Present' },
      { date: '11', status: 'present', label: 'Present' },
      { date: '12', status: 'present', label: 'Present' },
      { date: '13', status: 'present', label: 'Present' },
      { date: '14', status: 'present', label: 'Present' },
      { date: '17', status: 'holiday', label: 'Bakrid' },
      { date: '18', status: 'present', label: 'Present' },
      { date: '19', status: 'present', label: 'Present' },
      { date: '20', status: 'present', label: 'Present' },
      { date: '21', status: 'present', label: 'Present' },
      { date: '24', status: 'absent', label: 'Absent' },
      { date: '25', status: 'absent', label: 'Absent' },
      { date: '26', status: 'present', label: 'Present' },
      { date: '27', status: 'present', label: 'Present' },
      { date: '28', status: 'present', label: 'Present' }
    ],
    summary: 'This Month: 17 / 19 Sess',
    rate: '89.5%'
  }
};

function initAttendance() {
  bindStudentMetadata();
  bindTelemetryKPIs();
  bindResyncButton();
  bindDownloadStatement();
  bindMonthPills();
  bindMedicalAppealModal();
  bindWardenAndGrievance();
}

/**
 * 1. Bind Student Header Metadata
 */
function bindStudentMetadata() {
  if (typeof StitchState === 'undefined') return;
  const user = StitchState.getUser();

  const nameEl = document.getElementById('attStudentName');
  if (nameEl) nameEl.textContent = user.name || 'Karnati Himesh';

  const pinEl = document.getElementById('attStudentPin');
  if (pinEl) pinEl.textContent = `PIN: ${user.pin || '24259-CS-025'}`;

  const semEl = document.getElementById('attStudentSem');
  if (semEl) semEl.textContent = `${user.semester || 'Sem IV'} (${user.academicYear || '2024-25'})`;
}

/**
 * 2. Bind KPIs & Animate Circular Gauge
 */
function bindTelemetryKPIs() {
  if (typeof StitchState === 'undefined') return;
  const att = StitchState.getAttendance();

  // Rate text
  const rateEl = document.getElementById('kpiGaugeRate');
  if (rateEl) rateEl.textContent = `${att.overallRate.toFixed(2)}%`;

  // Circular gauge animation
  const circle = document.getElementById('svgGaugeCircle');
  if (circle) {
    const perimeter = 301.59;
    const offset = perimeter * (1 - (att.overallRate / 100));
    circle.style.strokeDashoffset = offset.toFixed(2);
  }

  // Deficit text
  const deficitEl = document.getElementById('kpiGaugeDeficit');
  if (deficitEl) deficitEl.textContent = `${att.deficit.toFixed(2)}%`;

  // Prescription numbers
  const totalEl = document.getElementById('kpiPrescriptionTotal');
  if (totalEl) totalEl.textContent = att.workingDays;

  const presentEl = document.getElementById('kpiPrescriptionPresent');
  if (presentEl) presentEl.textContent = att.recordedPresent;

  const absentEl = document.getElementById('kpiPrescriptionAbsent');
  if (absentEl) absentEl.textContent = att.absentSessions;

  const remEl = document.getElementById('kpiPrescriptionRemaining');
  if (remEl) remEl.textContent = String(att.remainingDays).padStart(2, '0');

  const neededEl = document.getElementById('kpiConsecutiveNeeded');
  if (neededEl) neededEl.textContent = `${att.consecutiveNeeded} consecutive sessions`;
}

/**
 * 3. Re-sync Button with 180-deg rotation & toast
 */
function bindResyncButton() {
  const syncBtn = document.getElementById('resyncBtn');
  const syncIcon = document.getElementById('syncIcon');
  if (!syncBtn || !syncIcon) return;

  syncBtn.addEventListener('click', () => {
    syncIcon.classList.add('rotate-180');
    syncBtn.disabled = true;

    setTimeout(() => {
      syncIcon.classList.remove('rotate-180');
      syncBtn.disabled = false;
      showToast('Biometric attendance records synchronized with SBTET State Terminal');
      
      const punchEl = document.getElementById('attLastPunch');
      if (punchEl) {
        const now = new Date();
        const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        punchEl.textContent = `Last Biometric Punch: Today, ${formatted} (Device #Bio-CSE-04)`;
      }
    }, 700);
  });
}

/**
 * 4. Download Statement -> window.print()
 */
function bindDownloadStatement() {
  const btn = document.getElementById('btnDownloadStatement');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Preparing official SBTET biometric statement print memo...');
    setTimeout(() => {
      window.print();
    }, 400);
  });
}

/**
 * 5. Interactive Monthly Calendar Pills & Day Switcher
 */
function bindMonthPills() {
  const pills = document.querySelectorAll('.month-pill');
  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => {
        p.removeAttribute('style');
        p.className = 'month-pill px-3 py-1 rounded-full text-on-surface-variant hover:bg-emerald-50 font-bold text-sm transition-all';
      });

      pill.className = 'month-pill px-4 py-1 rounded-full text-white font-extrabold text-sm transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)]';
      pill.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';

      const monthName = pill.textContent.trim();
      const monthData = MONTH_DATA[monthName] || MONTH_DATA['Oct 2024'];
      renderCalendarDays(monthData);
    });
  });
}

function renderCalendarDays(data) {
  const container = document.querySelector('.grid.grid-cols-7.gap-2.text-center');
  if (!container || !data.days) return;

  // Preserve day headers (M T W T F S S)
  const headerHtml = `
    <span class="text-xs font-bold text-secondary">M</span>
    <span class="text-xs font-bold text-secondary">T</span>
    <span class="text-xs font-bold text-secondary">W</span>
    <span class="text-xs font-bold text-secondary">T</span>
    <span class="text-xs font-bold text-secondary">F</span>
    <span class="text-xs font-bold text-secondary">S</span>
    <span class="text-xs font-bold text-secondary">S</span>
  `;

  const daysHtml = data.days.map(d => {
    let classes = 'py-2 rounded-xl text-xs font-bold transition-all';
    if (d.status === 'present') {
      if (d.isToday) {
        classes += ' bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400 ring-offset-1';
      } else {
        classes += ' bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200';
      }
    } else if (d.status === 'absent') {
      classes += ' bg-red-100/70 text-red-700 hover:bg-red-200';
    } else if (d.status === 'holiday') {
      classes += ' bg-stone-100 text-stone-600';
    } else {
      classes += ' bg-stone-100/60 text-stone-400';
    }
    return `<div class="${classes}" title="${d.label}">${d.date}</div>`;
  }).join('');

  container.innerHTML = headerHtml + daysHtml;

  // Update footer summary
  const summaryRow = container.parentElement.querySelector('.border-t.border-emerald-500\\/10');
  if (summaryRow) {
    const leftText = summaryRow.querySelector('span:first-child');
    const rightText = summaryRow.querySelector('span:last-child');
    if (leftText) leftText.textContent = data.summary;
    if (rightText) rightText.textContent = `Rate: ${data.rate}`;
  }
}

/**
 * 6. Medical Appeal Modal Form
 */
function bindMedicalAppealModal() {
  const trigger = document.getElementById('btnFileMedicalAppeal');
  const modal = document.getElementById('modalMedicalAppeal');
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

  const form = document.getElementById('formMedicalAppeal');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      modal.classList.add('hidden');
      showToast('Medical condonation appeal submitted for HOD Dr. Vamshi Krishna endorsement (#MED-24259-02)');
      form.reset();
    });
  }
}

/**
 * 7. Warden and Grievance Actions
 */
function bindWardenAndGrievance() {
  const wardenBtn = document.getElementById('btnContactWarden');
  if (wardenBtn) {
    wardenBtn.addEventListener('click', () => {
      showToast('Academic Warden Cabin: Room 102, Ground Floor (Intercom Ext: 102)');
    });
  }

  const grievanceBtn = document.getElementById('btnGrievancePortal');
  if (grievanceBtn) {
    grievanceBtn.addEventListener('click', () => {
      showToast('SBTET Biometric Grievance Ticket logged: #GRV-24259-09');
    });
  }
}

/**
 * 8. Toast Helper
 */
function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) return;

  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');

  clearTimeout(window._attToastTimeout);
  window._attToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
