import { auth } from './firebase/firebaseConfig'

const BASE_URL = (import.meta.env.VITE_BACKEND_API as string | undefined) ?? ''

async function publicRequest<T>(path: string): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`)
	if (!res.ok) {
		const err = (await res.json().catch(() => ({ error: res.statusText }))) as { error?: string }
		throw Object.assign(new Error(err.error ?? 'Request failed'), { status: res.status })
	}
	return res.json() as Promise<T>
}

export type UserProfile = {
	uid: string
	photoURL: string | null
	displayName: string | null
}

export type GroceryList = {
	id: string
	name: string
	status: 'OPENED' | 'CLOSED'
	userId: string
	members: string[]
	currency?: string
	createdAt?: string
	updatedAt?: string
}

export type GroceryItem = {
	id: string
	name: string
	quantity: number
	price: number
	weight?: { value: number; unit: 'kg' | 'lbs' | 'oz' }
	isChecked?: boolean
}

async function getIdToken(): Promise<string> {
	const user = auth.currentUser
	if (!user) throw new Error('Not authenticated')
	return user.getIdToken()
}

async function request<T>(
	method: string,
	path: string,
	body?: unknown
): Promise<T> {
	const token = await getIdToken()
	const res = await fetch(`${BASE_URL}${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: body !== undefined ? JSON.stringify(body) : undefined,
	})
	if (!res.ok) {
		const err = (await res.json().catch(() => ({ error: res.statusText }))) as {
			error?: string
		}
		throw Object.assign(new Error(err.error ?? 'Request failed'), {
			status: res.status,
		})
	}
	return res.json() as Promise<T>
}

export const Api = {
	// ── Lists ──────────────────────────────────────────────────────────────
	getLists: () => request<GroceryList[]>('GET', '/api/lists'),
	createList: (name: string) =>
		request<{ id: string }>('POST', '/api/lists', { name }),
	getList: (id: string) => request<GroceryList>('GET', `/api/lists/${id}`),
	updateList: (
		id: string,
		data: { name?: string; status?: 'OPENED' | 'CLOSED'; currency?: string }
	) => request<{ ok: true }>('PATCH', `/api/lists/${id}`, data),
	deleteList: (id: string) =>
		request<{ ok: true }>('DELETE', `/api/lists/${id}`),
	copyList: (id: string) =>
		request<{ id: string }>('POST', `/api/lists/${id}/copy`),
	leaveList: (id: string) =>
		request<{ ok: true }>('DELETE', `/api/lists/${id}/leave`),
	shareList: (id: string, targetUserId: string) =>
		request<{ ok: true }>('POST', `/api/lists/${id}/share`, { targetUserId }),
	unshareList: (id: string, targetUserId: string) =>
		request<{ ok: true }>('DELETE', `/api/lists/${id}/share/${targetUserId}`),

	// ── Items ──────────────────────────────────────────────────────────────
	getItems: (listId: string) =>
		request<GroceryItem[]>('GET', `/api/lists/${listId}/items`),
	createItem: (listId: string, item: Omit<GroceryItem, 'id'>) =>
		request<{ id: string }>('POST', `/api/lists/${listId}/items`, item),
	updateItem: (
		listId: string,
		itemId: string,
		data: Partial<Omit<GroceryItem, 'id'>>
	) =>
		request<{ ok: true }>(
			'PATCH',
			`/api/lists/${listId}/items/${itemId}`,
			data
		),
	deleteItem: (listId: string, itemId: string) =>
		request<{ ok: true }>('DELETE', `/api/lists/${listId}/items/${itemId}`),

	// ── Users ──────────────────────────────────────────────────────────────
	getMe: () =>
		request<{ uid: string; displayName?: string; email?: string }>(
			'GET',
			'/api/users/me'
		),
	updateMe: (data: { displayName?: string; email?: string }) =>
		request<{ ok: true }>('PATCH', '/api/users/me', data),
	registerFcmToken: (token: string) =>
		request<{ ok: true }>('POST', '/api/users/fcm-token', { token }),
	removeFcmToken: (token: string) =>
		request<{ ok: true }>('DELETE', '/api/users/fcm-token', { token }),

	// ── Invites ────────────────────────────────────────────────────────────
	createInvite: (listId: string) =>
		request<{ token: string }>('POST', `/api/lists/${listId}/invite`),
	getInvitePreview: (token: string) =>
		publicRequest<{ listId: string; listName: string }>(`/public/invites/${token}`),
	acceptInvite: (token: string) =>
		request<{ listId: string }>('POST', `/api/invites/${token}/accept`),

	// ── User profiles ──────────────────────────────────────────────────────
	getUserProfiles: (uids: string[]) =>
		request<UserProfile[]>('GET', `/api/users/profiles?uids=${uids.join(',')}`),
}
