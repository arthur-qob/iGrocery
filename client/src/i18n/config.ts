import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.use(
		resourcesToBackend(
			(language: string, namespace: string) =>
				import(`../../public/locales/${language}/${namespace}.json`)
		)
	)
	.init({
		fallbackLng: 'en',
		supportedLngs: ['en', 'pt-BR'],
		defaultNS: 'translation',
		debug: import.meta.env.DEV,
		interpolation: {
			// React already escapes values — no need for i18next to double-escape
			escapeValue: false,
		},
		detection: {
			// Check localStorage first, then browser language setting
			order: ['localStorage', 'navigator'],
			caches: ['localStorage'],
			lookupLocalStorage: 'i18nextLng',
		},
	})

export default i18n
