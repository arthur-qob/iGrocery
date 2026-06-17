// i18n must be initialised before any component renders
import './i18n/config'
import './i18n/types'

import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app.tsx'
import { BrowserRouter } from 'react-router-dom'
import { PushNotificationsProvider } from './contexts/pushNotifications.tsx'
import { ThemeContextProvider } from './contexts/theme.tsx'
import { AuthProvider } from './contexts/authContext.tsx'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{/* Suspense is required by i18next-resources-to-backend while the
		    locale JSON is being lazily fetched on first load */}
		<Suspense fallback={null}>
			<ThemeContextProvider>
				<AuthProvider>
					<PushNotificationsProvider>
						<BrowserRouter>
							<App />
						</BrowserRouter>
					</PushNotificationsProvider>
				</AuthProvider>
			</ThemeContextProvider>
		</Suspense>
	</StrictMode>
)
