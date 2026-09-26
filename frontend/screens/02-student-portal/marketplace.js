/**
 * Samskruti Marketplace & Campus Exchange Controller
 * Real-time peer-to-peer marketplace with WebSocket live feed updates, photo capture with compression, and direct chat.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';
import { wsClient } from '../../js/ws.js';

// Verify student/HOD authentication
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY']);

// Render Left Dock Navigation
if (user) {
  const isHODRole = user?.role === 'HOD' || user?.role === 'HOD_CS' || user?.role === 'ADMIN';
  renderDock('marketplace.html', isHODRole ? 'HOD' : 'STUDENT');
}

// State
let allItems = [];
let activeCategory = 'ALL';
let activeSearchQuery = '';
let currentChatContext = null;
let uploadedImageData = null;

const myPin = (user.sbtetPin || user.rollNumber || user.pin || '24259-CS-025').trim().toUpperCase();
const myName = user.name || 'Student';

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupCategoryFilters();
  setupSearchInput();
  setupPhotoUpload();
  setupListItemModal();
  setupSellerChatModal();
  setupRealtimeWebSocket();
  loadMarketplaceItems();
});

function setupUserHeader() {
  const isHOD = user.role === 'HOD' || user.role === 'HOD_CS' || user.role === 'ADMIN';
  const subElem = document.getElementById('market-subtitle');
  if (subElem) {
    if (isHOD) {
      subElem.textContent = `Samskruti College (259) • Prof. Vamshi Krishna (HOD CS) • Campus Marketplace Oversight`;
    } else {
      subElem.textContent = `Samskruti College (259) • ${myName} (PIN: ${myPin}) • Verified Campus Exchange`;
    }
  }
}

/**
 * 0. REAL-TIME WEBSOCKET SUBSCRIPTION
 */
function setupRealtimeWebSocket() {
  wsClient.connect(myPin, myName);

  wsClient.on('MARKETPLACE_FEED_UPDATE', (data) => {
    if (!data) return;

    if (data.action === 'CREATE' && data.item) {
      const exists = allItems.some(i => i.id === data.item.id);
      if (!exists) {
        allItems.unshift(data.item);
        renderMarketplaceGrid();
        alerts.info('New Listing', `"${data.item.title}" was just listed for ₹${data.item.price}.`);
      }
    } else if (data.action === 'UPDATE' && data.item) {
      const idx = allItems.findIndex(i => i.id === data.item.id);
      if (idx !== -1) {
        allItems[idx] = data.item;
        renderMarketplaceGrid();
      }
    } else if (data.action === 'DELETE' && data.item_id) {
      allItems = allItems.filter(i => i.id !== data.item_id);
      renderMarketplaceGrid();
    }
  });

  // Listen for new messages if chat modal is active
  wsClient.on('NEW_MESSAGE', (payload) => {
    if (payload?.message && currentChatContext) {
      const msg = payload.message;
      if (msg.category === 'MARKETPLACE' && (msg.sender_pin === currentChatContext.seller_pin || msg.sender_pin === currentChatContext.sellerPin)) {
        appendChatBubble({
          senderPin: msg.sender_pin,
          senderName: msg.sender_name,
          text: msg.content,
          time: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }
  });
}

/**
 * 1. LOAD MARKETPLACE ITEMS
 */
async function loadMarketplaceItems() {
  try {
    const res = await api.get('/marketplace/items');
    if (res && res.success && Array.isArray(res.items)) {
      allItems = res.items;
    } else {
      allItems = [];
    }
  } catch (e) {
    console.error('Failed to load marketplace items:', e);
    allItems = [];
  }

  renderMarketplaceGrid();
}

function renderMarketplaceGrid() {
  const grid = document.getElementById('marketplace-grid');
  if (!grid) return;

  const filtered = allItems.filter(item => {
    const itemCat = (item.category || '').toUpperCase();
    const targetCat = activeCategory.toUpperCase();
    const matchesCat = targetCat === 'ALL' || itemCat === targetCat;
    
    const title = (item.title || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const seller = (item.seller_name || item.sellerName || '').toLowerCase();
    const q = activeSearchQuery.toLowerCase();

    const matchesSearch = !q || title.includes(q) || desc.includes(q) || seller.includes(q);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-tile" style="grid-column: 1 / -1; text-align: center; padding: 48px 24px;">
        <div class="empty-state-icon" style="margin-bottom: 12px;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
        <h4 style="font-weight: 800; font-size: 1.15rem; margin-bottom: 6px;">No Items in This Category</h4>
        <p style="color: var(--text-muted); font-size: 0.9rem;">No products found matching your filter. Click "+ List Item" to sell textbooks, drafters, or lab equipment.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const sellerPin = (item.seller_pin || item.sellerPin || '').toUpperCase();
    const sellerName = item.seller_name || item.sellerName || 'Student Seller';
    const isMyItem = sellerPin === myPin;
    const imgUrl = item.image_url || item.image;

    return `
      <div class="neu-card item-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="item-badge-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="neu-badge neu-badge-success">${escapeHtml(item.condition || 'Good')}</span>
            <span class="item-price" style="font-weight: 800; color: #10b981; font-size: 1.1rem;">₹${item.price}</span>
          </div>

          ${imgUrl ? `
            <div class="item-photo-wrapper" style="width: 100%; height: 160px; border-radius: var(--radius-md); overflow: hidden; margin: 8px 0; background: var(--bg-secondary); box-shadow: var(--shadow-inset);">
              <img src="${imgUrl}" alt="${escapeHtml(item.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          ` : ''}

          <h3 class="item-title" style="font-size: 1.05rem; font-weight: 700; margin-top: 6px;">${escapeHtml(item.title)}</h3>
          <p class="item-desc" style="font-size: 0.85rem; color: var(--text-muted); margin: 6px 0 12px 0;">${escapeHtml(item.description || 'Verified student listing.')}</p>

          <div class="item-seller" style="font-size: 0.8rem; color: var(--text-muted); padding: 8px 0; border-top: 1px dashed rgba(150,150,150,0.2);">
            <span>Seller: <strong style="color: var(--text-main);">${escapeHtml(sellerName)}</strong> (${escapeHtml(sellerPin)})</span>
          </div>
        </div>

        <div class="item-actions" style="margin-top: 12px; display: flex; gap: 8px;">
          ${isMyItem ? `
            <button class="neu-btn neu-btn-danger delete-item-trigger" data-item-id="${item.id}" style="width: 100%; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; font-weight: 700;">
              🗑️ Delete My Listing
            </button>
          ` : `
            <button class="neu-btn neu-btn-primary reserve-btn chat-seller-trigger" data-item='${JSON.stringify(item)}' style="width: 100%;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Chat with Seller
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

  // Attach Delete handlers
  grid.querySelectorAll('.delete-item-trigger').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = btn.getAttribute('data-item-id');
      if (!confirm('Are you sure you want to delete this listing? It will immediately disappear for all students.')) return;
      try {
        const res = await api.delete(`/marketplace/items/${itemId}`);
        if (res && res.success) {
          allItems = allItems.filter(i => String(i.id) !== String(itemId));
          renderMarketplaceGrid();
          alerts.success('Listing Removed', 'Item successfully removed from the marketplace.');
        }
      } catch (err) {
        alerts.error('Delete Failed', err.message || 'Could not delete item.');
      }
    });
  });

  // Attach Chat handlers
  grid.querySelectorAll('.chat-seller-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemData = JSON.parse(btn.getAttribute('data-item'));
      const sellerPin = itemData.seller_pin || itemData.sellerPin || '';
      const sellerName = itemData.seller_name || itemData.sellerName || 'Student';
      const itemId = itemData.id || '';
      const title = itemData.title || '';
      const price = itemData.price || '';

      // Direct to unified messaging with product context
      window.location.href = `messages.html?tab=marketplace&chatWith=${encodeURIComponent(sellerPin)}&item=${encodeURIComponent(itemId)}&title=${encodeURIComponent(title)}&price=${encodeURIComponent(price)}&peerName=${encodeURIComponent(sellerName)}`;
    });
  });
}

function setupCategoryFilters() {
  const filterBtns = document.querySelectorAll('#category-filter-bar button');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'ALL';
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
 * 2. PHOTO UPLOADS WITH CANVAS COMPRESSION
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
        const maxWidth = 1000;
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

        uploadedImageData = canvas.toDataURL('image/jpeg', 0.80);
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
    resetPhotoUploadUI();
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
  const openBtn = document.getElementById('btn-list-item');
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
      image_url: uploadedImageData,
      seller_name: myName,
      seller_pin: myPin,
      contact_info: user.email || myPin
    };

    const submitBtn = document.getElementById('publish-item-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publishing...';
    }

    try {
      const res = await api.post('/marketplace/items', payload);
      if (res && res.item) {
        if (!allItems.some(i => i.id === res.item.id)) {
          allItems.unshift(res.item);
        }
      }
      alerts.success('Listing Published', 'Your item is live on the Samskruti Marketplace!');
      closeModal();
      renderMarketplaceGrid();
    } catch (err) {
      alerts.error('Listing Error', err.message || 'Failed to publish listing to the database.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish to Marketplace';
      }
    }
  });
}

/**
 * 4. IN-APP SELLER CHAT MODAL
 */
function setupSellerChatModal() {
  const modal = document.getElementById('seller-chat-modal');
  const closeBtn = document.getElementById('close-seller-chat-modal');
  const sendBtn = document.getElementById('send-seller-chat-btn');
  const input = document.getElementById('seller-chat-input');

  const closeModal = () => {
    modal.style.display = 'none';
    currentChatContext = null;
  };
  closeBtn?.addEventListener('click', closeModal);

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text || !currentChatContext) return;

    input.value = '';
    const recipientPin = currentChatContext.seller_pin || currentChatContext.sellerPin;

    // Send via WebSocket
    const sent = wsClient.send({
      type: 'SEND_MESSAGE',
      receiver_pin: recipientPin,
      content: text,
      category: 'MARKETPLACE',
      product_id: currentChatContext.id
    });

    appendChatBubble({
      senderPin: myPin,
      senderName: myName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  sendBtn?.addEventListener('click', sendMessage);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });
}

function appendChatBubble(msg) {
  const container = document.getElementById('seller-chat-messages');
  if (!container) return;

  const isMine = (msg.senderPin || '').trim().toUpperCase() === myPin;
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
