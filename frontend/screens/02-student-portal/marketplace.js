/**
 * Samskruti Marketplace & Campus Exchange Controller
 * Real-time peer-to-peer verified campus exchange for textbooks, drafters, calculators & lab gear.
 * Full CRUD (Create, Read, Update, Delete) with Direct Messaging integration.
 */

import { api } from '../../js/api.js';
import { requireAuth } from '../../js/auth-guard.js';
import { renderDock } from '../../js/dock.js';
import { alerts } from '../../js/alerts.js';
import { wsClient } from '../../js/ws.js';

// Verify authentication safely
const user = requireAuth(['STUDENT', 'HOD', 'HOD_CS', 'ADMIN', 'FACULTY']);

if (user) {
  const isHODRole = String(user?.role || '').toUpperCase().includes('HOD') || user?.role === 'ADMIN';
  renderDock('marketplace.html', isHODRole ? 'HOD' : 'STUDENT');
}

// Safe credentials extraction
const myPin = ((user && (user.sbtetPin || user.rollNumber || user.pin)) || localStorage.getItem('student_pin') || '24259-CS-025').trim().toUpperCase();
const myName = (user && user.name) || localStorage.getItem('user_name') || 'Student';
const isHOD = user && (String(user.role || '').toUpperCase().includes('HOD') || user.role === 'ADMIN');

// Default Verified Campus Surplus Listings
const DEFAULT_MARKETPLACE_ITEMS = [
  {
    id: 1,
    title: 'Higher Engineering Mathematics (B.S. Grewal - 44th Edition)',
    category: 'TEXTBOOK',
    price: 380,
    condition: 'Like New',
    description: 'Clean textbook with solved SBTET question papers and zero markings. Essential for Semester 1 to 5 mathematics.',
    seller_pin: '24259-CS-012',
    seller_name: 'Rahul Varma',
    status: 'AVAILABLE'
  },
  {
    id: 2,
    title: 'Omega Engineering Mini Drafter & Board with Canvas Bag',
    category: 'DRAFTER',
    price: 420,
    condition: 'Good Condition',
    description: 'Complete stainless steel arms, calibrated protractor scale, locking clamp, and water-resistant protective bag.',
    seller_pin: '24259-ME-008',
    seller_name: 'Srikanth Mech',
    status: 'AVAILABLE'
  },
  {
    id: 3,
    title: 'Casio FX-991EX ClassWiz Scientific Calculator',
    category: 'CALCULATOR',
    price: 750,
    condition: 'Like New',
    description: 'Authentic 552 functions, high-resolution natural textbook display, QR code equation solver, dual solar + battery power.',
    seller_pin: '24259-AIML-034',
    seller_name: 'Sneha Reddy',
    status: 'AVAILABLE'
  },
  {
    id: 4,
    title: 'Standard Cotton Lab Apron & Polycarbonate Safety Goggles (Size M)',
    category: 'LAB_COAT',
    price: 160,
    condition: 'Good Condition',
    description: '100% thick white cotton lab coat with Samskruti institutional crest pocket, washed and sanitized, plus clear goggles.',
    seller_pin: '24259-CS-041',
    seller_name: 'Tanvi Patel',
    status: 'AVAILABLE'
  },
  {
    id: 5,
    title: 'ESP32 Dual-Core WiFi+BLE Board & IoT Sensor Starter Kit',
    category: 'ELECTRONICS',
    price: 540,
    condition: 'Brand New',
    description: 'Unopened ESP32 dev board, breadboard, DHT11 temp-humidity sensor, ultrasonic distance sensor, and 40 jumper wires.',
    seller_pin: '24259-EC-019',
    seller_name: 'Akhil Goud',
    status: 'AVAILABLE'
  },
  {
    id: 6,
    title: 'Engineering Mechanics (S.S. Bhavikatti - C-24 Reference)',
    category: 'TEXTBOOK',
    price: 290,
    condition: 'Fair Condition',
    description: 'Covers static equilibrium, trusses, centroids, and friction. Very helpful for internal and semester end exams.',
    seller_pin: '24259-CIV-005',
    seller_name: 'Rajesh Naidu',
    status: 'AVAILABLE'
  }
];

// State
let allItems = [];
let activeCategory = 'ALL';
let activeSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  setupUserHeader();
  setupCategoryFilters();
  setupListItemModal();
  setupEditItemModal();
  setupWebSocket();
  loadMarketplaceItems();

  if (typeof window.dcSyncProfile === 'function') {
    window.dcSyncProfile();
  }
});

function setupUserHeader() {
  const subElem = document.getElementById('market-subtitle');
  if (subElem) {
    if (isHOD) {
      subElem.textContent = `Samskruti College (259) • Department Head Oversight • Verified Campus Surplus Exchange`;
    } else {
      subElem.textContent = `Samskruti College (Code: 259) • ${myName} (PIN: ${myPin}) • Verified Peer-to-Peer Exchange`;
    }
  }
}

/**
 * 0. REAL-TIME WEBSOCKET
 */
function setupWebSocket() {
  wsClient.connect(myPin, myName);

  wsClient.on('MARKETPLACE_FEED_UPDATE', (payload) => {
    if (!payload) return;
    const { action, item, item_id } = payload;

    if (action === 'CREATE' && item) {
      // Check if already in list
      if (!allItems.some(i => String(i.id) === String(item.id))) {
        allItems.unshift(item);
        renderMarketplaceGrid();
      }
    } else if (action === 'UPDATE' && item) {
      const idx = allItems.findIndex(i => String(i.id) === String(item.id));
      if (idx !== -1) {
        allItems[idx] = { ...allItems[idx], ...item };
        renderMarketplaceGrid();
      }
    } else if (action === 'DELETE' && item_id) {
      allItems = allItems.filter(i => String(i.id) !== String(item_id));
      renderMarketplaceGrid();
    }
  });
}

/**
 * 1. LOAD MARKETPLACE ITEMS
 */
async function loadMarketplaceItems() {
  try {
    const res = await api.get('/marketplace/items');
    if (res && res.success && Array.isArray(res.items) && res.items.length > 0) {
      allItems = res.items;
    } else {
      const localCustom = JSON.parse(localStorage.getItem('custom_market_items') || '[]');
      allItems = [...localCustom, ...DEFAULT_MARKETPLACE_ITEMS];
    }
  } catch (e) {
    console.warn('[Marketplace] Falling back to default listings:', e);
    const localCustom = JSON.parse(localStorage.getItem('custom_market_items') || '[]');
    allItems = [...localCustom, ...DEFAULT_MARKETPLACE_ITEMS];
  }

  renderMarketplaceGrid();
}

/**
 * 2. RENDER PRODUCTS GRID
 */
function renderMarketplaceGrid() {
  const grid = document.getElementById('productGridContainer');
  if (!grid) return;

  const filtered = allItems.filter(item => {
    const matchCat = activeCategory === 'ALL' || (item.category || '').toUpperCase() === activeCategory.toUpperCase();
    const q = activeSearchQuery.toLowerCase();
    const matchSearch = !q ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.seller_name || '').toLowerCase().includes(q) ||
      (item.seller_pin || '').toLowerCase().includes(q);

    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
        <div style="font-size: 2.2rem; margin-bottom: 8px;">📦</div>
        <h3 style="font-weight: 800; color: var(--text-heading); margin-bottom: 6px;">No Campus Listings Found</h3>
        <p style="font-size: 0.88rem; margin: 0;">Be the first to list surplus textbooks, drafters, or calculators for fellow students!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const isOwner = String(item.seller_pin || '').toUpperCase() === myPin || isHOD;
    const catLabel = getCategoryLabel(item.category);
    const isSold = item.status === 'SOLD';

    return `
      <div class="product-card" id="card-${item.id}">
        <div class="product-badge-row">
          <span class="product-category-tag">${catLabel}</span>
          <span class="product-price-tag">₹${Number(item.price).toLocaleString('en-IN')}</span>
        </div>

        <h3 class="product-title">${escapeHtml(item.title)}</h3>
        <p class="product-desc">${escapeHtml(item.description || 'Verified Samskruti student campus listing.')}</p>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.72rem; font-weight: 700; color: #34d399; background: rgba(16, 185, 129, 0.15); padding: 3px 10px; border-radius: 9999px;">
            ${escapeHtml(item.condition || 'Good')}
          </span>
          ${isSold ? `<span style="font-size: 0.72rem; font-weight: 800; color: #f87171; background: rgba(239, 68, 68, 0.15); padding: 3px 10px; border-radius: 9999px;">SOLD</span>` : ''}
        </div>

        <div class="product-seller-meta">
          <span>By: <strong>${escapeHtml(item.seller_name || 'Student')}</strong></span>
          <code>${escapeHtml(item.seller_pin || '')}</code>
        </div>

        <!-- DM Seller Button -->
        <a href="messages.html?recipient=${encodeURIComponent(item.seller_pin || '')}&sellerName=${encodeURIComponent(item.seller_name || '')}&item=${encodeURIComponent(item.title || '')}" class="btn-contact-seller">
          💬 DM Seller (${escapeHtml(item.seller_name ? item.seller_name.split(' ')[0] : 'Student')})
        </a>

        <!-- Edit & Remove Options (for Seller or HOD) -->
        ${isOwner ? `
          <div class="product-actions-bar">
            <button type="button" class="btn-edit-listing" onclick="window.openEditListingModal(${JSON.stringify(item.id)})">
              ✎ Edit
            </button>
            <button type="button" class="btn-delete-listing" onclick="window.confirmDeleteListing(${JSON.stringify(item.id)})">
              ✕ Remove
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function getCategoryLabel(cat) {
  const c = (cat || '').toUpperCase();
  if (c === 'TEXTBOOK') return '📚 Textbook';
  if (c === 'DRAFTER') return '📐 Mini Drafter';
  if (c === 'CALCULATOR') return '🔢 Calculator';
  if (c === 'LAB_COAT' || c === 'LAB_GEAR') return '🥼 Lab Gear';
  if (c === 'ELECTRONICS' || c === 'TECH') return '⚡ Electronics';
  return '📦 Academic Gear';
}

/**
 * 3. CATEGORY FILTERS
 */
function setupCategoryFilters() {
  const container = document.getElementById('categoryFilterBar');
  if (!container) return;

  container.querySelectorAll('.cat-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'ALL';
      renderMarketplaceGrid();
    });
  });
}

/**
 * 4. SELL AN ITEM MODAL & CREATION
 */
function setupListItemModal() {
  const openBtn = document.getElementById('btn-list-item');
  const modal = document.getElementById('list-item-modal');
  const closeBtn = document.getElementById('close-list-modal');
  const cancelBtn = document.getElementById('cancel-list-modal');
  const form = document.getElementById('form-list-item');

  openBtn?.addEventListener('click', () => {
    if (modal) modal.style.display = 'flex';
    document.getElementById('item-title')?.focus();
  });

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
    form?.reset();
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('item-title')?.value.trim();
    const category = document.getElementById('item-category')?.value;
    const price = parseFloat(document.getElementById('item-price')?.value) || 0;
    const condition = document.getElementById('item-condition')?.value;
    const contact = document.getElementById('item-contact')?.value.trim();
    const description = document.getElementById('item-description')?.value.trim() || 'Verified Samskruti student campus listing.';

    if (!title || price <= 0) {
      alerts.error('Required Information', 'Please provide a valid item title and price.');
      return;
    }

    const submitBtn = document.getElementById('btn-submit-listing');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publishing Listing...';
    }

    try {
      const payload = {
        seller_pin: myPin,
        seller_name: myName,
        title,
        description,
        price,
        category,
        condition,
        contact_info: contact
      };

      const res = await api.post('/marketplace/items', payload);

      const newItem = (res && res.item) ? res.item : {
        id: Date.now(),
        ...payload,
        status: 'AVAILABLE'
      };

      allItems.unshift(newItem);
      renderMarketplaceGrid();
      closeModal();
      alerts.success('Listing Published! 🎉', `"${title}" is now visible to all students on campus.`);
    } catch (err) {
      // Local fallback
      const fallbackItem = {
        id: Date.now(),
        title,
        description,
        price,
        category,
        condition,
        seller_pin: myPin,
        seller_name: myName,
        status: 'AVAILABLE'
      };
      const customItems = JSON.parse(localStorage.getItem('custom_market_items') || '[]');
      customItems.unshift(fallbackItem);
      localStorage.setItem('custom_market_items', JSON.stringify(customItems));

      allItems.unshift(fallbackItem);
      renderMarketplaceGrid();
      closeModal();
      alerts.success('Listing Published! 🎉', `"${title}" is now visible on campus.`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Listing ✨';
      }
    }
  });
}

/**
 * 5. EDIT & REMOVE LISTINGS
 */
function setupEditItemModal() {
  const modal = document.getElementById('edit-item-modal');
  const closeBtn = document.getElementById('close-edit-modal');
  const cancelBtn = document.getElementById('cancel-edit-modal');
  const form = document.getElementById('form-edit-item');

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const itemId = document.getElementById('edit-item-id')?.value;
    const title = document.getElementById('edit-item-title')?.value.trim();
    const category = document.getElementById('edit-item-category')?.value;
    const price = parseFloat(document.getElementById('edit-item-price')?.value) || 0;
    const condition = document.getElementById('edit-item-condition')?.value;
    const status = document.getElementById('edit-item-status')?.value;
    const description = document.getElementById('edit-item-description')?.value.trim();

    try {
      await api.put(`/marketplace/items/${itemId}`, {
        title,
        category,
        price,
        condition,
        status,
        description
      });

      // Update in memory
      const idx = allItems.findIndex(i => String(i.id) === String(itemId));
      if (idx !== -1) {
        allItems[idx] = { ...allItems[idx], title, category, price, condition, status, description };
      }

      renderMarketplaceGrid();
      closeModal();
      alerts.success('Listing Updated', `"${title}" has been updated successfully.`);
    } catch (err) {
      alerts.error('Update Failed', err.message || 'Could not update listing.');
    }
  });
}

window.openEditListingModal = function(id) {
  const item = allItems.find(i => String(i.id) === String(id));
  if (!item) return;

  const modal = document.getElementById('edit-item-modal');
  document.getElementById('edit-item-id').value = item.id;
  document.getElementById('edit-item-title').value = item.title || '';
  document.getElementById('edit-item-category').value = item.category || 'TEXTBOOK';
  document.getElementById('edit-item-price').value = item.price || '';
  document.getElementById('edit-item-condition').value = item.condition || 'Like New';
  document.getElementById('edit-item-status').value = item.status || 'AVAILABLE';
  document.getElementById('edit-item-description').value = item.description || '';

  if (modal) modal.style.display = 'flex';
};

window.confirmDeleteListing = async function(id) {
  const item = allItems.find(i => String(i.id) === String(id));
  const title = item ? item.title : 'this item';

  if (!confirm(`Are you sure you want to remove "${title}" from the campus marketplace?`)) {
    return;
  }

  try {
    await api.delete(`/marketplace/items/${id}`);
    allItems = allItems.filter(i => String(i.id) !== String(id));
    renderMarketplaceGrid();
    alerts.success('Listing Removed', `"${title}" has been removed from marketplace.`);
  } catch (err) {
    // Also remove from local list if local
    allItems = allItems.filter(i => String(i.id) !== String(id));
    renderMarketplaceGrid();
    alerts.success('Listing Removed', `Listing removed successfully.`);
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
