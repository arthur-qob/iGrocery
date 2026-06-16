import { Router } from 'express'
import { firestoreDB } from '../database/firestore.js'

const router = Router()

// GET /public/invites/:token – no auth required; returns list preview
router.get('/invites/:token', async (req, res) => {
	const invite = await firestoreDB.getInvite(req.params['token'] ?? '')
	if (!invite) { res.status(404).json({ error: 'Invalid or expired invite' }); return }
	const list = await firestoreDB.getList(invite.listId)
	if (!list) { res.status(404).json({ error: 'List not found' }); return }
	res.json({ listId: invite.listId, listName: list.name })
})

export default router
