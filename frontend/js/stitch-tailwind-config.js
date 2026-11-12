/**
 * Master Tailwind Configuration for Samskruti Digital Campus (Code 259)
 * Kinetic Bento Tactile Design System Engine (S13, S14, S15 Spec)
 * Strictly Plus Jakarta Sans across all typography with tabular-nums for numeric cells.
 */
window.tailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        code: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        script: ['"Caveat"', 'cursive'],
        "display-hero": ['"Plus Jakarta Sans"', 'sans-serif'],
        "title-card": ['"Plus Jakarta Sans"', 'sans-serif'],
        "body-default": ['"Plus Jakarta Sans"', 'sans-serif'],
        "body-small": ['"Plus Jakarta Sans"', 'sans-serif'],
        "code-mono": ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        "code-mono-sm": ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif']
      },
      fontSize: {
        "display-hero": ['52px', { lineHeight: '56px', letterSpacing: '-0.03em', fontWeight: '500' }],
        "display-hero-mobile": ['36px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '500' }],
        "stat-metric-lg": ['48px', { lineHeight: '52px', letterSpacing: '-0.03em', fontWeight: '500' }],
        "stat-metric-md": ['40px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '500' }],
        "title-card": ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '500' }],
        "body-default": ['15px', { lineHeight: '22px', fontWeight: '400' }],
        "body-small": ['13px', { lineHeight: '18px', fontWeight: '400' }],
        "unit-label": ['14px', { lineHeight: '20px', fontWeight: '400' }],
        "code-mono": ['13px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        "code-mono-sm": ['11px', { lineHeight: '14px', letterSpacing: '0.04em', fontWeight: '500' }]
      },
      colors: {
        // Stitch Material / Kinetic Bento Surfaces
        "surface": "var(--surface)",
        "surface-dim": "var(--surface-dim)",
        "surface-bright": "var(--surface-bright)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "surface-variant": "var(--surface-variant)",

        // Typography & Inks
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "outline": "var(--outline)",
        "outline-variant": "var(--outline-variant)",
        "hairline": "var(--hairline)",

        // Primary / Signal Lime
        "primary": "var(--primary)",
        "on-primary": "var(--on-primary)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",

        // Secondary / Signal Lavender
        "secondary": "var(--secondary)",
        "on-secondary": "var(--on-secondary)",
        "secondary-container": "var(--secondary-container)",
        "on-secondary-container": "var(--on-secondary-container)",

        // Error / Status
        "error": "var(--error)",
        "on-error": "var(--on-error)",
        "error-container": "var(--error-container)",
        "on-error-container": "var(--on-error-container)",

        // Core backward-compatible kinetic aliases
        "canvas": "var(--color-canvas)",
        "card": "var(--color-card)",
        "feature-card": "var(--color-feature-card)",
        "ink": "var(--color-ink)",
        "muted": "var(--color-muted)",
        "lime": "var(--color-lime)",
        "lime-ink": "var(--color-lime-ink)",
        "lavender": "var(--color-lavender)",

        // Semantic status aliases
        "danger": "var(--color-danger-ink)",
        "danger-bg": "var(--color-danger-bg)",
        "warning": "var(--color-warning-ink)",
        "warning-bg": "var(--color-warning-bg)",
        "info": "var(--color-info-ink)",
        "info-bg": "var(--color-info-bg)",
        "success": "var(--color-lime)",
        "success-bg": "var(--color-lime)"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
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
