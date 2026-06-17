import { useTranslation } from 'react-i18next'

export const CURRENCY_OPTIONS: { value: string; label: string }[] = [
	{ value: 'USD', label: 'USD ($)' },
	{ value: 'EUR', label: 'EUR (€)' },
	{ value: 'BRL', label: 'BRL (R$)' },
	{ value: 'GBP', label: 'GBP (£)' },
	{ value: 'JPY', label: 'JPY (¥)' },
	{ value: 'CNY', label: 'CNY (¥)' },
]

/**
 * Returns a locale-aware currency formatter driven by the active i18n language.
 * Uses Intl.NumberFormat instead of a hand-rolled symbol map so that currency
 * symbols, placement, and decimal separators all follow locale conventions.
 */
export const useCurrency = (currency = 'USD') => {
	const { i18n } = useTranslation()

	const fmt = (amount: number): string => {
		try {
			return new Intl.NumberFormat(i18n.language, {
				style: 'currency',
				currency,
				// JPY and similar 0-decimal currencies are handled automatically
			}).format(amount)
		} catch {
			// Fallback if an unknown currency code is passed
			return `${currency} ${amount.toFixed(2)}`
		}
	}

	return { currency, fmt }
}
