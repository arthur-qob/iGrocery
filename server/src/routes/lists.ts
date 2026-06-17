import { Router } from 'express'
import { z } from 'zod'
import { firestoreDB } from '../database/firestore.js'
import { notifyListMembers } from '../utils/notify.js'

const router = Router()

const createListSchema = z.object({ name: z.string().min(1).max(100) })
const updateListSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	status: z.enum(['OPENED', 'CLOSED']).optional(),
	currency: z.string().min(1).max(10).optional(),
})
const shareListSchema = z.object({ targetUserId: z.string().min(1) })

// GET /api/lists
router.get('/', async (req, res) => {
	const uid = req.user!.uid
	const lists = await firestoreDB.getLists(uid)
	const serialized = lists.map((l) => ({
		...l,
		createdAt: l.createdAt?.toDate().toISOString() ?? null,
		updatedAt: l.updatedAt?.toDate().toISOString() ?? null,
	}))
	res.json(serialized)
})

// POST /api/lists
router.post('/', async (req, res) => {
	const parsed = createListSchema.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten() })
		return
	}
	const uid = req.user!.uid
	const id = await firestoreDB.createList(uid, parsed.data.name)
	res.status(201).json({ id })
})

// GET /api/lists/:id
router.get('/:id', async (req, res) => {
	const list = await firestoreDB.getList(req.params['id'] ?? '')
	if (!list) { res.status(404).json({ error: 'List not found' }); return }
	if (!list.members.includes(req.user!.uid)) {
		res.status(403).json({ error: 'Forbidden' }); return
	}
	res.json({
		...list,
		createdAt: list.createdAt?.toDate().toISOString() ?? null,
		updatedAt: list.updatedAt?.toDate().toISOString() ?? null,
	})
})

// PATCH /api/lists/:id
router.patch('/:id', async (req, res) => {
	const parsed = updateListSchema.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten() })
		return
	}
	const list = await firestoreDB.getList(req.params['id'] ?? '')
	if (!list) { res.status(404).json({ error: 'List not found' }); return }
	if (!list.members.includes(req.user!.uid)) {
		res.status(403).json({ error: 'Forbidden' }); return
	}
	await firestoreDB.updateList(list.id!, parsed.data)
	if (parsed.data.status) {
		const others = list.members.filter((m) => m !== req.user!.uid)
		const body = parsed.data.status === 'CLOSED'
			? 'The list has been closed.'
			: 'The list has been reopened.'
		void notifyListMembers(others, list.name, body, list.id!)
	}
	res.json({ ok: true })
})

// DELETE /api/lists/:id
router.delete('/:id', async (req, res) => {
	const list = await firestoreDB.getList(req.params['id'] ?? '')
	if (!list) { res.status(404).json({ error: 'List not found' }); return }
	if (list.userId !== req.user!.uid) {
		res.status(403).json({ error: 'Only the owner can delete this list' }); return
	}
	const others = list.members.filter((m) => m !== req.user!.uid)
	void notifyListMembers(others, list.name, 'This list has been deleted by the owner.')
	await firestoreDB.deleteList(list.id!)
	res.json({ ok: true })
})

// POST /api/lists/:id/share
router.post('/:id/share', async (req, res) => {
	const parsed = shareListSchema.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten() })
		return
	}
	const list = await firestoreDB.getList(req.params['id'] ?? '')
	if (!list) { res.status(404).json({ error: 'List not found' }); return }
	if (list.userId !== req.user!.uid) {
		res.status(403).json({ error: 'Only the owner can share this list' }); return
	}
	const { targetUserId } = parsed.data
	await firestoreDB.shareList(list.id!, targetUserId)
	void notifyListMembers(
		[targetUserId],
		'You were added to a list',
		`You now have access to "${list.name}".`,
		list.id!
	)
	res.json({ ok: true })
})

// DELETE /api/lists/:id/share/:uid
router.delete('/:id/share/:uid', async (req, res) => {
	const list = await firestoreDB.getList(req.params['id'] ?? '')
	if (!list) { res.status(404).json({ error: 'List not found' }); return }
	if (list.userId !== req.user!.uid) {
		res.status(403).json({ error: 'Only the owner can manage sharing' }); return
	}
	await firestoreDB.unshareList(list.id!, req.params['uid'] ?? '')
	res.json({ ok: true })
})

// DELETE /api/lists/:id/leave – any non-owner member can remove themselves
router.delete('/:id/leave', async (req, res) => {
	const list = await firestoreDB.getList(req.params['id'] ?? '')
	if (!list) { res.status(404).json({ error: 'List not found' }); return }
	const uid = req.user!.uid
	if (!list.members.includes(uid)) {
		res.status(403).json({ error: 'You are not a member of this list' }); return
	}
	if (list.userId === uid) {
		res.status(403).json({ error: 'The owner cannot leave. Delete the list instead.' }); return
	}
	await firestoreDB.unshareList(list.id!, uid)
	const remaining = list.members.filter((m) => m !== uid)
	void notifyListMembers(remaining, list.name, 'A member left the list.', list.id!)
	res.json({ ok: true })
})

// POST /api/lists/:id/copy – any member can duplicate a list (items copied, unchecked)
router.post('/:id/copy', async (req, res) => {
	const list = await firestoreDB.getList(req.params['id'] ?? '')
	if (!list) { res.status(404).json({ error: 'List not found' }); return }
	if (!list.members.includes(req.user!.uid)) {
		res.status(403).json({ error: 'Forbidden' }); return
	}
	const newListId = await firestoreDB.copyList(list.id!, req.user!.uid)
	res.status(201).json({ id: newListId })
})

// POST /api/lists/:id/invite – any member can generate an invite link
router.post('/:id/invite', async (req, res) => {
	const list = await firestoreDB.getList(req.params['id'] ?? '')
	if (!list) { res.status(404).json({ error: 'List not found' }); return }
	if (!list.members.includes(req.user!.uid)) {
		res.status(403).json({ error: 'Forbidden' }); return
	}
	const token = await firestoreDB.createInvite(list.id!, req.user!.uid)
	res.json({ token })
})

export default router
