import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

const user = requireAuth(['STUDENT']);
renderDock('/frontend/screens/02-student-portal/surplus-market.html', 'STUDENT');

document.addEventListener('DOMContentLoaded', () => {
  setupReserveButtons();
  setupListModal();
});

function setupReserveButtons() {
  document.querySelectorAll('.reserve-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.item-card');
      const title = card.querySelector('.item-title').textContent;

      alerts.success(`Campus meeting request sent to seller for "${title}". Check your notifications for meet details.`);
      btn.textContent = 'Handover Requested ✓';
      btn.disabled = true;
      btn.classList.remove('neu-btn-primary');
    });
  });
}

function setupListModal() {
  document.getElementById('list-item-btn')?.addEventListener('click', () => {
    alerts.info('Opening new surplus listing form...');
  });
}
