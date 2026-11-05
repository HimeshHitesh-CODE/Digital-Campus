/**
 * Master Tailwind Configuration for Samskruti Digital Campus (Code 259)
 * Kinetic Bento Design System with Electric Lime & Tactile Surfaces
 */
window.tailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        code: ['"IBM Plex Mono"', 'monospace'],
        script: ['"Caveat"', 'cursive']
      },
      colors: {
        // Core kinetic bento tokens via CSS variables
        "canvas": "var(--color-canvas)",
        "card": "var(--color-card)",
        "feature-card": "var(--color-feature-card)",
        "ink": "var(--color-ink)",
        "muted": "var(--color-muted)",
        "hairline": "var(--color-hairline)",
        "lime": "var(--color-lime)",
        "lime-ink": "var(--color-lime-ink)",
        "lavender": "var(--color-lavender)",

        // Stitch compatibility semantic aliases
        "primary": "var(--color-lime)",
        "primary-container": "var(--color-lime)",
        "on-primary": "var(--color-lime-ink)",
        "on-primary-container": "var(--color-lime-ink)",
        "secondary": "var(--color-muted)",
        "secondary-container": "var(--color-card-subtle)",
        "surface": "var(--color-card)",
        "surface-container": "var(--color-card)",
        "surface-container-low": "var(--color-canvas)",
        "surface-container-high": "var(--color-card-subtle)",
        "surface-container-highest": "var(--color-card-subtle)",
        "on-surface": "var(--color-ink)",
        "on-surface-variant": "var(--color-muted)",
        "background": "var(--color-canvas)",
        "on-background": "var(--color-ink)",

        // Status colors
        "danger": "var(--color-danger-ink)",
        "danger-bg": "var(--color-danger-bg)",
        "warning": "var(--color-warning-ink)",
        "warning-bg": "var(--color-warning-bg)",
        "info": "var(--color-info-ink)",
        "info-bg": "var(--color-info-bg)",
        "success": "var(--color-lime)",
        "success-bg": "var(--color-lime)",
        "error": "var(--color-danger-ink)",
        "error-container": "var(--color-danger-bg)"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "card": "28px",
        "28": "28px",
        "pill": "9999px",
        "full": "9999px"
      },
      spacing: {
        "gutter": "1rem",
        "gutter-tablet": "1rem",
        "gutter-desktop": "1rem",
        "margin": "1rem",
        "margin-tablet": "1.5rem",
        "margin-desktop": "2rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem"
      }
    }
  }
};

if (typeof tailwind !== 'undefined') {
  tailwind.config = window.tailwindConfig;
}
