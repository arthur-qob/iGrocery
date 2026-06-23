/// <reference lib="webworker" />
import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {
	CacheFirst,
	NetworkFirst,
} from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

// Background Sync API is not in the standard WebWorker lib yet
interface SyncEvent extends ExtendableEvent {
	readonly tag: string
	readonly lastChance: boolean
}

// ── Precache all Vite build outputs ──────────────────────────────────────────
// __WB_MANIFEST is injected by vite-plugin-pwa at build time with the full
// list of versioned assets (JS chunks, CSS, etc.).
precacheAndRoute(self.__WB_MANIFEST)

// Remove stale precache entries from previous builds
cleanupOutdatedCaches()

// ── SPA navigation fallback ───────────────────────────────────────────────────
// All navigations (non-asset requests) are served from the precached index.html,
// which enables offline navigation across all React Router routes.
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

// ── Runtime cache: API requests ───────────────────────────────────────────────
// NetworkFirst with a 10-second timeout. On timeout or offline, serves the
// most recent cached response. Cached for up to 5 minutes / 50 entries.
registerRoute(
	({ url }) =>
		url.pathname.startsWith('/api/') ||
		url.pathname.startsWith('/public/invites/'),
	new NetworkFirst({
		cacheName: 'igrocery-api-cache',
		networkTimeoutSeconds: 10,
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 60 * 5, // 5 minutes
			}),
		],
	})
)

// ── Runtime cache: images (icons, screenshots, opengraph) ────────────────────
// CacheFirst — images are effectively immutable; serve instantly from cache.
registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({
		cacheName: 'igrocery-image-cache',
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
			}),
		],
	})
)

// ── Runtime cache: Google Fonts / external CDN ───────────────────────────────
registerRoute(
	({ url }) =>
		url.origin === 'https://fonts.googleapis.com' ||
		url.origin === 'https://fonts.gstatic.com',
	new CacheFirst({
		cacheName: 'igrocery-fonts-cache',
		plugins: [
			new CacheableResponsePlugin({ statuses: [0, 200] }),
			new ExpirationPlugin({
				maxEntries: 20,
				maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
			}),
		],
	})
)

// ── Firebase Cloud Messaging compat ──────────────────────────────────────────
// FCM sends messages to the SW via postMessage; no fetch interception needed.
// Explicitly allow FCM script requests to pass through without caching.
registerRoute(
	({ url }) => url.hostname.endsWith('firebaseio.com') ||
		url.hostname.endsWith('googleapis.com'),
	new NetworkFirst({ cacheName: 'igrocery-firebase-cache' })
)

// ── Instant activation ────────────────────────────────────────────────────────
self.addEventListener('install', () => {
	self.skipWaiting()
})

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim())
})

// ── Push notifications ────────────────────────────────────────────────────────
// FCM notification messages arrive as { notification: { title, body }, data: { ... } }
// Manual notify() calls showNotification() directly and never hits this handler.
self.addEventListener('push', (event) => {
	const payload = (event as PushEvent).data?.json() as {
		notification?: { title?: string; body?: string; icon?: string }
		title?: string
		body?: string
		icon?: string
		data?: { redirectUrl?: string }
		url?: string
	} | undefined ?? {}

	const title = payload.notification?.title ?? payload.title ?? 'iGrocery'
	const body = payload.notification?.body ?? payload.body ?? ''
	const icon = payload.notification?.icon ?? payload.icon ?? '/icons/icon-192x192.png'
	const url = payload.data?.redirectUrl ?? payload.url ?? '/'

	event.waitUntil(
		self.registration.showNotification(title, {
			body,
			icon,
			badge: '/icons/icon-96x96.png',
			data: { url },
		})
	)
})

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
	event.notification.close()
	const url: string = (event.notification.data as { url?: string } | undefined)?.url ?? '/'
	event.waitUntil(
		self.clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((windowClients) => {
				const existing = windowClients.find((c) => c.url === url)
				if (existing) return existing.focus()
				return self.clients.openWindow(url)
			})
	)
})

// ── Background Sync ───────────────────────────────────────────────────────────
// Tells the main thread to flush its pending-ops queue (Dexie) when connectivity
// is restored. The actual flush logic lives in src/utils/sync.ts.
self.addEventListener('sync', (event) => {
	const syncEvent = event as unknown as SyncEvent
	if (syncEvent.tag === 'sync-pending-ops') {
		syncEvent.waitUntil(
			self.clients.matchAll({ type: 'window' }).then((windowClients) => {
				windowClients.forEach((client) =>
					client.postMessage({ type: 'SYNC_PENDING_OPS' })
				)
			})
		)
	}
})
