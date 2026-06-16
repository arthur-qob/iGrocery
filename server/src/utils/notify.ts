import { firestoreDB } from '../database/firestore.js'
import { messaging } from '../config/firebase.js'

export async function notifyListMembers(
	userIds: string[],
	title: string,
	body: string,
	listId?: string
): Promise<void> {
	if (userIds.length === 0) return
	const tokens = await firestoreDB.getFcmTokensForUsers(userIds)
	if (tokens.length === 0) return
	void messaging.sendEachForMulticast({
		tokens,
		notification: { title, body },
		data: { redirectUrl: listId ? `/lists/${listId}` : '/lists' },
	})
}
