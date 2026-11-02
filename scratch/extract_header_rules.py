with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/css/dc-global-theme.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Lines 175-265:")
for i in range(175, min(265, len(lines))):
    print(lines[i], end='')

print("\nLines 580-660:")
for i in range(580, min(660, len(lines))):
    print(lines[i], end='')
