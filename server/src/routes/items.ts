import { Router } from 'express'
import { z } from 'zod'
import { firestoreDB } from '../database/firestore.js'
import { notifyListMembers } from '../utils/notify.js'

const router = Router({ mergeParams: true })

const weightSchema = z.object({
	value: z.number().positive(),
	unit: z.enum(['kg', 'lbs', 'oz']),
})

const createItemSchema = z.object({
	name: z.string().min(1).max(200),
	quantity: z.number().int().positive(),
	price: z.number().nonnegative(),
	weight: weightSchema.optional(),
	isChecked: z.boolean().optional(),
})

const updateItemSchema = createItemSchema.partial()

async function requireListMember(
	listId: string,
	uid: string
): Promise<{ id: string; name: string; members: string[] } | null> {
	const list = await firestoreDB.getList(listId)
	if (!list || !list.members.includes(uid)) return null
	return { id: list.id!, name: list.name, members: list.members }
}

// GET /api/lists/:listId/items
router.get('/', async (req, res) => {
	const list = await requireListMember(
		req.params['listId'] ?? '',
		req.user!.uid
	)
	if (!list) { res.status(403).json({ error: 'Forbidden' }); return }
	const items = await firestoreDB.getItems(list.id)
	res.json(items)
})

// POST /api/lists/:listId/items
router.post('/', async (req, res) => {
	const parsed = createItemSchema.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten() })
		return
	}
	const uid = req.user!.uid
	const list = await requireListMember(req.params['listId'] ?? '', uid)
	if (!list) { res.status(403).json({ error: 'Forbidden' }); return }

	const id = await firestoreDB.createItem(list.id, parsed.data)
	void firestoreDB.touchList(list.id)

	const others = list.members.filter((m) => m !== uid)
	void notifyListMembers(others, list.name, `New item added: ${parsed.data.name}`, list.id)

	res.status(201).json({ id })
})

// PATCH /api/lists/:listId/items/:itemId
router.patch('/:itemId', async (req, res) => {
	const parsed = updateItemSchema.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten() })
		return
	}
	const list = await requireListMember(
		req.params['listId'] ?? '',
		req.user!.uid
	)
	if (!list) { res.status(403).json({ error: 'Forbidden' }); return }
	await firestoreDB.updateItem(list.id, req.params['itemId'] ?? '', parsed.data)
	void firestoreDB.touchList(list.id)
	res.json({ ok: true })
})

// DELETE /api/lists/:listId/items/:itemId
router.delete('/:itemId', async (req, res) => {
	const list = await requireListMember(
		req.params['listId'] ?? '',
		req.user!.uid
	)
	if (!list) { res.status(403).json({ error: 'Forbidden' }); return }
	await firestoreDB.deleteItem(list.id, req.params['itemId'] ?? '')
	void firestoreDB.touchList(list.id)
	res.json({ ok: true })
})

export default router
