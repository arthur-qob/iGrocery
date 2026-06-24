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
import ErrorBoundary from '@/components/errorBoundary'
import TutorialTour from '@/components/tutorialTour'
import { useTutorial } from '@/hooks/useTutorial'

const FullScreenSpinner = () => (
	<div className='min-h-screen flex items-center justify-center bg-bg-secondary'>
		<div className='w-8 h-8 rounded-full border-4 border-border border-t-orange-500 animate-spin' />
	</div>
)

/** Redirects to /auth/signin if the user is not authenticated, preserving the current path for post-login redirect. */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { userLoggedIn, loading } = useAuth()
	const location = useLocation()
	if (loading) return <FullScreenSpinner />
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
	if (loading) return <FullScreenSpinner />
	return userLoggedIn ? <Navigate to='/lists' replace /> : <>{children}</>
}

/** Layout wrapper with Navbar for all app pages. */
const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const { currentUser } = useAuth()
	const { showTutorial, dismissTutorial } = useTutorial(currentUser?.uid)

	return (
		<div className='min-h-screen bg-bg-secondary'>
			<TutorialTour run={showTutorial} onFinish={dismissTutorial} />
			<Navbar />
			<main className='pt-16'>
				{children}
			</main>
		</div>
	)
}

const AppRoutes = () => {
	return (
		<ErrorBoundary>
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
		</ErrorBoundary>
	)
}

export default AppRoutes
