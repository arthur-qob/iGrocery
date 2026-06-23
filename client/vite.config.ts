import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			// ── Registration ──────────────────────────────────────────────
			// We manage SW registration manually in pushNotifications.tsx
			// so Firebase getToken() can receive the exact registration object.
			injectRegister: false,

			// ── Update strategy ───────────────────────────────────────────
			// New SW is installed immediately; clients are claimed on activate.
			// A subtle update toast is shown by the app via workbox-window.
			registerType: 'autoUpdate',

			// ── Source SW ─────────────────────────────────────────────────
			srcDir: 'src',
			filename: 'sw.ts',

			// ── Dev mode ──────────────────────────────────────────────────
			// Enables the SW during `vite dev` for local testing.
			devOptions: {
				enabled: true,
				type: 'module',
			},

			// ── Workbox config ────────────────────────────────────────────
			strategies: 'injectManifest',
			injectManifest: {
				// Precache everything Vite outputs
				globPatterns: [
					'**/*.{js,css,html,ico,png,svg,woff,woff2,webp,webmanifest}',
				],
				// Exclude the SW itself and source maps
				globIgnores: ['**/sw.js', '**/*.map'],
				// Allow larger chunks (Firebase SDK is big)
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
			},

			// ── Manifest ──────────────────────────────────────────────────
			// vite-plugin-pwa writes this to dist/manifest.webmanifest and
			// injects the <link rel="manifest"> automatically.
			// The public/manifest.json is kept as a fallback for non-Vite
			// environments (e.g. PWABuilder direct URL testing).
			manifest: {
				id: '/',
				name: 'iGrocery',
				short_name: 'iGrocery',
				description: 'Your smart grocery list — shared, synced, and always at hand.',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				orientation: 'portrait',
				background_color: '#1a1a1a',
				theme_color: '#ea580c',
				categories: ['food', 'lifestyle', 'shopping'],
				icons: [
					{
						src: '/icons/icon-72x72.png',
						sizes: '72x72',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/icons/icon-96x96.png',
						sizes: '96x96',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/icons/icon-128x128.png',
						sizes: '128x128',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/icons/icon-144x144.png',
						sizes: '144x144',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/icons/icon-152x152.png',
						sizes: '152x152',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable',
					},
					{
						src: '/icons/icon-384x384.png',
						sizes: '384x384',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: '/icons/icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
				screenshots: [
					{
						src: '/screenshots/lists-wide.png',
						sizes: '1280x800',
						type: 'image/png',
						form_factor: 'wide',
						label: 'Lists dashboard on desktop',
					},
					{
						src: '/screenshots/lists-narrow.png',
						sizes: '390x844',
						type: 'image/png',
						form_factor: 'narrow',
						label: 'Lists dashboard on mobile',
					},
				],
				related_applications: [],
				prefer_related_applications: false,
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	server: {
		proxy: {
			'/api': 'http://localhost:3000',
			'/public/invites': 'http://localhost:3000',
		},
	},
})
