/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        m3: {
          seed: "#8ECAE6",
          primary: "#8ECAE6",
          onPrimary: "#003548",
          primaryContainer: "#004D67",
          onPrimaryContainer: "#C2E8FF",
          background: "#0F1417",
          surface: "#111619",
          surfaceContainer: "#1E2529",
          surfaceContainerHigh: "#283035",
          onSurface: "#DEE3E6",
          onSurfaceVariant: "#BFC8CB",
          outline: "#889297",
          outlineVariant: "#3F484B",
          favorite: "#FF4081",
          lyricActive: "#FFFF00",
        },
      },
      borderRadius: {
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '24px',
        'm3-full': '9999px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
