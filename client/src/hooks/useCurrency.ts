export const CURRENCY_SYMBOLS: Record<string, string> = {
	USD: '$',
	EUR: '€',
	BRL: 'R$',
	GBP: '£',
	JPY: '¥',
	CNY: '¥',
}

export const CURRENCY_OPTIONS: { value: string; label: string }[] = [
	{ value: 'USD', label: 'USD ($)' },
	{ value: 'EUR', label: 'EUR (€)' },
	{ value: 'BRL', label: 'BRL (R$)' },
	{ value: 'GBP', label: 'GBP (£)' },
	{ value: 'JPY', label: 'JPY (¥)' },
	{ value: 'CNY', label: 'CNY (¥)' },
]

export const useCurrency = (currency = 'USD') => {
	const symbol = CURRENCY_SYMBOLS[currency] ?? '$'
	const fmt = (amount: number) => `${symbol}${amount.toFixed(2)}`
	return { currency, symbol, fmt }
}
