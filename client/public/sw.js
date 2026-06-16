const CACHE_NAME = 'igrocery-v1'
const urlsToCache = ['index.html']

// Install
self.addEventListener('install', (event) => {
	self.skipWaiting()
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
	)
})

// Activate — clear old caches and take control immediately
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(
					names
						.filter((name) => name !== CACHE_NAME)
						.map((name) => caches.delete(name))
				)
			)
			.then(() => self.clients.claim())
	)
})

// Fetch — cache-first for static assets, network-only for API
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url)
	if (url.pathname.startsWith('/api/')) {
		// API requests: network only, no caching
		return
	}
	event.respondWith(
		caches.match(event.request).then(
			(cached) => cached ?? fetch(event.request)
		)
	)
})

// Push notifications
self.addEventListener('push', (event) => {
	const payload = event.data?.json() ?? {}
	// FCM notification messages arrive as { notification: { title, body }, data: { ... } }
	// Manual notify() calls showNotification() directly and never hits this handler
	const title = payload.notification?.title ?? payload.title ?? 'iGrocery'
	const body = payload.notification?.body ?? payload.body ?? ''
	const icon = payload.notification?.icon ?? payload.icon ?? '/vite.svg'
	const url = payload.data?.redirectUrl ?? payload.url ?? '/'
	event.waitUntil(
		self.registration.showNotification(title, {
			body,
			icon,
			data: { url }
		})
	)
})

// Notification click — open the redirectUrl
self.addEventListener('notificationclick', (event) => {
	event.notification.close()
	const url = event.notification.data?.url ?? '/'
	event.waitUntil(
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((windowClients) => {
				const existing = windowClients.find((c) => c.url === url)
				if (existing) return existing.focus()
				return clients.openWindow(url)
			})
	)
})

// Background Sync — tell the main thread to flush its pending ops queue
self.addEventListener('sync', (event) => {
	if (event.tag === 'sync-pending-ops') {
		event.waitUntil(
			clients.matchAll({ type: 'window' }).then((windowClients) => {
				windowClients.forEach((client) =>
					client.postMessage({ type: 'SYNC_PENDING_OPS' })
				)
			})
		)
	}
})
