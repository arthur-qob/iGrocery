import { Router } from 'express'
import { firestoreDB } from '../database/firestore.js'
import { auth } from '../config/firebase.js'
import { notifyListMembers } from '../utils/notify.js'

const router = Router()

// POST /api/invites/:token/accept – authenticated; adds caller to the list
router.post('/:token/accept', async (req, res) => {
	const invite = await firestoreDB.getInvite(req.params['token'] ?? '')
	if (!invite) { res.status(404).json({ error: 'Invalid or expired invite' }); return }

	const list = await firestoreDB.getList(invite.listId)
	if (!list) { res.status(404).json({ error: 'List not found' }); return }

	const uid = req.user!.uid

	// Already a member — just return the list ID so the client can navigate
	if (!list.members.includes(uid)) {
		await firestoreDB.shareList(invite.listId, uid)
		void firestoreDB.touchList(invite.listId)
		const joiner = await auth.getUser(uid).catch(() => null)
		const joinerName = joiner?.displayName ?? 'Someone'
		void notifyListMembers(
			list.members,
			list.name,
			`${joinerName} joined the list.`,
			invite.listId
		)
	}

	res.json({ listId: invite.listId })
})

export default router
