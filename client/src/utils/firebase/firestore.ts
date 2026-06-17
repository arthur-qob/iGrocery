import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	where
} from 'firebase/firestore'
import type {
	DocumentData,
	QueryConstraint,
	Timestamp,
	Unsubscribe
} from 'firebase/firestore'
import { app } from './firebaseConfig'

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
	createdAt?: Timestamp
}

class FirestoreDatabase {
	private db = getFirestore(app)

	// ── Generic helpers ──────────────────────────────────────────────────────

	async getDocument<T = DocumentData>(path: string): Promise<T | null> {
		const snap = await getDoc(doc(this.db, path))
		if (!snap.exists()) return null
		return { id: snap.id, ...snap.data() } as T
	}

	async getCollection<T = DocumentData>(
		path: string,
		...constraints: QueryConstraint[]
	): Promise<T[]> {
		const q = query(collection(this.db, path), ...constraints)
		const snap = await getDocs(q)
		return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
	}

	async addDocument<T extends DocumentData>(
		path: string,
		data: T
	): Promise<string> {
		const ref = await addDoc(collection(this.db, path), data)
		return ref.id
	}

	async updateDocument(
		path: string,
		data: Partial<DocumentData>
	): Promise<void> {
		await updateDoc(doc(this.db, path), data)
	}

	async deleteDocument(path: string): Promise<void> {
		await deleteDoc(doc(this.db, path))
	}

	subscribe<T = DocumentData>(
		path: string,
		onChange: (docs: T[]) => void,
		...constraints: QueryConstraint[]
	): Unsubscribe {
		const q = query(collection(this.db, path), ...constraints)
		return onSnapshot(q, (snap) =>
			onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T))
		)
	}

	// ── Lists ────────────────────────────────────────────────────────────────

	async createList(userId: string, name: string): Promise<string> {
		return this.addDocument('lists', {
			name,
			status: 'OPENED',
			userId,
			members: [userId],
			createdAt: serverTimestamp()
		})
	}

	async getLists(userId: string): Promise<GroceryList[]> {
		return this.getCollection<GroceryList>(
			'lists',
			where('members', 'array-contains', userId),
			orderBy('createdAt', 'desc')
		)
	}

	async getList(listId: string): Promise<GroceryList | null> {
		return this.getDocument<GroceryList>(`lists/${listId}`)
	}

	async updateList(
		listId: string,
		data: Partial<
			Omit<GroceryList, 'id' | 'userId' | 'members' | 'createdAt'>
		>
	): Promise<void> {
		return this.updateDocument(`lists/${listId}`, data)
	}

	async shareList(listId: string, targetUserId: string): Promise<void> {
		await updateDoc(doc(this.db, `lists/${listId}`), {
			members: arrayUnion(targetUserId)
		})
	}

	async unshareList(listId: string, targetUserId: string): Promise<void> {
		await updateDoc(doc(this.db, `lists/${listId}`), {
			members: arrayRemove(targetUserId)
		})
	}

	async deleteList(listId: string): Promise<void> {
		const items = await this.getItems(listId)
		await Promise.all(
			items.map((item) => this.deleteItem(listId, item.id!))
		)
		return this.deleteDocument(`lists/${listId}`)
	}

	subscribeLists(
		userId: string,
		onChange: (lists: GroceryList[]) => void
	): Unsubscribe {
		return this.subscribe<GroceryList>(
			'lists',
			onChange,
			where('members', 'array-contains', userId),
			orderBy('createdAt', 'desc')
		)
	}

	// ── Items ────────────────────────────────────────────────────────────────

	async createItem(
		listId: string,
		item: Omit<GroceryItem, 'id'>
	): Promise<string> {
		return this.addDocument(`lists/${listId}/items`, item)
	}

	async getItems(listId: string): Promise<GroceryItem[]> {
		return this.getCollection<GroceryItem>(`lists/${listId}/items`)
	}

	async updateItem(
		listId: string,
		itemId: string,
		data: Partial<GroceryItem>
	): Promise<void> {
		return this.updateDocument(`lists/${listId}/items/${itemId}`, data)
	}

	async deleteItem(listId: string, itemId: string): Promise<void> {
		return this.deleteDocument(`lists/${listId}/items/${itemId}`)
	}

	subscribeItems(
		listId: string,
		onChange: (items: GroceryItem[]) => void
	): Unsubscribe {
		return this.subscribe<GroceryItem>(`lists/${listId}/items`, onChange)
	}
}

export const firestoreDB = new FirestoreDatabase()
