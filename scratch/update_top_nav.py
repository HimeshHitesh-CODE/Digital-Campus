with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/css/top-nav.css', 'r', encoding='utf-8') as f:
    top_nav = f.read()

header_styles = """
/* ================================================================
   GLOBAL FIXED HEADER & PROFILE DROPDOWN SPECIFICATION
   ================================================================ */
.app-global-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  z-index: 1000;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background-color 0.25s ease, border-color 0.25s ease, backdrop-filter 0.25s ease, box-shadow 0.25s ease;
  pointer-events: none;
}

.app-global-header.is-scrolled {
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(81, 53, 90, 0.12);
  box-shadow: 0 4px 20px rgba(42, 12, 78, 0.05);
}

[data-theme="dark"] .app-global-header.is-scrolled {
  background: rgba(20, 5, 38, 0.92);
  border-bottom: 1px solid rgba(255, 207, 153, 0.14);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.65);
}

.app-global-header-inner {
  max-width: 1240px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 clamp(16px, 3.5vw, 28px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

/* Brand Identity */
.header-brand-meta {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.25;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.header-brand-meta:hover {
  opacity: 0.85;
}

.header-brand-title {
  font-family: 'Newsreader', 'Darker Grotesque', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: #047857;
  letter-spacing: -0.02em;
}

[data-theme="dark"] .header-brand-title {
  color: #34d399;
}

.header-brand-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.76rem;
  font-weight: 600;
  color: #526259;
  letter-spacing: 0.01em;
  margin-top: 2px;
}

/* Header Right Actions */
.header-right-actions {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.theme-switch-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(16, 185, 129, 0.20);
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(14px);
  color: #047857;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-switch-btn:hover {
  border-color: #047857;
  transform: scale(1.05);
}

.header-divider-v {
  width: 1px;
  height: 24px;
  background: rgba(16, 185, 129, 0.16);
  margin: 0 4px;
}

.profile-badge-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 14px 4px 6px;
  border-radius: 9999px;
  border: 1px solid rgba(16, 185, 129, 0.20);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  color: #191c1a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-badge-btn:hover {
  border-color: #047857;
  box-shadow: 0 4px 16px rgba(4, 120, 87, 0.15);
}

.profile-badge-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #047857;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-theme="dark"] .profile-badge-avatar {
  background: #34d399;
  color: #064e3b;
}

.profile-badge-name-preview {
  font-family: 'Darker Grotesque', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  color: #191c1a;
}

.profile-badge-chevron {
  width: 14px;
  height: 14px;
  color: #526259;
}

/* Profile Dropdown Card */
.profile-dropdown-card {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 270px;
  background: #ffffff;
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid rgba(16, 185, 129, 0.20);
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(4, 120, 87, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04);
  padding: 16px;
  box-sizing: border-box;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px) scale(0.96);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10050;
  pointer-events: none;
}

.profile-dropdown-card.is-open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dropdown-user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
}

.dropdown-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #047857;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-user-name {
  font-family: 'Darker Grotesque', sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  color: #191c1a;
  line-height: 1.1;
}

.dropdown-user-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: #526259;
  margin-top: 2px;
}

.dropdown-divider-v {
  width: 100%;
  height: 1px;
  background: rgba(16, 185, 129, 0.12);
  margin: 10px 0;
}

.dropdown-menu-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  color: #191c1a !important;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  transition: all 0.15s ease;
}

.dropdown-menu-item:hover {
  background: rgba(16, 185, 129, 0.10) !important;
  color: #047857 !important;
}

.dropdown-menu-item i,
.dropdown-menu-item svg {
  width: 18px;
  height: 18px;
  color: #047857 !important;
}

.dropdown-theme-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #191c1a;
}

.dropdown-theme-row .row-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-theme-row .row-label i,
.dropdown-theme-row .row-label svg {
  width: 18px;
  height: 18px;
  color: #047857;
}

.dropdown-menu-item.logout-item {
  color: #b91c1c !important;
}

.dropdown-menu-item.logout-item i,
.dropdown-menu-item.logout-item svg {
  color: #b91c1c !important;
}

.dropdown-menu-item.logout-item:hover {
  background: rgba(185, 28, 28, 0.10) !important;
}

/* Switch control */
.switch-control {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 22px;
}

.switch-control input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #d1d5db;
  border-radius: 34px;
  transition: 0.3s;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

input:checked + .switch-slider {
  background-color: #047857;
}

input:checked + .switch-slider:before {
  transform: translateX(16px);
}
"""

with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/css/top-nav.css', 'w', encoding='utf-8') as f:
    f.write(top_nav + "\n" + header_styles)

print("Updated top-nav.css with self-contained header and dropdown styles!")
