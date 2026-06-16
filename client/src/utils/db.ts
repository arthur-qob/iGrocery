import Dexie, { type Table } from 'dexie'
import type { GroceryList, GroceryItem } from './api'

export type PendingOp = {
	id?: number
	method: 'POST' | 'PATCH' | 'DELETE'
	path: string
	body?: object
	createdAt: number
}

class AppDB extends Dexie {
	lists!: Table<GroceryList, string>
	items!: Table<GroceryItem & { listId: string }, string>
	pendingOps!: Table<PendingOp, number>

	constructor() {
		super('igrocery')
		this.version(1).stores({
			lists: 'id, userId, status',
			items: 'id, listId',
			pendingOps: '++id, createdAt'
		})
	}
}

export const db = new AppDB()
