import { Router } from 'express'
import { z } from 'zod'
import { firestoreDB } from '../database/firestore.js'
import { auth } from '../config/firebase.js'

const router = Router()

const updateUserSchema = z.object({
	displayName: z.string().min(1).max(100).optional(),
	email: z.string().email().optional(),
})

const fcmTokenSchema = z.object({ token: z.string().min(1) })

// GET /api/users/me
router.get('/me', async (req, res) => {
	const uid = req.user!.uid
	const user = await firestoreDB.getUser(uid)
	res.json(user ?? { uid })
})

// PATCH /api/users/me
router.patch('/me', async (req, res) => {
	const parsed = updateUserSchema.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten() })
		return
	}
	await firestoreDB.upsertUser(req.user!.uid, parsed.data)
	res.json({ ok: true })
})

// POST /api/users/fcm-token
router.post('/fcm-token', async (req, res) => {
	const parsed = fcmTokenSchema.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten() })
		return
	}
	await firestoreDB.addFcmToken(req.user!.uid, parsed.data.token)
	res.json({ ok: true })
})

// DELETE /api/users/fcm-token
router.delete('/fcm-token', async (req, res) => {
	const parsed = fcmTokenSchema.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: parsed.error.flatten() })
		return
	}
	await firestoreDB.removeFcmToken(req.user!.uid, parsed.data.token)
	res.json({ ok: true })
})

// GET /api/users/profiles?uids=uid1,uid2,... – batch profile lookup via Firebase Auth
router.get('/profiles', async (req, res) => {
	const raw = req.query['uids']
	const uids = (typeof raw === 'string' ? raw : '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 50)
	if (uids.length === 0) { res.json([]); return }
	const profiles = await Promise.all(
		uids.map(async (uid) => {
			try {
				const user = await auth.getUser(uid)
				return { uid, photoURL: user.photoURL ?? null, displayName: user.displayName ?? null }
			} catch {
				return { uid, photoURL: null, displayName: null }
			}
		})
	)
	res.json(profiles)
})

export default router
