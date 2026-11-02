---
name: Academic Heritage Sanctuary
colors:
  surface: '#fdf9f0'
  surface-dim: '#dddad1'
  surface-bright: '#fdf9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ea'
  surface-container: '#f1eee5'
  surface-container-high: '#ece8df'
  surface-container-highest: '#e6e2d9'
  on-surface: '#1c1c16'
  on-surface-variant: '#404941'
  inverse-surface: '#31302b'
  inverse-on-surface: '#f4f0e7'
  outline: '#717971'
  outline-variant: '#c0c9bf'
  surface-tint: '#306a44'
  primary: '#003519'
  on-primary: '#ffffff'
  primary-container: '#0f4d2a'
  on-primary-container: '#81bd90'
  inverse-primary: '#97d4a6'
  secondary: '#526259'
  on-secondary: '#ffffff'
  secondary-container: '#d5e7db'
  on-secondary-container: '#58685f'
  tertiary: '#233027'
  on-tertiary: '#ffffff'
  tertiary-container: '#39463c'
  on-tertiary-container: '#a5b3a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b3f1c1'
  primary-fixed-dim: '#97d4a6'
  on-primary-fixed: '#00210d'
  on-primary-fixed-variant: '#14512e'
  secondary-fixed: '#d5e7db'
  secondary-fixed-dim: '#b9cbbf'
  on-secondary-fixed: '#101f17'
  on-secondary-fixed-variant: '#3a4a42'
  tertiary-fixed: '#d7e6d8'
  tertiary-fixed-dim: '#bbcabd'
  on-tertiary-fixed: '#121e16'
  on-tertiary-fixed-variant: '#3d4a40'
  background: '#fdf9f0'
  on-background: '#1c1c16'
  surface-variant: '#e6e2d9'
typography:
  display-hero:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  title-editorial:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  script-accent:
    fontFamily: Caveat
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-code:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-code-sm:
    fontFamily: IBM Plex Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-ui:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
This design system articulates an institutional, calm, and deeply trustworthy digital campus environment. Rooted in classical collegiate gravitas yet elevated by modern utility, the interface balances academic heritage with transparent clarity.

The aesthetic fuses warm parchment materiality with disciplined editorial structure:
- **Atmosphere:** Scholarly, unhurried, reassuring, and precise. It rejects chaotic neon gamification and tech-startup restlessness in favor of a collegiate library feel.
- **Visual Stance:** Tactile yet minimal. High readability across dense academic metrics, regulatory thresholds (e.g., biometric attendance, SBTET regulations), and administrative logs.
- **Copy & Voice:** Professional and encouraging. Institutional titles use Title Case, while instructional and supportive copy strictly adheres to sentence case. Emojis are forbidden; meaning and status are mediated strictly via precise Lucide stroke iconography and semantic color washes.

## Colors
The color architecture relies on organic earth tones, deep ivy greens, and warm linen surfaces.

### Light Palette (Default)
- **Canvas:** `#F6F2E9` — Warm parchment baseline for the page backdrop.
- **Surface:** `#FFFDF8` — Warm milk-white container tier for cards and structural blocks.
- **Raised:** `#FFFFFF` — Pure white for elevated sub-tiles, modals, and floating docks.
- **Primary Accent:** `#0F4D2A` (Deep Forest Ivy) — Signifies authority, focus, and confirmed states.
- **Primary Hover:** `#0A3B20` — Grounded interaction feedback.
- **On-Primary:** `#F6F2E9` — Warm parchment text on dark green fills.
- **Tint / Fill:** `#DCEBDD` — Soft sage wash for chips, selected segments, and icon backdrops.
- **Ink Tiers:**
  - `ink`: `#14201A` — High-contrast primary reading text and metric integers.
  - `ink-2`: `#44544B` — Secondary labels, table headers, and structural metadata.
  - `ink-3`: `#5E6D64` — Footnotes, captions, and muted timestamps.
  - `hairline`: `rgba(20, 32, 26, 0.10)` — Soft divider borders and structural guides.

### Semantic Status
- **Success:** `#1F7A4D` — Academic milestones, passed subjects, safe attendance.
- **Warning:** `#8A5A00` over `#F8E8C4` — Condonation risks, pending approvals, fee reminders.
- **Danger:** `#B42318` over `#FBE3DF` — Biometric detainment risk, backlogs, critical alerts.
- **Info:** `#2F5D8A` over `#E1ECF6` — State board circulars, gateway sync notices.

### Dark Theme Palette
- **Canvas:** `#0D1411`
- **Surface:** `#131C17`
- **Raised:** `#19241E`
- **Primary:** `#4CC38A`
- **On-Primary:** `#06130C`
- **Tint:** `#1F3A2C`
- **Ink Tiers:** `ink` `#ECEEE6`, `ink-2` `#B0BBB3`, `ink-3` `#8A978F`, `hairline` `rgba(255, 255, 255, 0.08)`.

## Typography
The system employs a purposeful typographic tri-union:
1. **Editorial Display (`Newsreader` / Fraunces family style):** Chosen for large student monikers, module titles, and primary KPI figures (e.g., `27.78%`, `9.11`). Evokes academic publishing and official degree certificates.
2. **Body & UI Interface (`Plus Jakarta Sans` / Figtree family style):** Clean, open letterforms with humanist clarity. Ensures high legibility on dashboard subtext, regulatory lists, and system messages.
3. **Data & Institutional Identifiers (`IBM Plex Mono`):** Strictly deployed for Hall Ticket Numbers, SBTET PINs (`24259-CS-025`), Course Codes (`SC-401`), and real-time biometric timestamp logs.
4. **Calligraphic Motto (`Caveat`):** Reserved exclusively for collegiate ethos taglines (such as *"Learn · Grow · Achieve"*), providing human warmth above architectural hero graphics.

## Layout & Spacing
Built on a strict 8px incremental baseline, the layout favors generous inner breathing room while retaining structured academic density.

- **Container Bounds:** Standard web viewports clamp at `1200px` max-width centered on the parchment canvas.
- **Grid Structure:** 12-column responsive fluid grid.
  - Desktop (`≥1024px`): 12 columns, 24px (`1.5rem`) gutters, 32px (`2rem`) margins.
  - Tablet (`768px - 1023px`): 8 columns, 16px (`1rem`) gutters, 24px (`1.5rem`) margins.
  - Mobile (`<768px`): 4 columns, 12px gutters, 16px (`1rem`) margins.
- **Rhythm Rules:** Vertical metric stacks (such as big numbers paired with secondary labels) use `space-xs` (4px) to `space-sm` (8px). Structural grid modules and dashboard sections separate with `space-xl` (40px).

## Elevation & Depth
Depth in this system is deliberately restrained to preserve an authentic archival feel. Floating card stacks with heavy drop shadows are forbidden.

- **Resting Layer (Surface Cards & Tiles):** Cards sit flush against the canvas. Visual delineation is achieved via surface tonal shifts (`#FFFDF8` against canvas `#F6F2E9`) and an ultra-subtle hairline rule (`1px solid rgba(20, 32, 26, 0.10)`). No shadow at rest.
- **Level 1 Elevation (Floating Dock & Overlays):** Applied strictly to the floating bottom navigation dock, dropdown menus, and popover dialogs:
  `box-shadow: 0 8px 32px -4px rgba(20, 32, 26, 0.08), 0 2px 8px -2px rgba(20, 32, 26, 0.04);`
- **Inner Raised Blocks:** Internal sub-cards within larger containers use a pure `#FFFFFF` background with an inset or flush boundary rather than elevation lift.

## Shapes
Geometry is smooth and organic, balancing soft tactile geometry with structured grids.

- **Primary Cards & Large Modules:** Standardized to `20px` radius for calm, friendly spatial bounding.
- **Internal Tiles & Metric Cubes:** Standardized to `14px` radius for nested containment.
- **Controls, Badges & Buttons:** Full pill geometry (`999px`) across primary action buttons, status chips, segmented calendar switchers, and the signature bottom navigation dock.
- **Input Fields & Small Dropdowns:** `10px` to `12px` radius.

## Components

### Buttons & Interactive Controls
- **Primary Button:** Pill geometry (`rounded: 999px`), `#0F4D2A` background, `#F6F2E9` typography. Hover shifts to `#0A3B20` with zero scaling gimmick. Padding: `10px 24px`.
- **Ghost / Tertiary Button:** Transparent fill, `1px solid rgba(20, 32, 26, 0.15)`, text in `ink`.
- **Directional Hints:** Action buttons (e.g., *View Attendance →*) incorporate thin Lucide directional stroke arrows with a 4px gap.

### Floating Navigation Dock
- Centered fixed capsule (`border-radius: 999px`) styled in `#FFFFFF` with Level 1 ambient elevation and a hairline outline.
- Active items display an olive-pill highlight (`#708226` or `#0F4D2A`) with high-contrast text and a small micro-dot anchor.
- Inactive items display `ink-2` Lucide stroke icons with subtle vertical hairline dividers between high-frequency groups.

### KPI & Attendance Metric Tiles
- Internal nested cards set to `14px` border radius on white `#FFFFFF` surface.
- Top indicator features a light semantic icon pill (`#DCEBDD` with green Lucide line art).
- Primary numbers rendered in display serif at `28px` to `36px`, paired with IBM Plex Mono for target indicators and thresholds (e.g., `50 Present / 135 Target`).
- Subtle SVG trend sparklines rendered with a 2px stroke and smooth bezier paths.

### Academic Result & Attendance Tables
- Header row styled in `ink-2` at 12px bold with hairline bottom border.
- Monospaced Subject Codes (`SC-401`) set in `IBM Plex Mono`.
- Clear semantic status pill badges: green for "PASS", red wash for "DETAINED".

### Chips & Status Badges
- Pill-shaped (`999px`), padding `4px 12px`.
- Status Warning: Amber tint `#F8E8C4` with `#8A5A00` text.
- Status Detainment Alert: Soft rose `#FBE3DF` with `#B42318` text and Lucide alert triangle.
- Live Endpoint Pill: Small pulsing green indicator circle beside `label-code-sm` text.

### Inputs & Search
- Background `#FFFDF8`, hairline border `1px solid rgba(20, 32, 26, 0.12)`, radius `10px`. Focused state replaces border with `1.5px solid #0F4D2A` without outer glow rings.