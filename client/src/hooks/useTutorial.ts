import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'igrocery.loginCount'

/**
 * Returns the login count for the given user UID from localStorage.
 * Stored as: { [uid]: number }
 */
function readLoginCount(uid: string): number {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return 0
		const parsed = JSON.parse(raw) as Record<string, number>
		return parsed[uid] ?? 0
	} catch {
		return 0
	}
}

function incrementLoginCount(uid: string): number {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		const parsed: Record<string, number> = raw ? (JSON.parse(raw) as Record<string, number>) : {}
		const next = (parsed[uid] ?? 0) + 1
		parsed[uid] = next
		localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
		return next
	} catch {
		return 1
	}
}

/**
 * Manages tutorial state for a given user.
 *
 * - Increments login count in localStorage once per browser session (via sessionStorage guard).
 * - Exposes `showTutorial` = true only when this is the user's first ever login.
 * - Exposes `dismissTutorial` to mark the tour as done.
 * - Exposes `restartTutorial` to re-show the tour on demand (e.g. from Settings).
 */
export function useTutorial(uid: string | undefined) {
	const [showTutorial, setShowTutorial] = useState(false)

	useEffect(() => {
		if (!uid) return

		// Guard: only increment once per session, not on every React re-render / HMR
		const sessionKey = `igrocery.sessionCounted.${uid}`
		const alreadyCounted = sessionStorage.getItem(sessionKey) === 'true'

		let loginCount: number
		if (alreadyCounted) {
			loginCount = readLoginCount(uid)
		} else {
			loginCount = incrementLoginCount(uid)
			sessionStorage.setItem(sessionKey, 'true')
		}

		setShowTutorial(loginCount === 1)
	}, [uid])

	const dismissTutorial = useCallback(() => {
		setShowTutorial(false)
	}, [])

	/** Re-opens the tour at any time without touching the login counter. */
	const restartTutorial = useCallback(() => {
		setShowTutorial(true)
	}, [])

	return { showTutorial, dismissTutorial, restartTutorial }
}
