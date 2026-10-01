import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>({
  theme: 'light',
  toggle: () => {},
})

export function ThemeProvider({
  children,
}: {
  children: ReactNode
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme =
        localStorage.getItem('nyaya-theme')

      // Use saved preference if available
      if (
        savedTheme === 'light' ||
        savedTheme === 'dark'
      ) {
        return savedTheme
      }
    }

    // Default Nyaya AI theme
    return 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      theme === 'dark'
    )

    localStorage.setItem(
      'nyaya-theme',
      theme
    )
  }, [theme])

  const toggle = () => {
    setTheme(current =>
      current === 'light'
        ? 'dark'
        : 'light'
    )
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () =>
  useContext(ThemeContext)