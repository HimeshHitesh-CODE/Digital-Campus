/**
 * Student Profile & Security Management Controller
 * Dynamically binds active session records and manages editable contact info.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { alerts } from '../../js/alerts.js';

// Verify student authentication safely
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN']);

document.addEventListener('DOMContentLoaded', () => {
  populateStudentProfile();
  setupEditContactModal();

  if (typeof window.dcSyncProfile === 'function') {
    window.dcSyncProfile();
  }
});

function getActiveStudentInfo() {
  const sessionUser = (typeof window.dcGetActiveUser === 'function' ? window.dcGetActiveUser() : null)
    || api.getUser() 
    || JSON.parse(localStorage.getItem('dc_user') || localStorage.getItem('smsk_user') || '{}');

  const pin = (sessionUser.pin || sessionUser.sbtetPin || sessionUser.rollNumber || localStorage.getItem('student_pin') || '24259-CS-040').trim().toUpperCase();
  const name = sessionUser.name || localStorage.getItem('user_name') || 'Tallapalli Tulasi Ram Goud';

  // Branch mapping
  let branch = sessionUser.department || 'Computer Science & Engineering (CS)';
  if (pin.includes('-AI-') || pin.includes('-AIML-')) branch = 'Artificial Intelligence & Machine Learning (AIML)';
  else if (pin.includes('-CS-')) branch = 'Computer Science & Engineering (CS)';
  else if (pin.includes('-EC-')) branch = 'Electronics & Communication (EC)';
  else if (pin.includes('-EE-')) branch = 'Electrical & Electronics (EE)';
  else if (pin.includes('-M-')) branch = 'Mechanical Engineering (MECH)';
  else if (pin.includes('-CIV-')) branch = 'Civil Engineering (CIV)';

  const semText = 'Semester V (3rd Year • 5th Sem)';
  const savedContact = JSON.parse(localStorage.getItem(`contact_${pin}`) || '{}');

  return {
    pin,
    name,
    branch,
    email: sessionUser.email || `${pin.toLowerCase()}@samskruti.ac.in`,
    scheme: sessionUser.scheme || 'SBTET C-24',
    semester: semText,
    batch: sessionUser.batch || '2024 - 2027',
    mobile: savedContact.mobile || sessionUser.phone || '+91 98765 43239',
    parentMobile: savedContact.parentMobile || '+91 98765 43299',
  };
}

function populateStudentProfile() {
  const student = getActiveStudentInfo();
  const clean = student.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const initials = words.length >= 2 
    ? `${words[0][0]}${words[1][0]}`.toUpperCase() 
    : clean.substring(0, 2).toUpperCase();

  // Header banner elements
  const avatarElem = document.getElementById('profile-avatar');
  const nameElem = document.getElementById('profile-student-name');
  const deptSub = document.getElementById('profile-dept-sub');
  const badgePin = document.getElementById('profile-badge-pin');
  const badgeScheme = document.getElementById('profile-badge-scheme');

  if (avatarElem) avatarElem.textContent = initials;
  if (nameElem) nameElem.textContent = student.name;
  if (deptSub) deptSub.textContent = `${student.branch} • Samskruti College (259)`;
  if (badgePin) badgePin.textContent = student.pin;
  if (badgeScheme) badgeScheme.textContent = student.scheme;

  // Academic Details (Locked)
  const profScheme = document.getElementById('prof-scheme');
  const profBranch = document.getElementById('prof-branch');
  const profPin = document.getElementById('prof-pin');
  const profSemester = document.getElementById('prof-semester');
  const profBatch = document.getElementById('prof-batch');

  if (profScheme) profScheme.textContent = student.scheme;
  if (profBranch) profBranch.textContent = student.branch;
  if (profPin) profPin.textContent = student.pin;
  if (profSemester) profSemester.textContent = student.semester;
  if (profBatch) profBatch.textContent = student.batch;

  // Contact Details
  const profEmail = document.getElementById('prof-email');
  const profMobile = document.getElementById('prof-mobile');
  const profParentMobile = document.getElementById('prof-parent-mobile');

  if (profEmail) profEmail.textContent = student.email;
  if (profMobile) profMobile.textContent = student.mobile;
  if (profParentMobile) profParentMobile.textContent = student.parentMobile;
}

/**
 * Handle Contact Information Edit Modal
 */
function setupEditContactModal() {
  const modal = document.getElementById('edit-contact-modal');
  const openBtn = document.getElementById('open-edit-contact-btn');
  const triggerBtn = document.getElementById('edit-contact-trigger-btn');
  const closeBtn = document.getElementById('close-contact-modal');
  const cancelBtn = document.getElementById('cancel-contact-modal');
  const form = document.getElementById('edit-contact-form');

  const studentMobileInput = document.getElementById('edit-student-mobile');
  const parentMobileInput = document.getElementById('edit-parent-mobile');

  const openModal = () => {
    const student = getActiveStudentInfo();
    if (studentMobileInput) studentMobileInput.value = student.mobile;
    if (parentMobileInput) parentMobileInput.value = student.parentMobile;
    modal.style.display = 'flex';
  };

  const closeModal = () => { modal.style.display = 'none'; };

  openBtn?.addEventListener('click', openModal);
  triggerBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const newMobile = studentMobileInput.value.trim();
    const newParentMobile = parentMobileInput.value.trim();

    if (!newMobile || !newParentMobile) {
      alerts.error('Invalid Contact', 'Please provide valid phone numbers.');
      return;
    }

    const student = getActiveStudentInfo();
    const contactData = { mobile: newMobile, parentMobile: newParentMobile };
    localStorage.setItem(`contact_${student.pin}`, JSON.stringify(contactData));

    populateStudentProfile();
    closeModal();
    alerts.success('Contact Saved', 'Your registered contact details have been updated.');
  });
}
