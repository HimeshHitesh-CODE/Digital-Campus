/**
 * Samskruti Digital Campus (Institution Code: 259)
 * UNIFIED 60FPS UI ENHANCEMENT & INTERACTION ENGINE — V4.0
 * 
 * Provides cursor-tracking spotlight, animated counters, smooth sliding tabs,
 * and real-time arrival pulses across all student and HOD portal screens.
 */

(function () {
  'use strict';

  // 1. Interactive Radial Cursor Spotlight on Cards
  function initCardSpotlights() {
    const cards = document.querySelectorAll('.bento-card, .executive-card, .hod-stat-card, .feature-card-dark');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      }, { passive: true });
    });
  }

  // 2. Easing & Animated Number Counters
  function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
  }

  function animateCounter(el, targetVal, duration, decimals, suffix) {
    if (el._hasAnimatedCounter) return;
    el._hasAnimatedCounter = true;
    decimals = decimals !== undefined ? decimals : 0;
    suffix = suffix || '';
    const startVal = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const current = startVal + (targetVal - startVal) * easeOutQuart(progress);
      el.textContent = current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = targetVal.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function initAnimatedCounters() {
    // Look for explicit data-counter-target
    const statElements = document.querySelectorAll('[data-counter-target]');
    statElements.forEach(el => {
      const target = parseFloat(el.getAttribute('data-counter-target'));
      const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
      const suffix = el.getAttribute('data-counter-suffix') || '';
      if (!isNaN(target)) {
        animateCounter(el, target, 800, decimals, suffix);
      }
    });

    // Auto-detect KPI & metric IDs across all pages
    const knownMetricIds = [
      'homeAttendanceVal', 'homeCgpaVal', 'statPresentDays', 'statAbsentDays',
      'statRemainingDays', 'statTotalDays', 'activeStudentsCount', 'kpiTotalStudents',
      'kpiAttendanceAvg', 'totalStudentsKpi', 'attendanceAverageKpi', 'backlogsCountKpi',
      'vennPresentVal', 'vennAbsentVal', 'vennRemainingVal', 'legendPresent',
      'legendAbsent', 'legendRemaining', 'totalRegisteredKpi'
    ];

    knownMetricIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el._hasAnimatedCounter) {
        const text = el.textContent.trim();
        const match = text.match(/^([0-9]+(?:\.[0-9]+)?)(.*)$/);
        if (match) {
          const num = parseFloat(match[1]);
          const suffix = match[2] || '';
          const decimals = match[1].includes('.') ? match[1].split('.')[1].length : 0;
          if (!isNaN(num) && num > 0) {
            animateCounter(el, num, 750, decimals, suffix);
          }
        }
      }
    });
  }

  // 3. Smooth Overlapping Attendance Venn Bubbles & Chart Enhancements
  function initBubbleAnimations() {
    const circles = document.querySelectorAll('#homeVennSvg circle, .venn-bubble');
    circles.forEach((circle, i) => {
      circle.style.opacity = '0';
      circle.style.transform = 'scale(0.85)';
      circle.style.transformOrigin = 'center';
      circle.style.transformBox = 'fill-box';
      circle.style.transition = 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => {
        circle.style.opacity = '1';
        circle.style.transform = 'scale(1)';
      }, 100 + i * 80);
    });
  }

  // 4. CTA Arrow Auto-Tagging
  function initCtaArrows() {
    const arrows = document.querySelectorAll('button span.material-symbols-outlined, a span.material-symbols-outlined');
    arrows.forEach(span => {
      const text = span.textContent.trim();
      if (text === 'arrow_forward' || text === 'east' || text === 'arrow_right_alt') {
        span.classList.add('cta-arrow');
      }
    });
  }

  // 5. Smooth Sliding Segmented Control / Tabs
  function initSlidingTabs() {
    const tabContainers = document.querySelectorAll('.sem-tabs-container, #semTabsContainer, .thread-filter-tabs');
    tabContainers.forEach(container => {
      const buttons = container.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => {
            b.classList.remove('active-tab', 'bg-[var(--color-card)]', 'bg-[var(--color-lime)]');
            b.classList.remove('text-[var(--color-ink)]', 'text-[var(--color-lime-ink)]');
          });
          btn.classList.add('active-tab');
        });
      });
    });
  }

  // 6. Global Helper for Real-Time Arrival Pulses
  window.triggerArrivalPulse = function (element) {
    if (!element) return;
    element.classList.remove('pulse-arrival');
    void element.offsetWidth; // Force reflow
    element.classList.add('pulse-arrival');
  };

  // 7. Initialize on DOMContentLoaded and dynamic content ready
  function initAll() {
    initCardSpotlights();
    initAnimatedCounters();
    initBubbleAnimations();
    initCtaArrows();
    initSlidingTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Delayed sweep for async hydrated metrics
  setTimeout(() => {
    initAnimatedCounters();
    initCtaArrows();
  }, 600);

  // Re-observe dynamic cards
  const observer = new MutationObserver((mutations) => {
    let hasNewCards = false;
    mutations.forEach(m => {
      if (m.addedNodes.length > 0) hasNewCards = true;
    });
    if (hasNewCards) {
      initCardSpotlights();
      initCtaArrows();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

})();
