/**
 * Master Tailwind Configuration for Stitch Campus Connect Design System
 * Merges all tokens, colors, fonts, spacing, and border radii across all 7 screens
 */
window.tailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Darker Grotesque"', 'sans-serif'],
        darker: ['"Darker Grotesque"', 'sans-serif'],
        dg: ['"Darker Grotesque"', 'sans-serif'],
        grotesque: ['"Darker Grotesque"', 'sans-serif'],
        editorial: ['"Newsreader"', 'serif'],
        'headline-hero': ['"Newsreader"', '"Darker Grotesque"', 'serif'],
        'title-editorial': ['"Newsreader"', '"Darker Grotesque"', 'serif'],
        'display-hero': ['"Newsreader"', '"Darker Grotesque"', 'serif'],
        'headline-lg': ['"Newsreader"', '"Darker Grotesque"', 'serif'],
        'headline-md': ['"Darker Grotesque"', 'sans-serif'],
        'headline-sm': ['"Darker Grotesque"', 'sans-serif'],
        'body-md': ['"Darker Grotesque"', 'sans-serif'],
        'body-sm': ['"Darker Grotesque"', 'sans-serif'],
        'label-ui': ['"Plus Jakarta Sans"', 'sans-serif'],
        code: ['"IBM Plex Mono"', 'monospace'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        'mono-code': ['"IBM Plex Mono"', 'monospace'],
        'label-code': ['"IBM Plex Mono"', 'monospace'],
        'label-code-sm': ['"IBM Plex Mono"', 'monospace'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      colors: {
        "primary": "#047857",
        "primary-dark": "#047857",
        "primary-light": "#10b981",
        "primary-container": "#0f4d2a",
        "on-primary": "#ffffff",
        "on-primary-container": "#81bd90",
        "primary-fixed": "#b3f1c1",
        "primary-fixed-dim": "#97d4a6",
        "on-primary-fixed": "#00210d",
        "on-primary-fixed-variant": "#14512e",
        "inverse-primary": "#97d4a6",

        "secondary": "#526259",
        "secondary-container": "#d5e7db",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#58685f",
        "secondary-fixed": "#d5e7db",
        "secondary-fixed-dim": "#b9cbbf",
        "on-secondary-fixed": "#101f17",
        "on-secondary-fixed-variant": "#3a4a42",

        "tertiary": "#233027",
        "tertiary-container": "#39463c",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#a5b3a7",
        "tertiary-fixed": "#d7e6d8",
        "tertiary-fixed-dim": "#bbcabd",
        "on-tertiary-fixed": "#121e16",
        "on-tertiary-fixed-variant": "#3d4a40",

        "surface": "#fcfaf6",
        "surface-dim": "#dddad1",
        "surface-bright": "#fcfaf6",
        "surface-variant": "#e6e2d9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f7f5ed",
        "surface-container": "#f1eee5",
        "surface-container-high": "#eae6dd",
        "surface-container-highest": "#e5e3db",
        "on-surface": "#191c1a",
        "on-surface-variant": "#3f4941",
        "inverse-surface": "#31302b",
        "inverse-on-surface": "#f4f0e7",
        "surface-tint": "#059669",

        "background": "#fcfaf6",
        "on-background": "#191c1a",

        "outline": "#717971",
        "outline-variant": "#c0c9bf",

        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        "mint-accent": "#34d399",
        "mint-soft": "#d1fae5",
        "mint-muted": "#ecfdf5",
        "emerald-deep": "#064e3b"
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "sm": "0.25rem",
        "md": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "full": "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "gutter": "1.5rem",
        "margin": "2rem"
      }
    }
  }
};

if (typeof tailwind !== 'undefined') {
  tailwind.config = window.tailwindConfig;
}
