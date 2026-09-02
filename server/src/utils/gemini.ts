import { GoogleGenerativeAI } from '@google/generative-ai'

// ---------------------------------------------------------------------------
// Retry helpers
// ---------------------------------------------------------------------------

const TRANSIENT_STATUS_CODES = new Set([429, 500, 503])

function isTransientError(err: unknown): boolean {
	if (err && typeof err === 'object' && 'status' in err) {
		return TRANSIENT_STATUS_CODES.has((err as { status: number }).status)
	}
	return false
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retries `fn` up to `maxAttempts` times on transient errors (429 / 500 / 503).
 * Wait time doubles after each failure and a random jitter (0–500 ms) is added
 * to avoid thundering-herd retries from multiple clients.
 */
async function withRetry<T>(
	fn: () => Promise<T>,
	maxAttempts: number = 4,
	baseDelayMs: number = 1000
): Promise<T> {
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		try {
			return await fn()
		} catch (err) {
			const isLast = attempt === maxAttempts - 1
			if (isLast || !isTransientError(err)) throw err

			const delay = baseDelayMs * 2 ** attempt + Math.random() * 500
			console.warn(
				`[gemini] Transient error on attempt ${attempt + 1}/${maxAttempts}. ` +
					`Retrying in ${Math.round(delay)}ms…`,
				err
			)
			await sleep(delay)
		}
	}
	// Unreachable, but satisfies TypeScript
	throw new Error('withRetry: exhausted all attempts')
}

const VALID_COLORS = [
	'blue',
	'green',
	'red',
	'amber',
	'purple',
	'teal',
	'orange',
	'pink',
	'indigo',
	'slate'
] as const

const VALID_LABELS = [
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

const SYSTEM_PROMPT = `You are a grocery item classifier. Classify grocery items using these categories and colors.

Categories: ${VALID_LABELS.join(', ')}

Color mapping (pick the most fitting):
- Dairy → blue
- Meat & Poultry → red
- Seafood → teal
- Bakery → amber
- Fruits → orange or pink
- Vegetables → green
- Beverages → indigo
- Snacks → orange
- Frozen Foods → indigo
- Cleaning → slate
- Health & Beauty → purple
- Pantry Staples → amber
- Other → slate

Valid color keys: ${VALID_COLORS.join(', ')}

Always respond with ONLY valid JSON, no extra text or markdown.`

type Category = { label: string; color: string }

function getClient(): GoogleGenerativeAI {
	const key = process.env['GEMINI_API_KEY']
	if (!key) {
		throw new Error('GEMINI_API_KEY is not configured')
	}
	return new GoogleGenerativeAI(key)
}

function sanitizeCategory(raw: unknown): Category {
	if (
		raw &&
		typeof raw === 'object' &&
		'label' in raw &&
		'color' in raw &&
		typeof (raw as { label: unknown }).label === 'string' &&
		typeof (raw as { color: unknown }).color === 'string'
	) {
		const label = (raw as { label: string }).label.trim()
		const color = (raw as { color: string }).color.trim().toLowerCase()
		return {
			label: VALID_LABELS.includes(label) ? label : 'Other',
			color: (VALID_COLORS as readonly string[]).includes(color)
				? color
				: 'slate'
		}
	}
	return { label: 'Other', color: 'slate' }
}

/** Classify a single grocery item by name. */
export async function classifyItem(name: string): Promise<Category> {
	const genAI = getClient()
	const model = genAI.getGenerativeModel({
		model: 'gemini-3.6-flash',
		systemInstruction: SYSTEM_PROMPT
	})
	const result = await withRetry(() =>
		model.generateContent(
			`Classify this grocery item. Respond with ONLY JSON {"label":"...","color":"..."}\n\nItem: "${name}"`
		)
	)
	const text = result.response.text().trim()
	// Strip any accidental markdown code fences
	const json = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '')
	return sanitizeCategory(JSON.parse(json) as unknown)
}

/** Classify multiple grocery items in a single API call. */
export async function classifyItems(
	items: Array<{ id: string; name: string }>
): Promise<Array<{ id: string } & Category>> {
	if (items.length === 0) return []

	const genAI = getClient()
	const model = genAI.getGenerativeModel({
		model: 'gemini-3.6-flash',
		systemInstruction: SYSTEM_PROMPT
	})

	const list = items
		.map((item) => `- id: "${item.id}", name: "${item.name}"`)
		.join('\n')

	const result = await withRetry(() =>
		model.generateContent(
			`Classify each grocery item below. Respond with ONLY a JSON array: [{"id":"...","label":"...","color":"..."}, ...]\n\nItems:\n${list}`
		)
	)

	const text = result.response.text().trim()
	const json = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '')
	const parsed = JSON.parse(json) as unknown[]

	return parsed.map((raw) => {
		const obj = raw as Record<string, unknown>
		const id =
			typeof obj['id'] === 'string'
				? obj['id']
				: (items[parsed.indexOf(raw)]?.id ?? '')
		return { id, ...sanitizeCategory(raw) }
	})
}
