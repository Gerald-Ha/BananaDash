export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        "bd-bg": "var(--bd-bg)",
        "bd-surface": "var(--bd-surface)",
        "bd-surface-2": "var(--bd-surface-2)",
        "bd-border": "var(--bd-border)",
        "bd-text": "var(--bd-text)",
        "bd-text-muted": "var(--bd-text-muted)",
        "bd-text-faint": "var(--bd-text-faint)",
        "bd-accent": "var(--bd-accent)",
        "bd-accent-hover": "var(--bd-accent-hover)",
        "bd-accent-weak": "var(--bd-accent-weak)",
        "bd-success": "var(--bd-success)",
        "bd-warning": "var(--bd-warning)",
        "bd-danger": "var(--bd-danger)",
        "bd-focus": "var(--bd-focus)"
      },
      fontFamily: {
        sans: ["var(--font-family)", "Inter", "system-ui"]
      },
      boxShadow: {
        "bd": "0 10px 30px var(--bd-shadow)"
      }
    }
  },
  darkMode: ["selector", '[data-theme="dark"]'],
  plugins: []
};
