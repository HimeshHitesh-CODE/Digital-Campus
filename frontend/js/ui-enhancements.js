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
    // Look for KPI metrics to smoothly count up
    const statElements = document.querySelectorAll('[data-counter-target]');
    statElements.forEach(el => {
      const target = parseFloat(el.getAttribute('data-counter-target'));
      const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
      const suffix = el.getAttribute('data-counter-suffix') || '';
      if (!isNaN(target)) {
        animateCounter(el, target, 800, decimals, suffix);
      }
    });
  }

  // 3. Smooth Sliding Segmented Control / Tabs
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

  // 4. Global Helper for Real-Time Arrival Pulses
  window.triggerArrivalPulse = function (element) {
    if (!element) return;
    element.classList.remove('pulse-arrival');
    void element.offsetWidth; // Force reflow
    element.classList.add('pulse-arrival');
  };

  // 5. Initialize on DOMContentLoaded and dynamic content ready
  function initAll() {
    initCardSpotlights();
    initAnimatedCounters();
    initSlidingTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-observe dynamic cards
  const observer = new MutationObserver((mutations) => {
    let hasNewCards = false;
    mutations.forEach(m => {
      if (m.addedNodes.length > 0) hasNewCards = true;
    });
    if (hasNewCards) {
      initCardSpotlights();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

})();
