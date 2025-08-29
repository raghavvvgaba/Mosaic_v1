export type Theme = 'light' | 'dark' | 'system'

// Theme detection and management
export class ThemeManager {
  private static instance: ThemeManager | null = null
  private currentTheme: Theme = 'system'
  private listeners: ((theme: Theme) => void)[] = []

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeTheme()
      this.setupSystemThemeListener()
    }
  }

  private initializeTheme() {
    const stored = localStorage.getItem('mosaic-theme') as Theme
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      this.currentTheme = stored
    }
    this.applyTheme()
  }

  private setupSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.applyTheme()
      }
    })
  }

  private applyTheme() {
    const root = document.documentElement
    const isDark = this.getEffectiveTheme() === 'dark'
    
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.currentTheme))
  }

  private getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return this.currentTheme as 'light' | 'dark'
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme
    localStorage.setItem('mosaic-theme', theme)
    this.applyTheme()
  }

  getTheme(): Theme {
    return this.currentTheme
  }

  getEffectiveThemeValue(): 'light' | 'dark' {
    return this.getEffectiveTheme()
  }

  subscribe(listener: (theme: Theme) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Utility methods for theme-based styling
  static getThemeColors(theme: 'light' | 'dark') {
    return theme === 'dark' ? {
      background: 'rgb(10, 10, 11)',
      foreground: 'rgb(250, 250, 250)',
      card: 'rgb(24, 24, 27)',
      cardForeground: 'rgb(250, 250, 250)',
      primary: 'rgb(59, 130, 246)',
      primaryForeground: 'rgb(24, 24, 27)',
      secondary: 'rgb(39, 39, 70)',
      secondaryForeground: 'rgb(250, 250, 250)',
      muted: 'rgb(39, 39, 70)',
      mutedForeground: 'rgb(161, 161, 170)',
      accent: 'rgb(251, 191, 36)',
      accentForeground: 'rgb(24, 24, 27)',
      border: 'rgb(39, 39, 70)',
      input: 'rgb(39, 39, 70)',
      ring: 'rgb(59, 130, 246)',
    } : {
      background: 'rgb(255, 255, 255)',
      foreground: 'rgb(24, 24, 27)',
      card: 'rgb(255, 255, 255)',
      cardForeground: 'rgb(24, 24, 27)',
      primary: 'rgb(37, 99, 235)',
      primaryForeground: 'rgb(248, 250, 252)',
      secondary: 'rgb(244, 244, 245)',
      secondaryForeground: 'rgb(24, 24, 27)',
      muted: 'rgb(244, 244, 245)',
      mutedForeground: 'rgb(113, 113, 122)',
      accent: 'rgb(245, 158, 11)',
      accentForeground: 'rgb(24, 24, 27)',
      border: 'rgb(228, 228, 231)',
      input: 'rgb(228, 228, 231)',
      ring: 'rgb(37, 99, 235)',
    }
  }
}

// Theme utilities
export const themeManager = ThemeManager.getInstance()

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const toggleTheme = () => {
  const current = themeManager.getTheme()
  const effective = themeManager.getEffectiveThemeValue()
  
  if (current === 'system') {
    themeManager.setTheme(effective === 'dark' ? 'light' : 'dark')
  } else {
    themeManager.setTheme(current === 'dark' ? 'light' : 'dark')
  }
}

// CSS-in-JS utilities for dynamic theming
export const getThemeVariable = (variable: string): string => {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${variable}`)
}

export const setThemeVariable = (variable: string, value: string): void => {
  if (typeof window === 'undefined') return
  document.documentElement.style.setProperty(`--color-${variable}`, value)
}
