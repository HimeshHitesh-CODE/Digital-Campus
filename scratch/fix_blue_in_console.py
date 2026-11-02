path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\04-hod-portal\hod-dashboard.html'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold tracking-wide shadow-md shadow-blue-500/20 transition-all active:scale-95',
    'from-[#003519] via-[#047857] to-[#10b981] hover:opacity-95 text-white text-xs font-bold tracking-wide shadow-md shadow-emerald-500/20 transition-all active:scale-95'
)

c = c.replace('>? Sync All 180 Now<', '>⚡ Sync All 180 Now<')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated blue classes in hod-dashboard.html successfully!")
