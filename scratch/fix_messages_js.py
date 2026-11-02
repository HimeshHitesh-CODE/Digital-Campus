messages_js_path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\messages.js'

with open(messages_js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace bindAuxiliaryActions and checkUrlParams with robust implementations
old_aux = """function bindAuxiliaryActions() {
  document.querySelector('button:has(span:contains("attach_file"))')?.addEventListener('click', () => {
    showToast('Encrypted document & image attachment drawer ready (Max 15MB)');
  });

  document.querySelector('button:has(span:contains("sentiment_satisfied"))')?.addEventListener('click', () => {
    showToast('Campus stickers & academic emojis unlocked: 🎓 📚 💻 ⚡');
  });

  document.querySelector('button:has(span:contains("call")), button:contains("Call")')?.addEventListener('click', () => {
    showToast('Establishing peer voice session via SCET campus VoIP relay...');
  });
}"""

new_aux = """function bindAuxiliaryActions() {
  document.querySelectorAll('button').forEach(btn => {
    const text = btn.textContent || '';
    const span = btn.querySelector('.material-symbols-outlined');
    const icon = span ? span.textContent.trim() : '';

    if (icon === 'attach_file') {
      btn.addEventListener('click', () => {
        showToast('Encrypted document & image attachment drawer ready (Max 15MB)');
      });
    } else if (icon === 'sentiment_satisfied') {
      btn.addEventListener('click', () => {
        showToast('Campus stickers & academic emojis unlocked: 🎓 📚 💻 ⚡');
      });
    } else if (icon === 'call' || text.includes('Call')) {
      btn.addEventListener('click', () => {
        showToast('Establishing peer voice session via SCET campus VoIP relay...');
      });
    }
  });
}"""

old_url = """function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const peer = params.get('peer');
  const seller = params.get('seller');
  const targetName = peer || seller;

  if (targetName) {
    updateChatHeader({
      name: targetName.toUpperCase(),
      pin: params.get('pin') || 'PIN: 24259-CS-XXX',
      badge: seller ? 'Marketplace Seller' : 'Idea Hub Collab',
      initials: targetName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    });
    showToast(`Encrypted direct message thread opened with ${targetName}`);
  }
}"""

new_url = """function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const peer = params.get('peer');
  const seller = params.get('seller');
  const targetName = peer || seller;

  if (targetName) {
    // If thread exists in list, click it to activate
    const articles = document.querySelectorAll('#threadsListContainer article');
    let matched = false;
    articles.forEach(art => {
      if (art.textContent.toLowerCase().includes(targetName.toLowerCase())) {
        art.click();
        matched = true;
      }
    });

    if (!matched) {
      updateChatHeader({
        name: targetName.toUpperCase(),
        pin: params.get('pin') || 'PIN: 24259-CS-XXX',
        badge: seller ? 'Marketplace Seller' : 'Idea Hub Collab',
        initials: targetName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      });
      showToast(`Encrypted direct message thread opened with ${targetName}`);
    }
  }
}"""

js = js.replace(old_aux, new_aux)
js = js.replace(old_url, new_url)

with open(messages_js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("messages.js cleanly updated!")
