import { Api } from './api'
import type { GroceryList, GroceryItem } from './api'
import { db } from './db'

// ── Read helpers (API first, IndexedDB fallback) ─────────────────────────────

export async function getLists(): Promise<GroceryList[]> {
	try {
		const lists = await Api.getLists()
		await db.lists.bulkPut(lists)
		return lists
	} catch {
		return db.lists.toArray()
	}
}

export async function getList(id: string): Promise<GroceryList | undefined> {
	try {
		const list = await Api.getList(id)
		await db.lists.put(list)
		return list
	} catch {
		return db.lists.get(id)
	}
}

export async function getItems(
	listId: string
): Promise<(GroceryItem & { listId: string })[]> {
	try {
		const items = await Api.getItems(listId)
		const withListId = items.map((i) => ({ ...i, listId }))
		await db.items.bulkPut(withListId)
		return withListId
	} catch {
		return db.items.where('listId').equals(listId).toArray()
	}
}

// ── Write helpers (API first, queue on failure) ──────────────────────────────

export async function createList(name: string): Promise<GroceryList | null> {
	try {
		const { id } = await Api.createList(name)
		const list = await Api.getList(id)
		await db.lists.put(list)
		return list
	} catch {
		await db.pendingOps.add({
			method: 'POST',
			path: '/api/lists',
			body: { name },
			createdAt: Date.now()
		})
		return null
	}
}

export async function updateList(
	id: string,
	data: { name?: string; status?: 'OPENED' | 'CLOSED'; currency?: string }
): Promise<void> {
	try {
		await Api.updateList(id, data)
		await db.lists.update(id, data)
	} catch {
		await db.lists.update(id, data)
		await db.pendingOps.add({
			method: 'PATCH',
			path: `/api/lists/${id}`,
			body: data,
			createdAt: Date.now()
		})
		await enqueueBgSync()
	}
}

export async function deleteList(id: string): Promise<void> {
	try {
		await Api.deleteList(id)
		await db.lists.delete(id)
		await db.items.where('listId').equals(id).delete()
	} catch {
		await db.lists.delete(id)
		await db.pendingOps.add({
			method: 'DELETE',
			path: `/api/lists/${id}`,
			createdAt: Date.now()
		})
		await enqueueBgSync()
	}
}

export async function leaveList(id: string): Promise<void> {
	await Api.leaveList(id)
	await db.lists.delete(id)
	await db.items.where('listId').equals(id).delete()
}

export async function createItem(
	listId: string,
	item: Omit<GroceryItem, 'id'>
): Promise<void> {
	try {
		const { id } = await Api.createItem(listId, item)
		await db.items.put({ ...item, id, listId })
	} catch {
		const tempId = `pending-${Date.now()}`
		await db.items.put({ ...item, id: tempId, listId })
		await db.pendingOps.add({
			method: 'POST',
			path: `/api/lists/${listId}/items`,
			body: item,
			createdAt: Date.now()
		})
		await enqueueBgSync()
	}
}

export async function updateItem(
	listId: string,
	itemId: string,
	data: Partial<Omit<GroceryItem, 'id'>>
): Promise<void> {
	try {
		await Api.updateItem(listId, itemId, data)
		await db.items.update(itemId, data)
	} catch {
		await db.items.update(itemId, data)
		await db.pendingOps.add({
			method: 'PATCH',
			path: `/api/lists/${listId}/items/${itemId}`,
			body: data,
			createdAt: Date.now()
		})
		await enqueueBgSync()
	}
}

export async function deleteItem(
	listId: string,
	itemId: string
): Promise<void> {
	try {
		await Api.deleteItem(listId, itemId)
		await db.items.delete(itemId)
	} catch {
		await db.items.delete(itemId)
		await db.pendingOps.add({
			method: 'DELETE',
			path: `/api/lists/${listId}/items/${itemId}`,
			createdAt: Date.now()
		})
		await enqueueBgSync()
	}
}

// ── Pending ops queue ────────────────────────────────────────────────────────

async function enqueueBgSync(): Promise<void> {
	if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return
	try {
		const reg = await navigator.serviceWorker.ready
		await (reg as ServiceWorkerRegistration & {
			sync: { register: (tag: string) => Promise<void> }
		}).sync.register('sync-pending-ops')
	} catch {
		// Background Sync not supported; rely on online event instead
	}
}

export async function flushPendingOps(): Promise<void> {
	const ops = await db.pendingOps.orderBy('createdAt').toArray()
	for (const op of ops) {
		try {
			const res = await fetch(
				(import.meta.env.VITE_BACKEND_API as string | undefined ?? '') + op.path,
				{
					method: op.method,
					headers: { 'Content-Type': 'application/json' },
					body: op.body ? JSON.stringify(op.body) : undefined
				}
			)
			if (res.ok && op.id != null) {
				await db.pendingOps.delete(op.id)
			}
		} catch {
			break
		}
	}
}

// Drain queue when the app comes back online
if (typeof window !== 'undefined') {
	window.addEventListener('online', () => void flushPendingOps())
	window.addEventListener('sync-pending-ops', () => void flushPendingOps())
}
