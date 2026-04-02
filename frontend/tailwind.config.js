/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // slate-50
        surface: '#ffffff',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        text: {
          main: '#0f172a', // slate-900
          muted: '#64748b', // slate-500
        },
        status: {
          green: {
            bg: '#ecfdf5', // emerald-50
            border: '#10b981', // emerald-500
            text: '#065f46', // emerald-800
          },
          yellow: {
            bg: '#fffbeb', // amber-50
            border: '#f59e0b', // amber-500
            text: '#92400e', // amber-800
          },
          red: {
            bg: '#fef2f2', // red-50
            border: '#ef4444', // red-500
            text: '#991b1b', // red-800
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
