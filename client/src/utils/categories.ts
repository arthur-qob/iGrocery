// ── Category color palette ──────────────────────────────────────────────────

export type CategoryColor = {
	key: string
	label: string
	bg: string
	text: string
	ring: string
	hex: string
}

export const CATEGORY_COLORS: CategoryColor[] = [
	{
		key: 'blue',
		label: 'Blue',
		bg: 'bg-blue-100',
		text: 'text-blue-700',
		ring: 'ring-blue-400',
		hex: '#3b82f6'
	},
	{
		key: 'green',
		label: 'Green',
		bg: 'bg-green-100',
		text: 'text-green-700',
		ring: 'ring-green-400',
		hex: '#22c55e'
	},
	{
		key: 'red',
		label: 'Red',
		bg: 'bg-red-100',
		text: 'text-red-700',
		ring: 'ring-red-400',
		hex: '#ef4444'
	},
	{
		key: 'amber',
		label: 'Amber',
		bg: 'bg-amber-100',
		text: 'text-amber-700',
		ring: 'ring-amber-400',
		hex: '#f59e0b'
	},
	{
		key: 'purple',
		label: 'Purple',
		bg: 'bg-purple-100',
		text: 'text-purple-700',
		ring: 'ring-purple-400',
		hex: '#a855f7'
	},
	{
		key: 'teal',
		label: 'Teal',
		bg: 'bg-teal-100',
		text: 'text-teal-700',
		ring: 'ring-teal-400',
		hex: '#14b8a6'
	},
	{
		key: 'orange',
		label: 'Orange',
		bg: 'bg-orange-100',
		text: 'text-orange-700',
		ring: 'ring-orange-400',
		hex: '#f97316'
	},
	{
		key: 'pink',
		label: 'Pink',
		bg: 'bg-pink-100',
		text: 'text-pink-700',
		ring: 'ring-pink-400',
		hex: '#ec4899'
	},
	{
		key: 'indigo',
		label: 'Indigo',
		bg: 'bg-indigo-100',
		text: 'text-indigo-700',
		ring: 'ring-indigo-400',
		hex: '#6366f1'
	},
	{
		key: 'slate',
		label: 'Gray',
		bg: 'bg-slate-100',
		text: 'text-slate-600',
		ring: 'ring-slate-400',
		hex: '#64748b'
	}
]

// ── Suggested category labels ───────────────────────────────────────────────

export const SUGGESTED_LABELS = [
	'Dairy',
	'Meat & Poultry',
	'Seafood',
	'Bakery',
	'Fruits',
	'Vegetables',
	'Beverages',
	'Snacks',
	'Frozen Foods',
	'Cleaning',
	'Health & Beauty',
	'Pantry Staples',
	'Other'
]

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Maps the English label stored in Firestore → the i18n key suffix under list.category.labels.* */
const LABEL_TO_KEY: Record<string, string> = {
	'Dairy': 'dairy',
	'Meat & Poultry': 'meatPoultry',
	'Seafood': 'seafood',
	'Bakery': 'bakery',
	'Fruits': 'fruits',
	'Vegetables': 'vegetables',
	'Beverages': 'beverages',
	'Snacks': 'snacks',
	'Frozen Foods': 'frozenFoods',
	'Cleaning': 'cleaning',
	'Health & Beauty': 'healthBeauty',
	'Pantry Staples': 'pantryStaples',
	'Other': 'other'
}

/**
 * Returns the full i18n key for a known label (e.g. "list.category.labels.dairy"),
 * or null for custom user-defined labels that have no translation.
 */
export function getCategoryLabelKey(label: string): string | null {
	const suffix = LABEL_TO_KEY[label]
	return suffix ? `list.category.labels.${suffix}` : null
}

/** Returns the color config for a given color key, falling back to slate. */
export function getCategoryColor(colorKey: string): CategoryColor {
	return (
		CATEGORY_COLORS.find((c) => c.key === colorKey) ??
		CATEGORY_COLORS[CATEGORY_COLORS.length - 1]!
	)
}
