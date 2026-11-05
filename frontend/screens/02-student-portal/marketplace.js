/**
 * Samskruti College Student Marketplace & Hardware Exchange Controller
 * Kinetic Bento Tactile Design System Engine
 * SBTET Code 259 Student Peer-to-Peer Exchange
 */

document.addEventListener('DOMContentLoaded', () => {
  initMarketplace();
});

let marketplaceItems = [];
let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'recent';
let selectedItem = null;

function initMarketplace() {
  bindSearchAndClear();
  bindFilterPills();
  bindSortSelect();
  bindSellModal();
  bindDetailModal();
  bindMessageModal();
  loadMarketplaceItems();
}

/**
 * 1. Default Baseline Items
 */
function getDefaultItems() {
  return [
    {
      id: 1,
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      category: 'electronics',
      categoryLabel: 'Electronics',
      price: 950,
      condition: 'Like New',
      seller_name: 'Dulipudi Tarun',
      seller_pin: '24259-CS-002',
      seller_dept: 'CSE · Year II',
      seller_phone: '+91 9849102938',
      description: 'High-resolution natural textbook display with 552 functions. Used for 1 semester in Applied Mathematics. Original box and slide case included.',
      created_at: '2026-11-04'
    },
    {
      id: 2,
      title: 'SCET Official White Lab Coat (Size L, Diploma Spec)',
      category: 'lab',
      categoryLabel: 'Lab Equipment',
      price: 250,
      condition: 'Gently Used',
      seller_name: 'Chaganti Srija',
      seller_pin: '24259-CS-005',
      seller_dept: 'CSE · Year II',
      seller_phone: '+91 9701827364',
      description: 'Standard institutional 100% cotton white apron with embroidered Samskruti crest and pen pocket. Washed and ironed, ready for chemistry/hardware lab.',
      created_at: '2026-11-03'
    },
    {
      id: 3,
      title: 'Omega Deluxe Mini Drafter Set with Steel Clamp',
      category: 'drawing',
      categoryLabel: 'Drawing & Tools',
      price: 450,
      condition: 'Like New',
      seller_name: 'Katta Dhanush Goud',
      seller_pin: '24259-CS-007',
      seller_dept: 'CSE · Year II',
      seller_phone: '+91 9866123456',
      description: 'Complete engineering graphics mini drafter with unbreakable scale and heavy-duty steel desk clamp. Zero alignment error.',
      created_at: '2026-11-02'
    },
    {
      id: 4,
      title: 'AI & Machine Learning: Foundations & Practice (C-24)',
      category: 'books',
      categoryLabel: 'Books & Notes',
      price: 380,
      condition: 'Good',
      seller_name: 'Pittala Bhavya',
      seller_pin: '24259-CS-004',
      seller_dept: 'CSE · Year II',
      seller_phone: '+91 9959876543',
      description: 'Prescribed curriculum textbook for SBTET C-24 scheme. Contains handwritten summary notes and solved previous board question papers.',
      created_at: '2026-11-01'
    },
    {
      id: 5,
      title: 'Arduino Uno R3 Starter Kit with 37 Sensor Modules',
      category: 'electronics',
      categoryLabel: 'Electronics',
      price: 1200,
      condition: 'Like New',
      seller_name: 'Vadde Abhinay',
      seller_pin: '24259-CS-008',
      seller_dept: 'CSE · Year II',
      seller_phone: '+91 9440123789',
      description: 'Original ATmega328P microcontroller board with USB cable, breadboard, jumper wires, ultrasonic sensor, RFID kit, and relay modules.',
      created_at: '2026-10-28'
    },
    {
      id: 6,
      title: 'Mechanical Workshop Measuring Kit (Vernier + Micrometer)',
      category: 'lab',
      categoryLabel: 'Lab Equipment',
      price: 600,
      condition: 'Good',
      seller_name: 'Anaboina Dilip',
      seller_pin: '24259-CS-003',
      seller_dept: 'CSE · Year II',
      seller_phone: '+91 9177654321',
      description: 'Precision 0.02mm stainless steel vernier caliper and 0.01mm screw gauge micrometer in padded shockproof casing. Workshop certified.',
      created_at: '2026-10-25'
    }
  ];
}

/**
 * 2. Load Items from API and Local Storage
 */
async function loadMarketplaceItems() {
  let items = [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('/api/v1/marketplace/items', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        items = data.items;
      }
    }
  } catch (err) {
    console.warn('Backend marketplace items fetch fallback:', err);
  }

  // Local storage items
  let localItems = [];
  try {
    localItems = JSON.parse(localStorage.getItem('dc_marketplace_items') || '[]');
  } catch (e) {}

  const defaults = getDefaultItems();
  const combined = [...localItems, ...items, ...defaults];
  const unique = [];
  const seenIds = new Set();
  for (const it of combined) {
    const idKey = it.id || it.title;
    if (!seenIds.has(idKey)) {
      seenIds.add(idKey);
      unique.push(it);
    }
  }

  marketplaceItems = unique;
  renderMarketplace();
}

/**
 * 3. Search and Clear Handling
 */
function bindSearchAndClear() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');

  input?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', searchQuery.length === 0);
    }
    renderMarketplace();
  });

  clearBtn?.addEventListener('click', () => {
    if (input) input.value = '';
    searchQuery = '';
    clearBtn.classList.add('hidden');
    renderMarketplace();
  });
}

/**
 * 4. Category Filter Pills
 */
function bindFilterPills() {
  const pills = document.querySelectorAll('.category-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      activeCategory = pill.getAttribute('data-cat') || 'all';

      pills.forEach(p => {
        p.className = 'category-pill px-3.5 py-1.5 rounded-full text-[var(--color-muted)] hover:text-[var(--color-ink)] bg-[var(--color-card-subtle)] hover:bg-[var(--color-hairline)] whitespace-nowrap transition-colors cursor-pointer';
      });

      pill.className = 'category-pill px-3.5 py-1.5 rounded-full font-medium bg-[var(--color-lime)] text-[var(--color-lime-ink)] shadow-2xs whitespace-nowrap active-pill cursor-pointer';

      renderMarketplace();
    });
  });
}

/**
 * 5. Sort Select
 */
function bindSortSelect() {
  const sortSelect = document.getElementById('sortSelect');
  sortSelect?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderMarketplace();
  });
}

/**
 * 6. Render Filtered and Sorted Items
 */
function renderMarketplace() {
  const grid = document.getElementById('marketGrid');
  const countEl = document.getElementById('itemsCount');
  if (!grid) return;

  // Filter
  let filtered = marketplaceItems.filter(item => {
    const cat = (item.category || '').toLowerCase();
    let matchesCat = (activeCategory === 'all');
    if (!matchesCat) {
      if (activeCategory === 'books') {
        matchesCat = cat.includes('book') || cat.includes('text') || cat.includes('note');
      } else if (activeCategory === 'lab') {
        matchesCat = cat.includes('lab') || cat.includes('coat') || cat.includes('apron') || cat.includes('equip');
      } else if (activeCategory === 'electronics') {
        matchesCat = cat.includes('calc') || cat.includes('elect') || cat.includes('arduin') || cat.includes('sensor');
      } else if (activeCategory === 'drawing') {
        matchesCat = cat.includes('draft') || cat.includes('draw') || cat.includes('tool') || cat.includes('square');
      } else {
        matchesCat = (cat === activeCategory.toLowerCase());
      }
    }

    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery) ||
      (item.description && item.description.toLowerCase().includes(searchQuery)) ||
      (item.seller_name && item.seller_name.toLowerCase().includes(searchQuery));

    return matchesCat && matchesSearch;
  });

  // Sort
  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    // recent
    filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bento-card p-10 text-center flex flex-col items-center justify-center gap-3">
        <span class="material-symbols-outlined text-4xl text-[var(--color-muted)]">search_off</span>
        <h3 class="text-sm font-semibold text-[var(--color-ink)]">No items found matching your criteria</h3>
        <p class="text-xs text-[var(--color-muted)]">Try adjusting your search terms or clearing category filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const initials = (item.seller_name || 'SC')
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return `
      <div class="bento-card p-5 flex flex-col justify-between gap-4 border border-[var(--color-hairline)] hover:translate-y-[-2px] transition-all" data-id="${item.id}">
        
        <!-- Top Row: Seller Info + Category -->
        <div class="flex items-center justify-between pb-2 border-b border-[var(--color-hairline)]">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-[var(--color-feature-card)] text-white flex items-center justify-center font-mono text-[10px] font-bold">
              ${initials}
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-semibold text-[var(--color-ink)] truncate max-w-[130px]">${escapeHtml(item.seller_name || 'Student')}</span>
              <span class="font-mono text-[10px] text-[var(--color-muted)]">${item.seller_dept || 'SCET Code 259'}</span>
            </div>
          </div>
          <span class="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-lavender)] text-[#22174C]">
            ${escapeHtml(item.categoryLabel || item.category || 'Other')}
          </span>
        </div>

        <!-- Middle: Title, Description & Condition -->
        <div class="flex flex-col gap-1.5 flex-1">
          <h3 class="text-sm font-bold text-[var(--color-ink)] line-clamp-2 leading-snug">${escapeHtml(item.title)}</h3>
          <p class="text-xs text-[var(--color-muted)] line-clamp-2 leading-relaxed">${escapeHtml(item.description || '')}</p>
          <div class="flex items-center gap-2 pt-1">
            <span class="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-card-subtle)] text-[var(--color-muted)] border border-[var(--color-hairline)]">
              ${item.condition || 'Good'}
            </span>
            <span class="font-mono text-[10px] text-[var(--color-muted)]">Verified Seller</span>
          </div>
        </div>

        <!-- Bottom: Price & Action Buttons -->
        <div class="pt-3 border-t border-[var(--color-hairline)] flex items-center justify-between gap-2">
          <div class="flex items-baseline">
            <span class="text-xl font-bold font-mono text-[var(--color-ink)]">₹${item.price}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" onclick="openItemDetail(${item.id})" class="btn-view-details px-3 py-1.5 rounded-full bg-[var(--color-card-subtle)] hover:bg-[var(--color-hairline)] text-[var(--color-ink)] text-xs font-medium cursor-pointer transition-colors">
              Details
            </button>
            <button type="button" onclick="openMessageSeller(${item.id})" class="btn-message-seller px-3 py-1.5 rounded-full bg-[var(--color-lime)] text-[var(--color-lime-ink)] text-xs font-semibold hover:opacity-90 active:scale-95 cursor-pointer transition-all flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">chat</span>
              <span>Message</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }).join('');
}

/**
 * 7. Sell Item Modal Logic
 */
function bindSellModal() {
  const openBtn = document.getElementById('btnOpenSellModal');
  const modal = document.getElementById('sellItemModal');
  const form = document.getElementById('sellItemForm');
  if (!modal) return;

  openBtn?.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.getElementById('sellTitle')?.focus();
  });

  modal.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => modal.classList.add('hidden'));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('sellTitle')?.value.trim();
    const category = document.getElementById('sellCategory')?.value || 'other';
    const price = parseFloat(document.getElementById('sellPrice')?.value) || 0;
    const condition = document.getElementById('sellCondition')?.value || 'Good';
    const contact = document.getElementById('sellContact')?.value.trim() || '+91 9876543210';
    const desc = document.getElementById('sellDescription')?.value.trim() || '';

    const user = (typeof StitchState !== 'undefined' && StitchState.getUser) 
      ? StitchState.getUser() 
      : { name: 'Karnati Himesh', pin: '24259-CS-025', branch: 'CSE' };

    const newItem = {
      id: Date.now(),
      title,
      category,
      categoryLabel: category.charAt(0).toUpperCase() + category.slice(1),
      price,
      condition,
      seller_name: user.name || 'Karnati Himesh',
      seller_pin: user.pin || '24259-CS-025',
      seller_dept: `${user.branch || 'CSE'} · Year II`,
      seller_phone: contact,
      description: desc,
      created_at: new Date().toISOString().split('T')[0]
    };

    // Try posting to backend API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      await fetch('/api/v1/marketplace/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_pin: newItem.seller_pin,
          seller_name: newItem.seller_name,
          title: newItem.title,
          description: newItem.description,
          price: newItem.price,
          category: newItem.category,
          condition: newItem.condition,
          contact_info: newItem.seller_phone
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (err) {
      console.warn('Backend POST marketplace fallback to local cache:', err);
    }

    // Save to local cache
    let localItems = [];
    try {
      localItems = JSON.parse(localStorage.getItem('dc_marketplace_items') || '[]');
    } catch (e) {}

    localItems.unshift(newItem);
    localStorage.setItem('dc_marketplace_items', JSON.stringify(localItems));

    marketplaceItems.unshift(newItem);
    renderMarketplace();

    modal.classList.add('hidden');
    form.reset();
    showToast(`"${newItem.title}" published to marketplace.`);
  });
}

/**
 * 8. Item Detail Modal
 */
function bindDetailModal() {
  const modal = document.getElementById('itemDetailModal');
  if (!modal) return;

  modal.querySelectorAll('.close-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => modal.classList.add('hidden'));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  const msgBtn = document.getElementById('modalDetailMessageBtn');
  msgBtn?.addEventListener('click', () => {
    modal.classList.add('hidden');
    if (selectedItem) {
      openMessageSeller(selectedItem.id);
    }
  });
}

window.openItemDetail = function (id) {
  const item = marketplaceItems.find(it => it.id == id);
  if (!item) return;

  selectedItem = item;
  const modal = document.getElementById('itemDetailModal');
  if (!modal) return;

  document.getElementById('modalDetailTitle').textContent = item.title;
  document.getElementById('modalDetailCategory').textContent = item.categoryLabel || item.category;
  document.getElementById('modalDetailPrice').textContent = `₹${item.price}`;
  document.getElementById('modalDetailCondition').textContent = item.condition;
  document.getElementById('modalDetailDesc').textContent = item.description || 'No additional description provided.';
  document.getElementById('modalDetailSeller').textContent = item.seller_name;
  document.getElementById('modalDetailPin').textContent = `PIN: ${item.seller_pin}`;
  document.getElementById('modalDetailPhone').textContent = item.seller_phone;

  const initials = (item.seller_name || 'SC')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  document.getElementById('modalDetailAvatar').textContent = initials;

  modal.classList.remove('hidden');
};

/**
 * 9. Message Seller Modal
 */
function bindMessageModal() {
  const modal = document.getElementById('messageSellerModal');
  if (!modal) return;

  modal.querySelectorAll('.close-msg-btn').forEach(btn => {
    btn.addEventListener('click', () => modal.classList.add('hidden'));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Quick Chips
  const chips = modal.querySelectorAll('.quick-chip');
  const textarea = document.getElementById('sellerMsgText');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (textarea) {
        textarea.value = chip.textContent;
        textarea.focus();
      }
    });
  });

  const sendBtn = document.getElementById('btnSendSellerMessage');
  sendBtn?.addEventListener('click', () => {
    const text = textarea?.value.trim();
    if (!text) {
      showToast('Please type a message before sending.');
      return;
    }

    modal.classList.add('hidden');
    if (textarea) textarea.value = '';
    showToast(`Message sent to seller (${selectedItem?.seller_name || 'Student'}).`);
  });
}

window.openMessageSeller = function (id) {
  const item = marketplaceItems.find(it => it.id == id);
  if (!item) return;

  selectedItem = item;
  const modal = document.getElementById('messageSellerModal');
  if (!modal) return;

  document.getElementById('msgSellerName').textContent = item.seller_name;
  document.getElementById('msgItemTitle').textContent = item.title;

  modal.classList.remove('hidden');
  document.getElementById('sellerMsgText')?.focus();
};

/**
 * 10. Escape HTML Helper
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 11. Toast Notification Helper
 */
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;

  const msgEl = document.getElementById('toastMsg');
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');

  clearTimeout(window._mktToastTimeout);
  window._mktToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
