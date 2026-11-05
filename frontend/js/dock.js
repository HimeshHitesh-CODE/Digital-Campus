/**
 * Samskruti Digital Campus — Shell Compatibility Adapter
 * Delegates shell rendering to dc-dynamic-island.js
 */

export function renderDock(activeFileName = '', explicitRole = null) {
  if (typeof window.dcSetupDynamicIsland === 'function') {
    window.dcSetupDynamicIsland();
  }
  if (typeof window.dcSyncProfile === 'function') {
    window.dcSyncProfile();
  }
}

export function renderTopCapsule(activeFileName = '') {
  renderDock(activeFileName, 'STUDENT');
}

export function renderHODCapsule(activeFileName = '') {
  renderDock(activeFileName, 'HOD');
}

export function updateMorphPill() {}
