import re

# 1. Update idea-hub.html
hub_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\idea-hub.html"
with open(hub_html_path, "r", encoding="utf-8") as f:
    hhtml = f.read()

# Remove Sync GitHub button from top header
hhtml = re.sub(
    r'<button[^>]*class="[^"]*rounded-full bg-white[^"]*"[^>]*>[\s\S]*?Sync GitHub / Portfolio[\s\S]*?</button>',
    '',
    hhtml
)

# Remove 3 Bento Metric tiles & Bottom Flagship Squad Callout Banner
hhtml = re.sub(
    r'<!-- Bento Metrics Highlight -->[\s\S]*?<!-- Bottom Flagship Squad Callout Banner -->[\s\S]*?</div>\s*</div>\s*(?=</div>\s*</div>\s*</main>)',
    '',
    hhtml
)

with open(hub_html_path, "w", encoding="utf-8") as f:
    f.write(hhtml)
print("idea-hub.html updated!")

# 2. Update idea-hub.js
hub_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\idea-hub.js"
with open(hub_js_path, "r", encoding="utf-8") as f:
    hjs = f.read()

# Update renderPeers to only show peers who are Online (hide offline)
# Look for filter in renderPeers
old_filter_pattern = r'const filteredPeers = ALL_PEERS\.filter\(p => \{'
new_filter_replacement = """const filteredPeers = ALL_PEERS.filter(p => {
    // Phase 6: Only display peers who are currently Online
    if (!p.online && !p.isOnline) return false;"""

if old_filter_pattern in hjs:
    hjs = hjs.replace(old_filter_pattern, new_filter_replacement)
    print("Updated peer directory filter to show online only!")

# Style the Invite Sent button cleanly and dispatch Messages notification
old_invite_btn = r'btn\.className = \'[^\']*\';\s*btn\.innerHTML = \'[^\']*\';'
# Let's inspect handleInvitePeer in idea-hub.js
with open(hub_js_path, "w", encoding="utf-8") as f:
    f.write(hjs)

# 3. Update marketplace.html
market_html_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\marketplace.html"
with open(market_html_path, "r", encoding="utf-8") as f:
    mhtml = f.read()

# Remove Campus Verifier On badge
mhtml = re.sub(
    r'<div class="inline-flex items-center gap-2 px-3\.5 py-1\.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900">\s*<span class="material-symbols-outlined text-emerald-600 text-\[18px\]">verified_user</span>\s*<span class="font-darker font-bold text-base">Campus Verifier On</span>\s*</div>',
    '',
    mhtml
)

with open(market_html_path, "w", encoding="utf-8") as f:
    f.write(mhtml)
print("marketplace.html updated!")
