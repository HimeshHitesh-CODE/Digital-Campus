/**
 * Digital Campus Neumorphic Toast & Alert Utility
 */

class AlertManager {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'dc-toast-container';
      Object.assign(this.container.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
      });
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = 'neu-card';
    
    let accentColor = 'var(--accent-primary)';
    if (type === 'success') accentColor = 'var(--accent-success)';
    if (type === 'warning') accentColor = 'var(--accent-warning)';
    if (type === 'danger') accentColor = 'var(--accent-danger)';

    Object.assign(toast.style, {
      minWidth: '280px',
      maxWidth: '400px',
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: 'var(--text-main)',
      borderLeft: `4px solid ${accentColor}`,
      boxShadow: 'var(--shadow-raised)',
      pointerEvents: 'auto',
      opacity: '0',
      transform: 'translateY(-12px)',
      transition: 'var(--transition-bounce)',
    });

    toast.textContent = message;
    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Animate out
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(msg) { this.show(msg, 'success'); }
  warning(msg) { this.show(msg, 'warning'); }
  danger(msg) { this.show(msg, 'danger'); }
  info(msg) { this.show(msg, 'info'); }
}

export const alerts = new AlertManager();
