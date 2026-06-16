import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app.tsx'
import { BrowserRouter } from 'react-router-dom'
import { PushNotificationsProvider } from './contexts/pushNotifications.tsx'
import { ThemeContextProvider } from './contexts/theme.tsx'
import { AuthProvider } from './contexts/authContext.tsx'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeContextProvider>
			<AuthProvider>
				<PushNotificationsProvider>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</PushNotificationsProvider>
			</AuthProvider>
		</ThemeContextProvider>
	</StrictMode>
)
