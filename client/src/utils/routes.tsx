import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Auth from '@/pages/auth/auth'
import LandingPage from '@/pages/landing'
import Lists from '@/pages/lists/lists'
import List from '@/pages/lists/list'
import AcceptInvite from '@/pages/invite/acceptInvite'
import { useAuth } from '@/contexts/authContext'
import SettingsPanel from '@/pages/settings/settingsPanel'
import ProfilePanel from '@/pages/profile/profilePanel'
import Navbar from '@/components/navbar'

/** Redirects to /auth/signin if the user is not authenticated, preserving the current path for post-login redirect. */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { userLoggedIn, loading } = useAuth()
	const location = useLocation()
	if (loading) return null
	return userLoggedIn ? (
		<>{children}</>
	) : (
		<Navigate
			to='/auth/signin'
			state={{ from: location.pathname }}
			replace
		/>
	)
}

/** Redirects logged-in users away from auth pages. */
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
	const { userLoggedIn, loading } = useAuth()
	if (loading) return null
	return userLoggedIn ? <Navigate to='/lists' replace /> : <>{children}</>
}

/** Layout wrapper with Navbar for all app pages. */
const AppLayout = ({ children }: { children: React.ReactNode }) => (
	<div className='min-h-screen bg-bg-secondary'>
		<Navbar />
		<main className='pt-16'>
			{children}
		</main>
	</div>
)

const AppRoutes = () => {
	return (
		<Routes>
			<Route
				index
				path='/'
				element={<LandingPage />}
			/>
			<Route
				path='/auth/signin'
				element={
					<GuestRoute>
						<Auth />
					</GuestRoute>
				}
			/>
			<Route
				path='/auth/signup'
				element={
					<GuestRoute>
						<Auth />
					</GuestRoute>
				}
			/>
			<Route
				path='/lists'
				element={
					<ProtectedRoute>
						<AppLayout>
							<Lists />
						</AppLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path='/lists/:id'
				element={
					<ProtectedRoute>
						<AppLayout>
							<List />
						</AppLayout>
					</ProtectedRoute>
				}
			/>
			<Route
				path='/settings'
				element={
					<ProtectedRoute>
						<SettingsPanel />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/profile'
				element={
					<ProtectedRoute>
						<ProfilePanel />
					</ProtectedRoute>
				}
			/>
			<Route
				path='/invite/:token'
				element={
					<ProtectedRoute>
						<AppLayout>
							<AcceptInvite />
						</AppLayout>
					</ProtectedRoute>
				}
			/>
			{/* Legacy /dashboard → redirect to /lists */}
			<Route
				path='/dashboard'
				element={<Navigate to='/lists' replace />}
			/>
		</Routes>
	)
}

export default AppRoutes
