/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        foreground: '#1f2937',
        primary: '#2563eb',
        secondary: '#f3f4f6',
        accent: '#059669',
        destructive: '#dc2626',
        muted: '#f9fafb',
      }
    },
  },
  plugins: [],
}
