with open('C:/Users/HiteshHimesh/.gemini/antigravity/scratch/Digital-Campus/frontend/css/dc-global-theme.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Lines 260-330:")
for i in range(260, min(330, len(lines))):
    print(lines[i], end='')

print("\nLines 650-730:")
for i in range(650, min(730, len(lines))):
    print(lines[i], end='')
