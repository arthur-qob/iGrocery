import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { randomBytes } from 'node:crypto'
import { db } from '../config/firebase.js'

type WeightUnit = 'kg' | 'lbs' | 'oz' | 'l' | 'ml'

export type GroceryItem = {
	id?: string
	name: string
	quantity: number
	price: number
	weight?: { value: number; unit: WeightUnit }
	isChecked?: boolean
}

export type GroceryList = {
	id?: string
	name: string
	status: 'OPENED' | 'CLOSED'
	userId: string
	members: string[]
	currency?: string
	createdAt?: FirebaseFirestore.Timestamp
	updatedAt?: FirebaseFirestore.Timestamp
}

export type UserDoc = {
	uid?: string
	displayName?: string
	email?: string
	fcmTokens?: string[]
}

export type InviteDoc = {
	token?: string
	listId: string
	createdBy: string
	expiresAt: FirebaseFirestore.Timestamp
}

function toData<T>(snap: DocumentSnapshot): T {
	return { id: snap.id, ...snap.data() } as T
}

class FirestoreDatabase {
	// ── Lists ────────────────────────────────────────────────────────────────

	async createList(
		userId: string,
		name: string,
		currency = 'USD'
	): Promise<string> {
		const ref = await db.collection('lists').add({
			name,
			status: 'OPENED',
			userId,
			members: [userId],
			currency,
			createdAt: FieldValue.serverTimestamp(),
			updatedAt: FieldValue.serverTimestamp()
		})
		return ref.id
	}

	async getLists(userId: string): Promise<GroceryList[]> {
		const snap = await db
			.collection('lists')
			.where('members', 'array-contains', userId)
			.orderBy('createdAt', 'desc')
			.get()
		return snap.docs.map((d) => toData<GroceryList>(d))
	}

	async getList(listId: string): Promise<GroceryList | null> {
		const snap = await db.doc(`lists/${listId}`).get()
		if (!snap.exists) return null
		return toData<GroceryList>(snap)
	}

	async updateList(
		listId: string,
		data: { name?: string; status?: 'OPENED' | 'CLOSED'; currency?: string }
	): Promise<void> {
		await db.doc(`lists/${listId}`).update({
			...data,
			updatedAt: FieldValue.serverTimestamp()
		})
	}

	async touchList(listId: string): Promise<void> {
		await db
			.doc(`lists/${listId}`)
			.update({ updatedAt: FieldValue.serverTimestamp() })
	}

	async shareList(listId: string, targetUserId: string): Promise<void> {
		await db.doc(`lists/${listId}`).update({
			members: FieldValue.arrayUnion(targetUserId)
		})
	}

	async unshareList(listId: string, targetUserId: string): Promise<void> {
		await db.doc(`lists/${listId}`).update({
			members: FieldValue.arrayRemove(targetUserId)
		})
	}

	async copyList(sourceListId: string, userId: string): Promise<string> {
		const source = await this.getList(sourceListId)
		if (!source) throw new Error('List not found')
		const newListId = await this.createList(
			userId,
			`${source.name} (copy)`,
			source.currency ?? 'USD'
		)
		const items = await this.getItems(sourceListId)
		await Promise.all(
			items.map(({ id: _id, isChecked: _checked, ...itemData }) =>
				this.createItem(newListId, { ...itemData, isChecked: false })
			)
		)
		return newListId
	}

	async deleteList(listId: string): Promise<void> {
		const items = await this.getItems(listId)
		await Promise.all(
			items.flatMap((item) =>
				item.id != null ? [this.deleteItem(listId, item.id)] : []
			)
		)
		await db.doc(`lists/${listId}`).delete()
	}

	// ── Items ────────────────────────────────────────────────────────────────

	async createItem(
		listId: string,
		item: Omit<GroceryItem, 'id'>
	): Promise<string> {
		const ref = await db
			.collection(`lists/${listId}/items`)
			.add(item as Record<string, unknown>)
		return ref.id
	}

	async getItems(listId: string): Promise<GroceryItem[]> {
		const snap = await db.collection(`lists/${listId}/items`).get()
		return snap.docs.map((d) => toData<GroceryItem>(d))
	}

	async updateItem(
		listId: string,
		itemId: string,
		data: Partial<Omit<GroceryItem, 'id'>>
	): Promise<void> {
		await db
			.doc(`lists/${listId}/items/${itemId}`)
			.update(data as Record<string, unknown>)
	}

	async deleteItem(listId: string, itemId: string): Promise<void> {
		await db.doc(`lists/${listId}/items/${itemId}`).delete()
	}

	// ── Users ─────────────────────────────────────────────────────────────────

	async getUser(uid: string): Promise<UserDoc | null> {
		const snap = await db.doc(`users/${uid}`).get()
		if (!snap.exists) return null
		return toData<UserDoc>(snap)
	}

	async upsertUser(uid: string, data: Partial<UserDoc>): Promise<void> {
		await db.doc(`users/${uid}`).set(data, { merge: true })
	}

	async addFcmToken(uid: string, token: string): Promise<void> {
		await db
			.doc(`users/${uid}`)
			.set({ fcmTokens: FieldValue.arrayUnion(token) }, { merge: true })
	}

	async removeFcmToken(uid: string, token: string): Promise<void> {
		await db.doc(`users/${uid}`).update({
			fcmTokens: FieldValue.arrayRemove(token)
		})
	}

	async getFcmTokensForUsers(userIds: string[]): Promise<string[]> {
		const tokens: string[] = []
		await Promise.all(
			userIds.map(async (uid) => {
				const snap = await db.doc(`users/${uid}`).get()
				const raw = snap.data()
				const fcmTokens: unknown = raw?.['fcmTokens']
				if (Array.isArray(fcmTokens)) {
					tokens.push(...(fcmTokens as string[]))
				}
			})
		)
		return tokens
	}

	// ── Invites ───────────────────────────────────────────────────────────────

	async createInvite(listId: string, createdBy: string): Promise<string> {
		const token = randomBytes(16).toString('hex')
		const expiresAt = new Date()
		expiresAt.setDate(expiresAt.getDate() + 7)
		await db.doc(`invites/${token}`).set({
			listId,
			createdBy,
			expiresAt: Timestamp.fromDate(expiresAt)
		})
		return token
	}

	async getInvite(token: string): Promise<InviteDoc | null> {
		const snap = await db.doc(`invites/${token}`).get()
		if (!snap.exists) return null
		const data = toData<InviteDoc>(snap)
		if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
			void db.doc(`invites/${token}`).delete()
			return null
		}
		return data
	}

	async deleteInvite(token: string): Promise<void> {
		await db.doc(`invites/${token}`).delete()
	}
}

export const firestoreDB = new FirestoreDatabase()
