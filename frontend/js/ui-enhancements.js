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

  // 6. Universal Modal & Drawer Dismiss Engine
  function dismissModalElement(modal) {
    if (!modal || modal.tagName === 'BUTTON' || modal.tagName === 'A') return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (modal.style.display === 'flex' || modal.style.display === 'block') {
      modal.style.display = '';
    }
    document.body.style.overflow = '';

    // Invoke screen callbacks if defined
    if (modal.id === 'studentDetailDrawerBackdrop' && typeof window.closeStudentDrawer === 'function') {
      try { window.closeStudentDrawer(); } catch (_) {}
    } else if (modal.id === 'reviewModal' && typeof window.closeReviewModal === 'function') {
      try { window.closeReviewModal(); } catch (_) {}
    } else if (modal.id === 'auditModal' && typeof window.hideAuditModal === 'function') {
      try { window.hideAuditModal(); } catch (_) {}
    } else if (modal.id === 'circularModal' && typeof window.closeNoticeModal === 'function') {
      try { window.closeNoticeModal(); } catch (_) {}
    }
  }

  function closeAllModalsAndDrawers() {
    const selector = 'div.fixed.inset-0:not(.hidden), div[role="dialog"]:not(.hidden), #studentDetailDrawerBackdrop:not(.hidden), div[id$="Modal"]:not(.hidden), div[id$="Drawer"]:not(.hidden)';
    const openModals = document.querySelectorAll(selector);
    openModals.forEach(modal => {
      // Ignore non-modal overlays like toasts or dynamic islands
      if (modal.classList.contains('pointer-events-none') || 
          modal.id === 'toastNotification' || 
          modal.id === 'toast' || 
          modal.id === 'ccAppHeader') {
        return;
      }
      dismissModalElement(modal);
    });

    // Close profile dropdown menu if open
    const profileDropdown = document.getElementById('ccProfileDropdown');
    if (profileDropdown && profileDropdown.classList.contains('is-open')) {
      profileDropdown.classList.remove('is-open');
      document.getElementById('ccProfileBtn')?.setAttribute('aria-expanded', 'false');
    }
  }

  // Expose global dismiss helper
  window.closeAllModalsAndDrawers = closeAllModalsAndDrawers;
  window.dismissModalElement = dismissModalElement;

  function initUniversalCloseButtons() {
    // 1. Delegated click on document for any close/cancel/dismiss button
    document.addEventListener('click', (e) => {
      // Fast check: target or ancestor matches close button selectors
      const closeTrigger = e.target.closest(`
        [data-close],
        [data-close-modal],
        [data-dismiss],
        [aria-label="Close"],
        [aria-label="close"],
        .close-btn,
        .close-modal-btn,
        .modal-close,
        .btn-close,
        .close-skills-btn,
        .close-invite-btn,
        .close-invites-modal-btn,
        .close-detail-btn,
        .close-msg-btn,
        .btn-close-modal,
        #closeDrawerBtn,
        #closeBacklogModal,
        #modalCloseActionBtn,
        #closeAzureSyncModal,
        #closeReviewModal,
        #closeReviewModalBtn,
        #closeDeptModal,
        #dismissDeptModalBtn,
        #closeCircularModal,
        #closeModal,
        #cancelModal,
        #closeContactModal,
        #cancelContactModal,
        #closePassModal,
        #cancelPassModal,
        #btnCancelSell,
        #btnDismissDetailModal,
        #btnCancelAction
      `);

      let targetBtn = closeTrigger;

      // Also detect button with 'close' icon or cancel text inside an open modal
      if (!targetBtn) {
        const btn = e.target.closest('button, [role="button"], a.btn-close');
        if (btn) {
          const txt = btn.textContent.trim().toLowerCase();
          const iconText = btn.querySelector('.material-symbols-outlined, i')?.textContent.trim().toLowerCase();
          const isCloseAction = txt === 'close' || txt === 'cancel' || txt === 'dismiss' || iconText === 'close' || iconText === 'cancel';
          if (isCloseAction) {
            const inModal = btn.parentElement?.closest('.fixed.inset-0, [role="dialog"], #studentDetailDrawerBackdrop, #backlogPopupModal, #azureSyncProgressModal, #reviewModal, #auditModal, #circularModal, #deptDetailModal, #editSkillsModal, #inviteProjectModal, #collaborationInvitesModal, #sellItemModal, #itemDetailModal, #messageSellerModal, #editContactModal, #changePassModal, #modalRecounting, #feePaymentModal, #reviewApprovalModal');
            if (inModal && inModal.id !== 'toastNotification' && inModal.id !== 'toast') {
              targetBtn = btn;
            }
          }
        }
      }

      if (targetBtn) {
        // Find nearest modal or drawer container (ancestor container, never the button itself)
        const modal = targetBtn.parentElement?.closest('.fixed.inset-0, [role="dialog"], #studentDetailDrawerBackdrop, #backlogPopupModal, #azureSyncProgressModal, #reviewModal, #auditModal, #circularModal, #deptDetailModal, #editSkillsModal, #inviteProjectModal, #collaborationInvitesModal, #sellItemModal, #itemDetailModal, #messageSellerModal, #editContactModal, #changePassModal, #modalRecounting, #feePaymentModal, #reviewApprovalModal');
        if (modal && modal !== targetBtn && modal.id !== 'toastNotification' && modal.id !== 'toast') {
          e.preventDefault();
          e.stopPropagation();
          dismissModalElement(modal);
          return;
        }
      }

      // 2. Backdrop click: click outside the modal dialog card
      const openModals = document.querySelectorAll('div.fixed.inset-0:not(.hidden), div[role="dialog"]:not(.hidden), #studentDetailDrawerBackdrop:not(.hidden)');
      openModals.forEach(modal => {
        if (modal.classList.contains('pointer-events-none') || modal.id === 'toastNotification' || modal.id === 'toast') return;
        
        // Find inner card / content box
        const card = modal.querySelector('.bento-card, .bg-surface-container, .bg-surface-container-low, .rounded-3xl, .rounded-2xl, [role="document"], #circularModalCard, #deptModalCard, #studentDetailDrawer, #reviewModalCard, #auditModalCard');
        if (card) {
          // If clicked directly on the modal backdrop outside the card
          if (modal.contains(e.target) && !card.contains(e.target)) {
            dismissModalElement(modal);
          }
        } else if (e.target === modal) {
          dismissModalElement(modal);
        }
      });
    });

    // 3. Global Escape key handling
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        closeAllModalsAndDrawers();
      }
    });
  }

  // 7. Global Helper for Real-Time Arrival Pulses
  window.triggerArrivalPulse = function (element) {
    if (!element) return;
    element.classList.remove('pulse-arrival');
    void element.offsetWidth; // Force reflow
    element.classList.add('pulse-arrival');
  };

  // 8. Initialize on DOMContentLoaded and dynamic content ready
  function initAll() {
    initCardSpotlights();
    initAnimatedCounters();
    initBubbleAnimations();
    initCtaArrows();
    initSlidingTabs();
    initUniversalCloseButtons();
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
