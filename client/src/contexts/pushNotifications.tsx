import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode
} from 'react'
import { Bell, X } from 'lucide-react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/utils/firebase/firebaseConfig'
import { Api } from '@/utils/api'
import { useAuth } from './authContext'

interface PushNotificationsContextType {
	permission: NotificationPermission
	notify: (opts: { title: string; message: string; redirectUrl?: string }) => Promise<void>
	requestPermission: () => Promise<void>
}

const PushNotificationsContext =
	createContext<PushNotificationsContextType | null>(null)

// ── In-app permission prompt ──────────────────────────────────────────────────

const NotificationPrompt = ({
	onAllow,
	onDismiss,
}: {
	onAllow: () => void
	onDismiss: () => void
}) => (
	<div className='fixed bottom-4 right-4 z-50 w-80 bg-surface border border-border rounded-2xl shadow-xl p-4'>
		<div className='flex items-start gap-3'>
			<div className='rounded-full bg-orange-50 p-2 shrink-0'>
				<Bell size={18} className='text-orange-500' />
			</div>
			<div className='flex-1 min-w-0'>
				<p className='font-semibold text-text-primary text-sm'>Enable Notifications</p>
				<p className='text-xs text-text-secondary mt-0.5 leading-relaxed'>
					Get notified when list members add or edit items.
				</p>
				<div className='flex items-center gap-2 mt-3'>
					<button
						type='button'
						onClick={onDismiss}
						className='flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-bg-tertiary transition-colors border border-border cursor-pointer'>
						Not now
					</button>
					<button
						type='button'
						onClick={onAllow}
						className='flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer'>
						Allow
					</button>
				</div>
			</div>
			<button
				type='button'
				onClick={onDismiss}
				className='shrink-0 p-0.5 rounded text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer'>
				<X size={14} />
			</button>
		</div>
	</div>
)

// ── Provider ──────────────────────────────────────────────────────────────────

export const PushNotificationsProvider = ({
	children
}: {
	children: ReactNode
}) => {
	const { userLoggedIn } = useAuth()
	const [registration, setRegistration] =
		useState<ServiceWorkerRegistration | null>(null)
	const [permission, setPermission] = useState<NotificationPermission>(
		'Notification' in window ? Notification.permission : 'denied'
	)
	const [showPrompt, setShowPrompt] = useState(false)

	// Register service worker
	useEffect(() => {
		if (!('serviceWorker' in navigator)) return
		navigator.serviceWorker
			.register('/sw.js')
			.then((reg) => navigator.serviceWorker.ready.then(() => reg))
			.then((reg) => setRegistration(reg))
			.catch(console.error)
	}, [])

	// Show in-app prompt after login when permission not yet decided
	useEffect(() => {
		if (userLoggedIn && 'Notification' in window && permission === 'default') {
			setShowPrompt(true)
		} else {
			setShowPrompt(false)
		}
	}, [userLoggedIn, permission])

	// Register FCM token once permission is granted and SW is ready
	useEffect(() => {
		if (!registration || !userLoggedIn || permission !== 'granted') return

		const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as
			| string
			| undefined
		if (!vapidKey) return

		getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
			.then((token) => {
				if (token) return Api.registerFcmToken(token)
			})
			.catch(console.error)
	}, [registration, userLoggedIn, permission])

	// Show FCM notifications when the app is in the foreground
	useEffect(() => {
		if (!userLoggedIn || !registration || permission !== 'granted') return
		return onMessage(messaging, (payload) => {
			const title = payload.notification?.title ?? 'iGrocery'
			const body = payload.notification?.body ?? ''
			const url = payload.data?.['redirectUrl'] ?? '/'
			void registration.showNotification(title, {
				body,
				icon: '/vite.svg',
				data: { url }
			})
		})
	}, [userLoggedIn, registration, permission])

	// Listen for messages from the service worker (Background Sync wake-up)
	useEffect(() => {
		if (!('serviceWorker' in navigator)) return
		const handler = (event: MessageEvent) => {
			if ((event.data as { type?: string } | undefined)?.type === 'SYNC_PENDING_OPS') {
				window.dispatchEvent(new Event('sync-pending-ops'))
			}
		}
		navigator.serviceWorker.addEventListener('message', handler)
		return () => navigator.serviceWorker.removeEventListener('message', handler)
	}, [])

	const requestPermission = async () => {
		if (!('Notification' in window)) return
		const result = await Notification.requestPermission()
		setPermission(result)
		setShowPrompt(false)
	}

	const notify = async ({
		title,
		message,
		redirectUrl
	}: {
		title: string
		message: string
		redirectUrl?: string
	}) => {
		if (!('Notification' in window)) return

		if (permission === 'default') {
			await requestPermission()
			return
		}
		if (permission === 'denied') return

		const reg = registration ?? (await navigator.serviceWorker.ready)
		reg.showNotification(title, {
			body: message,
			icon: '/vite.svg',
			data: { url: redirectUrl }
		})
	}

	return (
		<PushNotificationsContext.Provider value={{ permission, notify, requestPermission }}>
			{children}
			{showPrompt && (
				<NotificationPrompt
					onAllow={() => void requestPermission()}
					onDismiss={() => setShowPrompt(false)}
				/>
			)}
		</PushNotificationsContext.Provider>
	)
}

export const usePushNotifications = () => {
	const context = useContext(PushNotificationsContext)
	if (!context) {
		throw new Error(
			'usePushNotifications must be used within a PushNotificationsProvider'
		)
	}
	return context
}
