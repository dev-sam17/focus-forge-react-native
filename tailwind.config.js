/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#111827',
        foreground: '#f9fafb',
        card: {
          DEFAULT: '#1f2937',
          foreground: '#f9fafb',
        },
        'card-foreground': '#f9fafb',
        popover: {
          DEFAULT: '#1f2937',
          foreground: '#f9fafb',
        },
        'popover-foreground': '#f9fafb',
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        'primary-foreground': '#ffffff',
        secondary: {
          DEFAULT: '#374151',
          foreground: '#f3f4f6',
        },
        'secondary-foreground': '#f3f4f6',
        accent: {
          DEFAULT: '#10b981',
          foreground: '#ffffff',
        },
        'accent-foreground': '#ffffff',
        muted: {
          DEFAULT: '#374151',
          foreground: '#9ca3af',
        },
        'muted-foreground': '#9ca3af',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        'destructive-foreground': '#ffffff',
        success: '#10b981',
        warning: '#f59e0b',
        border: '#4b5563',
        input: '#374151',
        ring: '#3b82f6',
      }
    },
  },
  plugins: [],
}
