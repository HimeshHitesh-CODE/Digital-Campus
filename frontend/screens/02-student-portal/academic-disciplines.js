/**
 * Samskruti Digital Campus (Institution Code: 259)
 * Academic Disciplines & Engineering Faculties Controller
 */

(function () {
  'use strict';

  const DEPARTMENTS = [
    {
      id: 'cse',
      code: 'DEPT 05 • SCHEME C-24',
      name: 'Computer Science & Engineering',
      icon: 'computer',
      desc: 'Core algorithms, software architecture, full-stack systems, compiler design, and cloud containerization.',
      intake: '180 Seats',
      hod: 'Dr. J. Vamshi Krishna (PIN: VAMSHI-CS-HOD)',
      location: 'Block A, 3rd Floor',
      labs: [
        'Advanced Linux & Systems Programming Lab (80 Terminals)',
        'Cloud Computing & Microservices Testing Rig',
        'Database Systems & Big Data Laboratory'
      ],
      curriculum: [
        'Data Structures & Algorithms in C/C++',
        'Database Management Systems & SQL Optimizations',
        'Computer Networks & Protocols',
        'Full Stack Web Applications with Node & Python'
      ]
    },
    {
      id: 'aiml',
      code: 'DEPT 66 • SCHEME C-24',
      name: 'Artificial Intelligence & Machine Learning',
      icon: 'psychology',
      desc: 'Deep neural networks, computer vision, natural language processing, predictive modeling, and GPU accelerated edge inference.',
      intake: '120 Seats',
      hod: 'Prof. Padma (PIN: AIML-HOD)',
      location: 'Block B, 2nd Floor',
      labs: [
        'NVIDIA GPU Compute Cluster Workstations (Lab 4)',
        'Robotics & Computer Vision Prototyping Bay',
        'Natural Language Processing & Data Analytics Cell'
      ],
      curriculum: [
        'Applied Linear Algebra & Statistical Machine Learning',
        'Deep Neural Networks with PyTorch & TensorFlow',
        'Computer Vision & Object Detection Pipelines',
        'Reinforcement Learning & Autonomous Agents'
      ]
    },
    {
      id: 'ece',
      code: 'DEPT 04 • SCHEME C-24',
      name: 'Electronics & Communication Engineering',
      icon: 'memory',
      desc: 'VLSI circuit design, digital signal processing, embedded microcontrollers, IoT sensor arrays, and RF communications.',
      intake: '60 Seats',
      hod: 'Prof. S. R. Rao',
      location: 'Block C, 1st Floor',
      labs: [
        'Embedded Systems & ARM Cortex-M4 Microcontroller Lab',
        'VLSI Design & Cadence Synthesis Suites',
        'Microwave & Optical Fiber Communications Center'
      ],
      curriculum: [
        'Analog & Digital Electronic Circuits',
        'Microprocessors & Microcontroller Architectures',
        'Digital Signal Processing Fundamentals',
        'Internet of Things (IoT) Embedded Systems'
      ]
    },
    {
      id: 'mech',
      code: 'DEPT 03 • SCHEME C-24',
      name: 'Mechanical Engineering',
      icon: 'precision_manufacturing',
      desc: 'Thermal engineering, computer-aided manufacturing, robotics kinematics, fluid dynamics, and finite element modeling.',
      intake: '60 Seats',
      hod: 'Dr. P. Mallikarjun',
      location: 'Mechanical Workshop Block',
      labs: [
        'CNC Lathe & Precision Milling Automation Bay',
        'CAD/CAM Simulation & SolidWorks Modeling Studio',
        'Fluid Mechanics & Hydraulic Machinery Lab'
      ],
      curriculum: [
        'Engineering Mechanics & Strength of Materials',
        'Thermal Power Engineering & Thermodynamics',
        'Manufacturing Technology & CNC Programming',
        'Machine Design & Mechatronics'
      ]
    },
    {
      id: 'civil',
      code: 'DEPT 01 • SCHEME C-24',
      name: 'Civil Engineering',
      icon: 'architecture',
      desc: 'Structural engineering, surveying with total stations, geotechnical soil mechanics, and sustainable urban infrastructure.',
      intake: '60 Seats',
      hod: 'Prof. K. Venkatesh',
      location: 'Civil Engineering Block',
      labs: [
        'Advanced Structural Concrete & Materials Testing Lab',
        'Total Station Geomatic Surveying Equipment Station',
        'Geotechnical Engineering & Soil Mechanics Lab'
      ],
      curriculum: [
        'Surveying & Levelling with GIS Mapping',
        'Strength of Materials & Structural Analysis',
        'Concrete Technology & Reinforced Concrete Design',
        'Hydraulics & Water Resources Management'
      ]
    }
  ];

  let activeDept = 'all';
  let searchQuery = '';

  document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initSearch();
    initModal();
    renderDisciplines();
  });

  function initFilters() {
    const pills = document.querySelectorAll('#deptFilterPills .dept-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.classList.remove('bg-[var(--color-lime)]', 'text-[#1A1A1A]', 'shadow-xs');
          p.classList.add('bg-[var(--color-card-subtle)]', 'text-[var(--color-muted)]');
        });
        pill.classList.remove('bg-[var(--color-card-subtle)]', 'text-[var(--color-muted)]');
        pill.classList.add('bg-[var(--color-lime)]', 'text-[#1A1A1A]', 'shadow-xs');

        activeDept = pill.getAttribute('data-dept');
        renderDisciplines();
      });
    });
  }

  function initSearch() {
    const input = document.getElementById('deptSearchInput');
    input?.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderDisciplines();
    });
  }

  function renderDisciplines() {
    const grid = document.getElementById('disciplinesGrid');
    if (!grid) return;

    const filtered = DEPARTMENTS.filter(d => {
      const matchFilter = (activeDept === 'all') || (d.id === activeDept);
      const matchSearch = (!searchQuery) ||
        d.name.toLowerCase().includes(searchQuery) ||
        d.desc.toLowerCase().includes(searchQuery) ||
        d.code.toLowerCase().includes(searchQuery) ||
        d.labs.some(l => l.toLowerCase().includes(searchQuery));
      return matchFilter && matchSearch;
    });

    grid.innerHTML = filtered.map(d => `
      <article class="rounded-[var(--radius-card)] bg-[var(--color-card)] border border-[var(--color-hairline)] p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-sm hover:translate-y-[-2px] transition-all">
        <div class="flex flex-col gap-3">
          
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-card-subtle)] text-[var(--color-muted)] border border-[var(--color-hairline)]">
              ${d.code}
            </span>
            <div class="w-8 h-8 rounded-full bg-[var(--color-lime)] text-[#1A1A1A] flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[18px]">${d.icon}</span>
            </div>
          </div>

          <h2 class="text-lg font-bold text-[var(--color-ink)] leading-snug tracking-tight">
            ${d.name}
          </h2>

          <p class="text-xs text-[var(--color-muted)] line-clamp-3 leading-relaxed">
            ${d.desc}
          </p>

          <div class="p-3 rounded-xl bg-[var(--color-card-subtle)] border border-[var(--color-hairline)] flex flex-col gap-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-muted)]">Sanctioned Intake</span>
              <span class="font-mono font-bold text-[var(--color-ink)]">${d.intake}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[var(--color-muted)]">Faculty Head</span>
              <span class="font-semibold text-[var(--color-ink)] truncate max-w-[170px]">${d.hod.split('(')[0]}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-[var(--color-hairline)] flex items-center justify-between">
          <span class="font-mono text-[11px] text-[var(--color-muted)]">
            ${d.location}
          </span>
          <button type="button" class="view-dept-btn px-3.5 py-1.5 rounded-full bg-[var(--color-lime)] text-[#1A1A1A] text-xs font-semibold hover:opacity-95 transition shadow-xs cursor-pointer" data-id="${d.id}">
            View Syllabus &amp; Labs
          </button>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.view-dept-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const dept = DEPARTMENTS.find(x => x.id === id);
        if (dept) openDeptModal(dept);
      });
    });
  }

  function initModal() {
    const modal = document.getElementById('deptDetailModal');
    const closeBtn = document.getElementById('closeDeptModal');
    const dismissBtn = document.getElementById('dismissDeptModalBtn');

    function closeModal() {
      modal?.classList.add('hidden');
      modal?.classList.remove('flex');
      document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closeModal);
    dismissBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal?.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  function openDeptModal(dept) {
    const modal = document.getElementById('deptDetailModal');
    const codeEl = document.getElementById('modalDeptCode');
    const intakeEl = document.getElementById('modalDeptIntake');
    const titleEl = document.getElementById('modalDeptTitle');
    const hodEl = document.getElementById('modalDeptHod');
    const contentEl = document.getElementById('modalDeptContent');

    if (codeEl) codeEl.textContent = dept.code;
    if (intakeEl) intakeEl.textContent = `${dept.intake} Approved`;
    if (titleEl) titleEl.textContent = dept.name;
    if (hodEl) hodEl.textContent = `HOD: ${dept.hod}`;

    if (contentEl) {
      contentEl.innerHTML = `
        <div class="space-y-1.5">
          <span class="font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-semibold">Specialization Focus</span>
          <p class="text-xs text-[var(--color-ink)] leading-relaxed">${dept.desc}</p>
        </div>

        <div class="space-y-2 pt-2 border-t border-[var(--color-hairline)]">
          <span class="font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-semibold">Department Laboratory Infrastructure</span>
          <div class="space-y-1.5">
            ${dept.labs.map(l => `
              <div class="p-2.5 rounded-xl bg-[var(--color-card-subtle)] border border-[var(--color-hairline)] flex items-center gap-2">
                <span class="material-symbols-outlined text-[16px] text-[var(--color-lime-ink)] bg-[var(--color-lime)] p-0.5 rounded">science</span>
                <span class="text-xs text-[var(--color-ink)] font-medium">${l}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-[var(--color-hairline)]">
          <span class="font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-semibold">SBTET Curriculum Scheme Core Courses</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${dept.curriculum.map(c => `
              <div class="p-2.5 rounded-xl bg-[var(--color-card-subtle)] border border-[var(--color-hairline)] text-xs text-[var(--color-ink)]">
                &bull; ${c}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    modal?.classList.remove('hidden');
    modal?.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

})();
