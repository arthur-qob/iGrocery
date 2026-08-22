import { Router } from 'express'
import { firestoreDB } from '../database/firestore.js'
import { classifyItem, classifyItems } from '../utils/gemini.js'

const router = Router({ mergeParams: true })

async function requireListMember(
	listId: string,
	uid: string
): Promise<{ id: string; members: string[] } | null> {
	const list = await firestoreDB.getList(listId)
	if (!list || !list.members.includes(uid)) return null
	return { id: list.id!, members: list.members }
}

function geminiUnavailable(res: import('express').Response): void {
	res.status(503).json({
		error:
			'AI categorization is not available — GEMINI_API_KEY is not configured on the server.'
	})
}

// POST /api/lists/:listId/items/:itemId/categorize  — single item
router.post<{ listId: string; itemId: string }>(
	'/:itemId/categorize',
	async (req, res) => {
		if (!process.env['GEMINI_API_KEY']) {
			geminiUnavailable(res)
			return
		}
		const list = await requireListMember(
			req.params.listId,
			req.user!.uid
		)
		if (!list) {
			res.status(403).json({ error: 'Forbidden' })
			return
		}
		const items = await firestoreDB.getItems(list.id)
		const item = items.find((i) => i.id === req.params.itemId)
		if (!item) {
			res.status(404).json({ error: 'Item not found' })
			return
		}
		const category = await classifyItem(item.name)
		await firestoreDB.updateItem(list.id, req.params.itemId, {
			category
		})
		res.json({ category })
	}
)

// POST /api/lists/:listId/items/categorize  — bulk
router.post<{ listId: string }>('/categorize', async (req, res) => {
	if (!process.env['GEMINI_API_KEY']) {
		geminiUnavailable(res)
		return
	}
	const list = await requireListMember(req.params.listId, req.user!.uid)
	if (!list) {
		res.status(403).json({ error: 'Forbidden' })
		return
	}
	const items = await firestoreDB.getItems(list.id)
	if (items.length === 0) {
		res.json({ results: [] })
		return
	}
	const toClassify = items.map((i) => ({
		id: i.id ?? '',
		name: i.name
	}))
	const results = await classifyItems(toClassify)
	// Persist all updated categories in parallel
	await Promise.all(
		results.map(({ id, label, color }) =>
			id
				? firestoreDB.updateItem(list.id, id, { category: { label, color } })
				: Promise.resolve()
		)
	)
	res.json({ results })
})

export default router
