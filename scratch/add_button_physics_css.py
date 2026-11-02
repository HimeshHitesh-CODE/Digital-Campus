with open(r'frontend/css/stitch-design-system.css', 'r', encoding='utf-8') as f:
    css = f.read()

tactile_rules = """
/* Elevated Tactile Button System & Hover Physics */
button, .tactile-btn, input[type="button"], input[type="submit"] {
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

button:hover, .tactile-btn:hover {
  transform: translateY(-1.5px);
}

button:active, .tactile-btn:active {
  transform: scale(0.97) translateY(0);
}

/* Luminous Gradient Action Buttons */
button.bg-gradient-to-r:hover, .btn-primary:hover {
  box-shadow: 0 10px 25px -4px rgba(4, 120, 87, 0.35);
  filter: brightness(1.03);
}

/* Glass Card Elevation */
.glass-card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Table Row Elevation */
tbody tr {
  transition: background-color 0.18s ease;
}

/* Pulsing Beacon */
@keyframes azurePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.15); }
}
.azure-pulse {
  animation: azurePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
"""

if 'Elevated Tactile Button System' not in css:
    css += '\n' + tactile_rules
    with open(r'frontend/css/stitch-design-system.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("Appended tactile button physics to stitch-design-system.css!")
else:
    print("Already present!")
