/**
 * Augments i18next's TypeScript definitions so that t() keys are fully
 * type-checked and autocompleted against the English translation file.
 */
import 'i18next'
import type en from '../../public/locales/en/translation.json'

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation'
		resources: {
			translation: typeof en
		}
	}
}
