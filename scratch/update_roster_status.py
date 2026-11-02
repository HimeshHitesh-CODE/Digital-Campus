roster_js_path = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\security-roster.js"
with open(roster_js_path, "r", encoding="utf-8") as f:
    rjs = f.read()

# Update status check in table row generator
old_mfa = r"const mfa = s\.mfaStatus \|\| 'Active FIDO2';"
new_mfa = """const isActivated = s.is_registered === true || s.is_registered === 1 || localStorage.getItem(`activated_${s.pin}`) === 'true';
    const statusText = isActivated ? 'VERIFIED & ACTIVE' : 'PRE-ALLOCATED';
    const statusClass = isActivated ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-50 text-amber-900 border-amber-200/80';
    const dotClass = isActivated ? 'bg-emerald-700 animate-pulse' : 'bg-amber-500';"""

if "const mfa = s.mfaStatus" in rjs:
    rjs = rjs.replace("const mfa = s.mfaStatus || 'Active FIDO2';", new_mfa)
    rjs = rjs.replace("${mfa}", "${statusText}")
    rjs = rjs.replace("bg-emerald-100 text-emerald-900 border border-emerald-300", "${statusClass} border")
    rjs = rjs.replace("bg-emerald-700 animate-pulse", "${dotClass}")

with open(roster_js_path, "w", encoding="utf-8") as f:
    f.write(rjs)

print("security-roster.js status logic updated!")
