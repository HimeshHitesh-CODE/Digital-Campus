/**
 * Samskruti College Student Marketplace & Exchange Controller
 * Dynamic fill and full interactive logic for Stitch Campus Connect Marketplace
 */

document.addEventListener('DOMContentLoaded', () => {
  initMarketplace();
});

let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'recent';

function initMarketplace() {
  bindStudentMetadata();
  bindFilterPills();
  bindSearchAndClear();
  bindSortSelect();
  bindSellModal();
  bindDmSellerButtons();
}

/**
 * 1. Bind Student Header Metadata
 */
function bindStudentMetadata() {
  if (typeof StitchState === 'undefined') return;
  const user = StitchState.getUser();

  const metaEl = document.getElementById('mktStudentMeta');
  if (metaEl) {
    metaEl.textContent = `${user.name.toUpperCase()} (PIN: ${user.pin || '24259-CS-025'})`;
  }
}

/**
 * 2. Category Filter Pills
 */
function bindFilterPills() {
  const pills = document.querySelectorAll('.category-pill');
  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => {
        p.removeAttribute('style');
        p.className = 'category-pill px-5 py-2 rounded-full font-darker font-semibold text-lg bg-surface-container-lowest text-on-surface-variant hover:text-emerald-800 hover:bg-emerald-50/70 border border-emerald-900/10 transition-all cursor-pointer';
      });

      pill.className = 'category-pill px-5 py-2 rounded-full font-darker font-bold text-lg transition-all text-white shadow-sm cursor-pointer';
      pill.style.background = 'linear-gradient(135deg, #047857, #10b981)';
      pill.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.35)';
      pill.style.border = '1px solid rgba(110, 231, 183, 0.5)';

      currentCategory = pill.getAttribute('data-cat') || 'all';
      applyFilters();
    });
  });
}

/**
 * 3. Search Bar and Clear Action
 */
function bindSearchAndClear() {
  const searchInput = document.getElementById('market-search');
  const clearBtn = document.getElementById('clear-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    if (clearBtn) {
      if (searchQuery.length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
    applyFilters();
  });

  clearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearBtn.classList.add('hidden');
    applyFilters();
    searchInput.focus();
  });
}

/**
 * 4. Sort Dropdown
 */
function bindSortSelect() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFilters();
  });
}

/**
 * 5. Master Filter & Sort Application
 */
function applyFilters() {
  const cards = document.querySelectorAll('#marketplace-cards article');
  let visibleCount = 0;

  // Convert to array for sorting
  const container = document.getElementById('marketplace-cards');
  const cardArray = Array.from(cards);

  cardArray.forEach(card => {
    const cardCat = card.getAttribute('data-category') || '';
    const textContent = card.textContent.toLowerCase();

    const matchesCat = (currentCategory === 'all' || cardCat === currentCategory);
    const matchesSearch = (!searchQuery || textContent.includes(searchQuery));

    if (matchesCat && matchesSearch) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Re-sort visible cards if container exists
  if (container) {
    cardArray.sort((a, b) => {
      const priceA = parseInt(a.getAttribute('data-price') || '0', 10);
      const priceB = parseInt(b.getAttribute('data-price') || '0', 10);

      if (currentSort === 'price-low') {
        return priceA - priceB;
      } else if (currentSort === 'price-high') {
        return priceB - priceA;
      }
      return 0;
    });

    cardArray.forEach(c => container.appendChild(c));
  }
}

/**
 * 6. DM Seller Action
 */
function bindDmSellerButtons() {
  document.addEventListener('click', (e) => {
    const dmBtn = e.target.closest('.dm-seller-btn, button[onclick*="openDM"]');
    if (!dmBtn) return;

    e.preventDefault();
    const card = dmBtn.closest('article');
    const sellerName = card ? (card.querySelector('.seller-name, span.font-bold')?.textContent.trim() || 'Seller') : 'Seller';
    const sellerPin = card ? (card.querySelector('.seller-pin, span.text-stone-500, span.text-on-surface-variant')?.textContent.trim() || '') : '';

    showToast(`Redirecting to encrypted campus chat with ${sellerName}...`);

    setTimeout(() => {
      window.location.href = `./messages.html?seller=${encodeURIComponent(sellerName)}&pin=${encodeURIComponent(sellerPin)}`;
    }, 1000);
  });
}

/**
 * 7. Sell an Item Modal Logic
 */
function bindSellModal() {
  const openBtn = document.getElementById('open-sell-modal');
  const closeBtn = document.getElementById('close-sell-modal');
  const cancelBtn = document.getElementById('cancel-sell-btn');
  const modal = document.getElementById('sell-modal');
  const modalBackdrop = document.getElementById('sell-modal-backdrop');
  const modalContent = document.getElementById('sell-modal-content') || document.getElementById('sell-modal-card');
  const form = document.getElementById('sell-form');

  function openModal() {
    if (!modal) return;
    modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    if (modalBackdrop) modalBackdrop.classList.remove('opacity-0', 'pointer-events-none');
    if (modalContent) {
      modalContent.classList.remove('opacity-0', 'scale-95');
      modalContent.classList.add('opacity-100', 'scale-100');
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('opacity-0', 'pointer-events-none');
    if (modalBackdrop) modalBackdrop.classList.add('opacity-0', 'pointer-events-none');
    if (modalContent) {
      modalContent.classList.remove('opacity-100', 'scale-100');
      modalContent.classList.add('opacity-0', 'scale-95');
    }
    setTimeout(() => {
      modal.classList.add('hidden');
      if (form) form.reset();
    }, 200);
  }

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('item-title')?.value || form.querySelector('input[placeholder*="Drafter"]')?.value || 'Listed Campus Item';
      const cat = document.getElementById('item-category')?.value || form.querySelector('select')?.value || 'textbooks';
      const price = document.getElementById('item-price')?.value || form.querySelector('input[type="number"]')?.value || '150';
      const cond = document.getElementById('item-condition')?.value || form.querySelector('input[placeholder*="Like New"]')?.value || 'Good';
      const desc = document.getElementById('item-desc')?.value || '';

      const user = StitchState ? StitchState.getUser() : { name: 'Karnati Himesh', pin: '24259-CS-025', branch: 'CSE' };

      // Prepend to Marketplace grid
      prependMarketItem({
        title,
        category: cat,
        price,
        condition: cond,
        desc,
        sellerName: user.name || 'Karnati Himesh',
        sellerPin: user.pin || '24259-CS-025',
        sellerDept: 'CSE Dept'
      });

      // Increment surplus count
      const countEl = document.getElementById('allSurplusCount');
      if (countEl) {
        countEl.textContent = 'All Surplus (49)';
      }

      closeModal();
      showToast(`Item "${title}" successfully listed in Student Surplus Exchange!`);
    });
  }
}

function prependMarketItem(data) {
  const container = document.getElementById('marketplace-cards');
  if (!container) return;

  const card = document.createElement('article');
  card.className = 'card-volumetric rounded-3xl bg-surface-container-lowest overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1';
  card.setAttribute('data-category', data.category);
  card.setAttribute('data-price', data.price);

  card.innerHTML = `
    <div class="relative h-56 overflow-hidden bg-surface-container-low">
      <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80" 
           alt="${data.title}" 
           class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div class="absolute top-3 left-3 flex gap-2">
        <span class="px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-200 font-mono text-xs font-semibold">New Listing</span>
        <span class="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-emerald-900 font-bold text-xs">${data.condition}</span>
      </div>
      <div class="absolute top-3 right-3">
        <span class="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[11px]">Ref 24259-NEW</span>
      </div>
    </div>
    <div class="p-5 flex-1 flex flex-col justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <div class="flex items-baseline justify-between">
          <span class="font-darker text-3xl font-extrabold text-emerald-900">₹${data.price}</span>
          <span class="text-xs font-bold text-stone-500 uppercase tracking-wide">Campus Verified</span>
        </div>
        <h3 class="font-darker text-2xl font-bold text-on-surface leading-snug">${data.title}</h3>
        <p class="text-xs text-on-surface-variant line-clamp-2">${data.desc || 'Clean and certified by student seller for campus exchange.'}</p>
      </div>
      <div class="pt-3 border-t border-emerald-900/10 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">KH</div>
          <div class="flex flex-col leading-none">
            <span class="font-bold text-xs text-on-surface">${data.sellerName}</span>
            <span class="text-[10px] text-stone-500">${data.sellerPin}</span>
          </div>
        </div>
        <button type="button" class="dm-seller-btn px-4 py-1.5 rounded-full bg-primary hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition-all">
          <span>DM Seller</span>
          <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>
    </div>
  `;

  container.insertBefore(card, container.firstChild);
}

/**
 * 8. Toast Helper
 */
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) return;

  const msgEl = document.getElementById('toast-message');
  if (msgEl) msgEl.textContent = message;

  toast.classList.remove('hidden');

  clearTimeout(window._mktToastTimeout);
  window._mktToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
