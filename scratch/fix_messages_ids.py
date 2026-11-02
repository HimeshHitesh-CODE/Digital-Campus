import os

messages_html_path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\messages.html'
messages_js_path = r'C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\frontend\screens\02-student-portal\messages.js'

with open(messages_html_path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add threadsListContainer id
c = c.replace('<div class="flex flex-col gap-2.5 pt-1">', '<div class="flex flex-col gap-2.5 pt-1" id="threadsListContainer">', 1)

# 2. Add activeChatAvatar id
c = c.replace('<div class="w-13 h-13 rounded-full text-white font-dg text-2xl flex items-center justify-center font-extrabold shadow-[0_4px_12px_rgba(16,185,129,0.4)]"', '<div id="activeChatAvatar" class="w-13 h-13 rounded-full text-white font-dg text-2xl flex items-center justify-center font-extrabold shadow-[0_4px_12px_rgba(16,185,129,0.4)]"', 1)

# 3. Add activeChatName id
c = c.replace('<span class="font-dg text-2xl text-emerald-950 font-extrabold truncate">GONA LAXMI NARASIMHA SWAMI</span>', '<span id="activeChatName" class="font-dg text-2xl text-emerald-950 font-extrabold truncate">GONA LAXMI NARASIMHA SWAMI</span>', 1)

# 4. Add activeChatBadge id
c = c.replace('<span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-dg text-xs font-bold hidden sm:inline">Idea Hub Collab</span>', '<span id="activeChatBadge" class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-dg text-xs font-bold hidden sm:inline">Idea Hub Collab</span>', 1)

# 5. Add activeChatPin id
c = c.replace('<span class="font-bold">PIN: 24259-CS-001</span>', '<span id="activeChatPin" class="font-bold">PIN: 24259-CS-001</span>', 1)

# 6. Add chatMessageStream id
c = c.replace('<div class="flex-grow py-5 flex flex-col gap-4 overflow-y-auto pr-1">', '<div id="chatMessageStream" class="flex-grow py-5 flex flex-col gap-4 overflow-y-auto pr-1">', 1)

# 7. Add chatSendBtn id
c = c.replace('class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-dg text-lg font-bold transition-all shrink-0 shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95" style="background: linear-gradient(135deg, #10b981, #059669);" type="submit"', 'id="chatSendBtn" class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-white font-dg text-lg font-bold transition-all shrink-0 shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.45)] hover:scale-105 active:scale-95" style="background: linear-gradient(135deg, #10b981, #059669);" type="submit"', 1)

# Also wire "View Portal" link to attendance
c = c.replace('href="javascript:void(0)" style="background: linear-gradient(135deg, #10b981, #059669);"', 'href="./attendance.html" style="background: linear-gradient(135deg, #10b981, #059669);"', 1)

with open(messages_html_path, 'w', encoding='utf-8') as f:
    f.write(c)

# Now update messages.js to query '#threadsListContainer article'
with open(messages_js_path, 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace(".flex.flex-col.gap-2.overflow-y-auto article", "#threadsListContainer article")

with open(messages_js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Messages HTML and JS successfully updated with robust selectors!")
