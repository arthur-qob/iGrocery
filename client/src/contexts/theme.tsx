import { createContext, useContext, useEffect, useState } from 'react'

type Themes = 'light' | 'dark' | 'system'

type ThemeContextType = {
	theme: Themes
	resolvedTheme: 'light' | 'dark'
	setTheme: (theme: Themes) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export const ThemeContextProvider = ({
	children
}: {
	children: React.ReactNode
}) => {
	const [theme, setTheme] = useState<Themes>(
		() => (localStorage.getItem('theme') as Themes | null) ?? 'light'
	)
	const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(
		window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	)

	useEffect(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)')
		const handler = (e: MediaQueryListEvent) =>
			setSystemPreference(e.matches ? 'dark' : 'light')
		mq.addEventListener('change', handler)
		return () => mq.removeEventListener('change', handler)
	}, [])

	const resolvedTheme: 'light' | 'dark' =
		theme === 'system' ? systemPreference : theme

	useEffect(() => {
		localStorage.setItem('theme', theme)
	}, [theme])

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', resolvedTheme)
	}, [resolvedTheme])

	return (
		<ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context)
		throw new Error('useTheme must be used within ThemeContextProvider')
	return context
}
