/**
 * Samskruti Marketplace & Campus Exchange Controller
 * Handles item discovery, gallery & camera photo capture with canvas compression, and real-time buyer-seller chat.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';

// Verify student/HOD authentication
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY']) || {
  name: 'Student User',
  rollNumber: '24259-CS-025',
  sbtetPin: '24259-CS-025',
  department: 'Computer Science & Engineering',
};

// Render Left Dock Navigation
const isHODRole = user?.role === 'HOD' || user?.role === 'HOD_CS' || user?.role === 'ADMIN';
renderDock('marketplace.html', isHODRole ? 'HOD' : 'STUDENT');

// State
let allItems = [];
let activeCategory = 'ALL';
let activeSearchQuery = '';
let currentChatContext = null;
let chatPollingTimer = null;
let uploadedImageData = null;

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupCategoryFilters();
  setupSearchInput();
  setupPhotoUpload();
  setupListItemModal();
  setupSellerChatModal();
  loadMarketplaceItems();
});

function setupUserHeader() {
  const isHOD = user.role === 'HOD' || user.role === 'HOD_CS' || user.role === 'ADMIN';
  const pin = user.sbtetPin || user.rollNumber || '24259-XX-XXX';
  const subElem = document.getElementById('market-subtitle');
  if (subElem) {
    if (isHOD) {
      subElem.textContent = `Samskruti College (259) • Prof. Vamshi Krishna (HOD CS) • Campus Marketplace Oversight`;
    } else {
      subElem.textContent = `Samskruti College (259) • ${user.name || 'Student'} (PIN: ${pin}) • Verified Campus Exchange`;
    }
  }
}

/**
 * 1. LOAD MARKETPLACE ITEMS
 */
async function loadMarketplaceItems() {
  try {
    const res = await api.get('/marketplace/items', { category: activeCategory });
    if (res && res.success && Array.isArray(res.items)) {
      allItems = res.items;
    } else {
      allItems = [];
    }
  } catch {
    allItems = [];
  }

  renderMarketplaceGrid();
}

function renderMarketplaceGrid() {
  const grid = document.getElementById('marketplace-grid');
  if (!grid) return;

  const filtered = allItems.filter(item => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = !activeSearchQuery ||
      item.title.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(activeSearchQuery.toLowerCase())) ||
      (item.sellerName && item.sellerName.toLowerCase().includes(activeSearchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-tile">
        <div class="empty-state-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
        <h4>Marketplace is Empty</h4>
        <p>No products are currently listed for sale. Click "+ List Item" to sell textbooks, drafters, or lab gear.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="neu-card item-card">
      <div class="item-badge-top">
        <span class="neu-badge neu-badge-success">${escapeHtml(item.condition || 'Verified Listing')}</span>
        <span class="item-price">₹${item.price}</span>
      </div>

      ${item.image ? `
        <div class="item-photo-wrapper" style="width: 100%; height: 160px; border-radius: var(--radius-md); overflow: hidden; margin: 8px 0; background: var(--bg-secondary); box-shadow: var(--shadow-inset);">
          <img src="${item.image}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      ` : ''}

      <h3 class="item-title">${escapeHtml(item.title)}</h3>
      <p class="item-desc">${escapeHtml(item.description || 'No extra notes provided.')}</p>

      <div class="item-seller">
        <span>Seller: <strong>${escapeHtml(item.sellerName)} (${escapeHtml(item.sellerPin || '')})</strong></span>
      </div>

      <button class="neu-btn neu-btn-primary reserve-btn chat-seller-trigger" data-item='${JSON.stringify(item)}'>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        Chat with Seller
      </button>
    </div>
  `).join('');

  grid.querySelectorAll('.chat-seller-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemData = JSON.parse(btn.getAttribute('data-item'));
      const sellerPin = itemData.sellerPin || '';
      const itemId = itemData.id || '';
      const title = itemData.title || '';
      const price = itemData.price || '';
      const sellerName = itemData.sellerName || '';

      window.location.href = `messages.html?chatWith=${encodeURIComponent(sellerPin)}&item=${encodeURIComponent(itemId)}&title=${encodeURIComponent(title)}&price=${encodeURIComponent(price)}&peerName=${encodeURIComponent(sellerName)}`;
    });
  });
}

function setupCategoryFilters() {
  const filterBtns = document.querySelectorAll('#category-filter-bar button');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category');
      renderMarketplaceGrid();
    });
  });
}

function setupSearchInput() {
  const searchInput = document.getElementById('market-search-input');
  searchInput?.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value.trim();
    renderMarketplaceGrid();
  });
}

/**
 * 2. GALLERY & CAMERA PHOTO UPLOADS WITH CANVAS COMPRESSION
 */
function setupPhotoUpload() {
  const galleryInput = document.getElementById('gallery-input');
  const cameraInput = document.getElementById('camera-input');
  const previewWrapper = document.getElementById('image-preview-wrapper');
  const previewImg = document.getElementById('item-image-preview');
  const removeBtn = document.getElementById('btn-remove-image');

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alerts.error('Invalid File', 'Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Client-side canvas compression: max width 1200px, JPEG quality 0.82
        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        uploadedImageData = canvas.toDataURL('image/jpeg', 0.82);
        if (previewImg) previewImg.src = uploadedImageData;
        if (previewWrapper) previewWrapper.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  galleryInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  });

  cameraInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  });

  removeBtn?.addEventListener('click', () => {
    uploadedImageData = null;
    if (galleryInput) galleryInput.value = '';
    if (cameraInput) cameraInput.value = '';
    if (previewImg) previewImg.src = '';
    if (previewWrapper) previewWrapper.style.display = 'none';
  });
}

function resetPhotoUploadUI() {
  uploadedImageData = null;
  const galleryInput = document.getElementById('gallery-input');
  const cameraInput = document.getElementById('camera-input');
  const previewWrapper = document.getElementById('image-preview-wrapper');
  const previewImg = document.getElementById('item-image-preview');

  if (galleryInput) galleryInput.value = '';
  if (cameraInput) cameraInput.value = '';
  if (previewImg) previewImg.src = '';
  if (previewWrapper) previewWrapper.style.display = 'none';
}

/**
 * 3. LIST NEW ITEM MODAL
 */
function setupListItemModal() {
  const modal = document.getElementById('list-item-modal');
  const openBtn = document.getElementById('btn-list-item') || document.getElementById('open-list-item-btn');
  const closeBtn = document.getElementById('close-list-modal');
  const cancelBtn = document.getElementById('cancel-list-modal');
  const form = document.getElementById('list-item-form');

  const closeModal = () => {
    modal.style.display = 'none';
    resetPhotoUploadUI();
  };

  openBtn?.addEventListener('click', () => {
    form.reset();
    resetPhotoUploadUI();
    modal.style.display = 'flex';
  });

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('item-title')?.value.trim();
    const category = document.getElementById('item-category')?.value;
    const price = document.getElementById('item-price')?.value;
    const condition = document.getElementById('item-condition')?.value;
    const description = document.getElementById('item-description')?.value.trim();

    if (!title || !price) {
      alerts.error('Required Fields', 'Please provide item title and price.');
      return;
    }

    const payload = {
      title,
      category,
      price: parseFloat(price),
      condition,
      description,
      image: uploadedImageData,
      sellerName: user.name || 'Student Seller',
      sellerPin: user.sbtetPin || user.rollNumber || '24259-CS-025',
      sellerBranch: user.department || 'Computer Science & Engineering'
    };

    try {
      const res = await api.request('/marketplace/items', {
        method: 'POST',
        body: payload
      });
      if (res && res.item) {
        allItems.unshift(res.item);
      }
      alerts.success('Listing Published', 'Your item with photos is now live in the student marketplace.');
    } catch {
      allItems.unshift({
        id: `item_${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString()
      });
      alerts.success('Listing Created', 'Item listed in Marketplace.');
    }

    closeModal();
    renderMarketplaceGrid();
  });
}

/**
 * 4. BUYER-SELLER IN-APP CHAT
 */
function setupSellerChatModal() {
  const modal = document.getElementById('seller-chat-modal');
  const closeBtn = document.getElementById('close-seller-chat-modal');
  const sendBtn = document.getElementById('send-seller-chat-btn');
  const input = document.getElementById('seller-chat-input');

  const closeModal = () => {
    modal.style.display = 'none';
    if (chatPollingTimer) clearInterval(chatPollingTimer);
  };
  closeBtn?.addEventListener('click', closeModal);

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text || !currentChatContext) return;

    input.value = '';
    const myPin = user.sbtetPin || user.rollNumber || '24259-CS-025';

    // Optimistic UI append
    appendChatBubble({
      senderPin: myPin,
      senderName: user.name || 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    try {
      await api.request(`/marketplace/items/${currentChatContext.id}/chat`, {
        method: 'POST',
        body: {
          itemId: currentChatContext.id,
          text,
          senderPin: myPin,
          senderName: user.name || 'Student Buyer'
        }
      });
    } catch {}
  };

  sendBtn?.addEventListener('click', sendMessage);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
}

function openSellerChatModal(item) {
  const modal = document.getElementById('seller-chat-modal');
  const nameElem = document.getElementById('chat-seller-name');
  const contextElem = document.getElementById('chat-item-context');
  const avatarElem = document.getElementById('chat-seller-avatar');

  currentChatContext = item;

  if (nameElem) nameElem.textContent = item.sellerName || 'Seller Student';
  if (contextElem) contextElem.textContent = `Listing: ${item.title} (₹${item.price})`;
  if (avatarElem) avatarElem.textContent = (item.sellerName || 'SS').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  modal.style.display = 'flex';
  loadSellerChatMessages(item.id);

  if (chatPollingTimer) clearInterval(chatPollingTimer);
  chatPollingTimer = setInterval(() => loadSellerChatMessages(item.id, true), 4000);
}

async function loadSellerChatMessages(itemId, silent = false) {
  const container = document.getElementById('seller-chat-messages');
  if (!container) return;

  try {
    const res = await api.get(`/marketplace/items/${itemId}/chat`);
    if (res && res.success && Array.isArray(res.messages)) {
      renderChatMessages(res.messages);
    } else if (!silent) {
      renderChatMessages([]);
    }
  } catch {
    if (!silent) renderChatMessages([]);
  }
}

function renderChatMessages(messages) {
  const container = document.getElementById('seller-chat-messages');
  if (!container) return;

  if (!messages || messages.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin: auto; padding: 24px;">
        No messages yet. Send a message to connect with the seller!
      </div>
    `;
    return;
  }

  const myPin = (user.sbtetPin || user.rollNumber || '').trim().toUpperCase();
  container.innerHTML = messages.map(msg => {
    const isMine = (msg.senderPin || '').trim().toUpperCase() === myPin || msg.senderName === 'You';
    return `
      <div class="chat-bubble ${isMine ? 'mine' : 'peer'}">
        <div>${escapeHtml(msg.text)}</div>
        <div class="chat-bubble-meta">${escapeHtml(msg.time || '')}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function appendChatBubble(msg) {
  const container = document.getElementById('seller-chat-messages');
  if (!container) return;

  const myPin = (user.sbtetPin || user.rollNumber || '').trim().toUpperCase();
  const isMine = (msg.senderPin || '').trim().toUpperCase() === myPin || msg.senderName === 'You';
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${isMine ? 'mine' : 'peer'}`;
  bubble.innerHTML = `
    <div>${escapeHtml(msg.text)}</div>
    <div class="chat-bubble-meta">${escapeHtml(msg.time || '')}</div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
