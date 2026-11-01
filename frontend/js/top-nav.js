/**
 * Campus Connect - Universal Top Capsule Navigation Controller
 * Bridges legacy screen scripts to dc-dynamic-island.js engine
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.dcInitDynamicIsland === 'function') {
    window.dcInitDynamicIsland();
  } else if (typeof window.dcSetupDynamicIsland === 'function') {
    window.dcSetupDynamicIsland();
  }

  if (typeof window.dcSyncProfile === 'function') {
    window.dcSyncProfile();
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
});
