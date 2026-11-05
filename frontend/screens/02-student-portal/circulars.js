/**
 * Samskruti Digital Campus (Institution Code: 259)
 * Official Circulars & Gazettes Controller
 */

(function () {
  'use strict';

  const CIRCULARS_DATA = [
    {
      id: 'circ-1',
      ref: 'SCET/EXAM/2026-11/C24',
      category: 'examination',
      badge: 'Examination Schedule',
      urgent: true,
      date: 'Oct 26, 2026',
      title: 'SBTET C-24 Diploma Regular & Supplementary Examinations Schedule (Nov/Dec 2026)',
      summary: 'All eligible students with a minimum of 75% biometric attendance are instructed to download their hall tickets from the examination branch desk. Examination fee clearance window closes on Nov 15.',
      details: [
        '1. Theory examinations for Semester 1, 2, 3, and 4 under Curriculum Scheme C-24 commence from November 28, 2026.',
        '2. Practical and laboratory viva examinations will be conducted departmentally from November 18 to November 24, 2026.',
        '3. Mandatory requirement: Hall tickets will be issued exclusively to candidates meeting the statutory 75.00% biometric attendance threshold (or 65.00% with verified medical condonation).',
        '4. Fee remittance portal is open until November 15, 2026, 17:00 IST without penalty. A late fine of ₹300 applies thereafter until November 20.'
      ],
      signatory: 'Dr. J. Vamshi Krishna &bull; Examination Chief Superintendent'
    },
    {
      id: 'circ-2',
      ref: 'SCET/EPASS/2026-B4',
      category: 'scholarship',
      badge: 'Scholarship Renewal',
      urgent: false,
      date: 'Oct 24, 2026',
      title: 'Telangana State ePASS Post-Matric Scholarship Biometric Verification',
      summary: 'Candidates renewing scholarship entitlements must complete biometric authentication at Student Service Counter 3. Required clearances include Bonafide Certificate and Fee Remittance Receipt.',
      details: [
        '1. Telangana ePASS portal registration for the Academic Year 2026-27 is now open for SC, ST, BC, and EBC students.',
        '2. Hard copies of the submitted application alongside Bonafide Certificate and Income Affidavit must be deposited at Admin Counter 02.',
        '3. Biometric iris/fingerprint KYC matching is scheduled from October 28 to November 10 at the College Automation Cell.',
        '4. Students who have not yet requested their Bonafide Certificate may do so instantly via the Requests tab.'
      ],
      signatory: 'Administrative Officer &bull; Welfare & Scholarship Section'
    },
    {
      id: 'circ-3',
      ref: 'SCET/INNOV/2026-H1',
      category: 'events',
      badge: 'Hackathon & R&D',
      urgent: false,
      date: 'Oct 20, 2026',
      title: 'Smart India Hackathon (SIH 2026) Institutional Team Registrations',
      summary: 'CSE & AIML project teams are invited to submit solution abstracts via Idea Hub. Shortlisted teams will receive dedicated mentor support and hardware prototyping grants from the Samskruti T-Hub Incubation Center.',
      details: [
        '1. Smart India Hackathon internal campus selection round will take place on November 12, 2026.',
        '2. Each team must comprise 6 members with mandatory female representation as per AICTE/MHRD guidelines.',
        '3. Problem statements across Smart Cities, Agriculture, Healthcare, and Clean Energy are posted in the Idea Hub.',
        '4. Seed funding of up to ₹25,000 per selected team will be provided by Samskruti Research & Development Foundation.'
      ],
      signatory: 'Convener &bull; Innovation & Entrepreneurship Cell'
    },
    {
      id: 'circ-4',
      ref: 'SCET/AIML/2026-W2',
      category: 'academic',
      badge: 'Technical Workshop',
      urgent: false,
      date: 'Oct 18, 2026',
      title: 'AI & Machine Learning High Performance Compute Lab Induction & Workshop',
      summary: 'Hands-on induction workshop on NVIDIA GPU clusters and TensorFlow / PyTorch deployment pipelines for 2nd & 3rd year polytechnic diploma candidates.',
      details: [
        '1. A 3-day masterclass on "Deep Learning Fundamentals & Edge AI Deployments" will be held from November 5 to 7 in Lab 4.',
        '2. Hands-on access to dual NVIDIA RTX A6000 workstation rigs will be granted to registered participants.',
        '3. Certificate of Completion will be awarded with 2 SBTET non-formal credit endorsements.',
        '4. Registration is capped at 60 candidates on a first-come, first-served basis.'
      ],
      signatory: 'Prof. Padma &bull; Head of Department (AIML)'
    },
    {
      id: 'circ-5',
      ref: 'SCET/ACAD/2026-PROJ',
      category: 'academic',
      badge: 'Curriculum Scheme C-24',
      urgent: false,
      date: 'Oct 15, 2026',
      title: 'Industrial Internship & Capstone Project Submission Deadline (Scheme C-24)',
      summary: 'Final semester students must submit their company training completion certificate and project dissertation synopsis approved by their departmental faculty guide by November 30.',
      details: [
        '1. All candidates undergoing 6-month industrial training in Semester 5/6 must submit their logbook signed by the industry mentor.',
        '2. Plagiarism threshold for the project report synopsis is set to a maximum of 15% via Turnitin.',
        '3. External viva examination will be held in the first week of December with SBTET nominated evaluators.',
        '4. Failure to submit documents by November 30 will result in withholding of the provisional diploma memo.'
      ],
      signatory: 'Dean of Academics &bull; Samskruti Polytechnic'
    },
    {
      id: 'circ-6',
      ref: 'SCET/FEST/2026-E1',
      category: 'events',
      badge: 'Annual Symposium',
      urgent: false,
      date: 'Oct 12, 2026',
      title: 'Annual Samskruti Tech Fest & Hardware Exhibition - Call for Papers',
      summary: 'Departmental competition for robotics, embedded systems, web applications, and technical paper presentations. Cash prizes worth ₹1,00,000 to be won.',
      details: [
        '1. The Annual State-Level Technical Symposium "TECHSAMSKRUTI 2026" is scheduled for December 15-16, 2026.',
        '2. Technical tracks: Embedded IoT, Computer Vision, Autonomous Systems, and Renewable Energy Models.',
        '3. Submission of 2-page IEEE format extended abstracts closes on November 25, 2026.',
        '4. Industry delegates from T-Hub, Infosys, and Qualcomm will evaluate the prototypes.'
      ],
      signatory: 'Faculty Advisor &bull; Student Technical Council'
    }
  ];

  let activeCategory = 'all';
  let searchQuery = '';
  let activeNotice = null;

  document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initSearch();
    initModal();
    renderCirculars();
  });

  function initFilters() {
    const pills = document.querySelectorAll('#circularCategoryPills .category-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.classList.remove('bg-[var(--color-lime)]', 'text-[#1A1A1A]', 'shadow-xs');
          p.classList.add('bg-[var(--color-card-subtle)]', 'text-[var(--color-muted)]');
        });
        pill.classList.remove('bg-[var(--color-card-subtle)]', 'text-[var(--color-muted)]');
        pill.classList.add('bg-[var(--color-lime)]', 'text-[#1A1A1A]', 'shadow-xs');

        activeCategory = pill.getAttribute('data-category');
        renderCirculars();
      });
    });
  }

  function initSearch() {
    const input = document.getElementById('circularSearchInput');
    const clearBtn = document.getElementById('circularClearSearch');

    input?.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (searchQuery.length > 0) {
        clearBtn?.classList.remove('hidden');
      } else {
        clearBtn?.classList.add('hidden');
      }
      renderCirculars();
    });

    clearBtn?.addEventListener('click', () => {
      if (input) input.value = '';
      searchQuery = '';
      clearBtn.classList.add('hidden');
      renderCirculars();
    });
  }

  function getFilteredCirculars() {
    return CIRCULARS_DATA.filter(item => {
      const matchCat = (activeCategory === 'all') || (item.category === activeCategory);
      const matchSearch = (!searchQuery) ||
        item.title.toLowerCase().includes(searchQuery) ||
        item.ref.toLowerCase().includes(searchQuery) ||
        item.summary.toLowerCase().includes(searchQuery) ||
        item.badge.toLowerCase().includes(searchQuery);
      return matchCat && matchSearch;
    });
  }

  function renderCirculars() {
    const grid = document.getElementById('circularsGrid');
    const emptyState = document.getElementById('circularsEmptyState');
    const badgeCount = document.getElementById('activeNoticeCountBadge');
    if (!grid) return;

    const filtered = getFilteredCirculars();

    if (badgeCount) {
      badgeCount.textContent = `${filtered.length} Notice${filtered.length === 1 ? '' : 's'} Active`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyState?.classList.remove('hidden');
      return;
    }

    emptyState?.classList.add('hidden');

    grid.innerHTML = filtered.map(c => `
      <article class="rounded-[var(--radius-card)] bg-[var(--color-card)] border border-[var(--color-hairline)] p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-sm hover:translate-y-[-2px] transition-all" data-id="${c.id}">
        <div class="flex flex-col gap-3">
          
          <!-- Category & Date Row -->
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${c.urgent ? 'bg-[var(--color-lime)] text-[#1A1A1A]' : 'bg-[var(--color-card-subtle)] text-[var(--color-muted)] border border-[var(--color-hairline)]'}">
              ${c.badge}
            </span>
            <span class="font-mono text-xs text-[var(--color-muted)]">
              ${c.date}
            </span>
          </div>

          <!-- Title -->
          <h2 class="text-base sm:text-lg font-bold text-[var(--color-ink)] leading-snug tracking-tight">
            ${c.title}
          </h2>

          <!-- Summary -->
          <p class="text-xs text-[var(--color-muted)] line-clamp-3 leading-relaxed">
            ${c.summary}
          </p>
        </div>

        <!-- Footer Reference & Actions -->
        <div class="pt-3 border-t border-[var(--color-hairline)] flex items-center justify-between gap-2">
          <span class="font-mono text-[11px] text-[var(--color-muted)] truncate">
            ${c.ref}
          </span>
          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" class="view-notice-btn px-3 py-1.5 rounded-full bg-[var(--color-card-subtle)] hover:bg-[var(--color-canvas)] text-[var(--color-ink)] text-xs font-semibold border border-[var(--color-hairline)] transition cursor-pointer" data-id="${c.id}">
              View
            </button>
            <button type="button" class="download-notice-direct-btn w-8 h-8 rounded-full bg-[var(--color-lime)] text-[#1A1A1A] flex items-center justify-center transition shadow-xs hover:opacity-95 cursor-pointer" data-id="${c.id}" title="Download PDF Memo">
              <span class="material-symbols-outlined text-[16px]">download</span>
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Bind item action buttons
    grid.querySelectorAll('.view-notice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const notice = CIRCULARS_DATA.find(x => x.id === id);
        if (notice) openNoticeModal(notice);
      });
    });

    grid.querySelectorAll('.download-notice-direct-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const notice = CIRCULARS_DATA.find(x => x.id === id);
        if (notice) downloadNoticePdf(notice);
      });
    });
  }

  function initModal() {
    const modal = document.getElementById('circularModal');
    const closeBtn = document.getElementById('closeCircularModal');
    const downloadBtn = document.getElementById('downloadNoticePdfBtn');
    const printBtn = document.getElementById('printNoticeBtn');

    closeBtn?.addEventListener('click', closeNoticeModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeNoticeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
        closeNoticeModal();
      }
    });

    downloadBtn?.addEventListener('click', () => {
      if (activeNotice) downloadNoticePdf(activeNotice);
    });

    printBtn?.addEventListener('click', () => {
      if (activeNotice) {
        showToast('Preparing official memo print layout...');
        window.print();
      }
    });
  }

  function openNoticeModal(notice) {
    activeNotice = notice;
    const modal = document.getElementById('circularModal');
    const catBadge = document.getElementById('modalCategoryBadge');
    const refId = document.getElementById('modalRefId');
    const titleEl = document.getElementById('modalCircularTitle');
    const dateEl = document.getElementById('modalDate');
    const bodyEl = document.getElementById('modalCircularBody');

    if (catBadge) catBadge.textContent = notice.badge.toUpperCase();
    if (refId) refId.textContent = notice.ref;
    if (titleEl) titleEl.textContent = notice.title;
    if (dateEl) dateEl.textContent = `Issued on: ${notice.date}`;

    if (bodyEl) {
      bodyEl.innerHTML = `
        <p class="font-medium text-[var(--color-ink)]">${notice.summary}</p>
        <div class="mt-2 space-y-2">
          ${notice.details.map(d => `<div class="p-2.5 rounded-xl bg-[var(--color-card-subtle)] border border-[var(--color-hairline)] text-xs text-[var(--color-ink)]">${d}</div>`).join('')}
        </div>
        <div class="mt-2 text-xs text-[var(--color-muted)] font-mono">
          Signatory: ${notice.signatory}
        </div>
      `;
    }

    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeNoticeModal() {
    const modal = document.getElementById('circularModal');
    modal?.classList.add('hidden');
    modal?.classList.remove('flex');
    document.body.style.overflow = '';
  }

  function downloadNoticePdf(notice) {
    showToast(`Generating official PDF for ${notice.ref}...`);
    setTimeout(() => {
      const blob = new Blob([
        `SAMSKRUTI COLLEGE OF ENGINEERING & TECHNOLOGY (CODE 259)\n` +
        `OFFICIAL STATE BOARD GAZETTE / CIRCULAR\n` +
        `=======================================================\n` +
        `Reference ID : ${notice.ref}\n` +
        `Category     : ${notice.badge}\n` +
        `Date         : ${notice.date}\n` +
        `Subject      : ${notice.title}\n` +
        `=======================================================\n\n` +
        `${notice.summary}\n\n` +
        `REGULATORY INSTRUCTIONS:\n` +
        notice.details.join('\n') + `\n\n` +
        `ISSUED BY:\n` +
        `${notice.signatory.replace(/&bull;/g, '-')}\n` +
        `SBTET Recognized Autonomous Institution Node 259\n`
      ], { type: 'text/plain' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${notice.ref.replace(/[\/\\:]/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloaded: ${notice.ref}`);
    }, 600);
  }

  window.resetCircularFilters = function() {
    activeCategory = 'all';
    searchQuery = '';
    const input = document.getElementById('circularSearchInput');
    const clearBtn = document.getElementById('circularClearSearch');
    if (input) input.value = '';
    clearBtn?.classList.add('hidden');

    const pills = document.querySelectorAll('#circularCategoryPills .category-pill');
    pills.forEach((p, idx) => {
      if (idx === 0) {
        p.classList.remove('bg-[var(--color-card-subtle)]', 'text-[var(--color-muted)]');
        p.classList.add('bg-[var(--color-lime)]', 'text-[#1A1A1A]', 'shadow-xs');
      } else {
        p.classList.remove('bg-[var(--color-lime)]', 'text-[#1A1A1A]', 'shadow-xs');
        p.classList.add('bg-[var(--color-card-subtle)]', 'text-[var(--color-muted)]');
      }
    });

    renderCirculars();
  };

  function showToast(msg) {
    const toast = document.getElementById('circularToast');
    const text = document.getElementById('circularToastMsg');
    if (!toast || !text) return;
    text.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(window._circToastTimeout);
    window._circToastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

})();
