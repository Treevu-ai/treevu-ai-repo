import { create } from 'zustand'

const THEME_KEY = 'treevu_theme'

function applyTheme(theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

// Apply on module load (before first render)
const _initial = localStorage.getItem(THEME_KEY) || 'system'
applyTheme(_initial)

export const useThemeStore = create((set) => ({
  theme: _initial,   // 'light' | 'dark' | 'system'

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
}))
