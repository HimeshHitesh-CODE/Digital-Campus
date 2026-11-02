with open(r'frontend/js/dc-dynamic-island.js', 'r', encoding='utf-8') as f:
    text = f.read()

one_time_sync_code = """
  // -------------------------------------------------------------
  // ONE-TIME SYNC ON LOAD (Azure SBTET Gateway Handshake)
  // -------------------------------------------------------------
  function checkOneTimeSyncOnLoad() {
    if (sessionStorage.getItem('campus_one_time_azure_sync_done') === 'true') return;

    setTimeout(() => {
      sessionStorage.setItem('campus_one_time_azure_sync_done', 'true');
      
      // Update global header with Azure live node pill
      const brandMeta = document.getElementById('headerBrandMeta');
      if (brandMeta && !document.getElementById('headerAzurePill')) {
        const pill = document.createElement('span');
        pill.id = 'headerAzurePill';
        pill.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold ml-2';
        pill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span><span>Azure Sync: Live</span>';
        brandMeta.appendChild(pill);
      }

      // Show toast if notification container exists
      const toast = document.getElementById('toastNotification');
      const msgEl = document.getElementById('toastMsg');
      if (toast && msgEl) {
        msgEl.textContent = '☁️ Azure SBTET Gateway: 180 department nodes live synchronized (Scheme C-24).';
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3500);
      }
    }, 600);
  }
"""

if 'checkOneTimeSyncOnLoad()' not in text:
    text = text.replace('initDynamicIsland();', 'initDynamicIsland();\n  checkOneTimeSyncOnLoad();')
    text += one_time_sync_code

with open(r'frontend/js/dc-dynamic-island.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Added One-Time Azure Sync on Load to dc-dynamic-island.js!")
