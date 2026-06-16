import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '@/utils/firebase/firebaseConfig'

type AuthContextType = {
	currentUser: User | null
	userLoggedIn: boolean
	loading: boolean
	getIdToken: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
	const ctx = useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
	return ctx
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [userLoggedIn, setUserLoggedIn] = useState(false)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setCurrentUser(user)
			setUserLoggedIn(user !== null)
			setLoading(false)
		})
		return unsubscribe
	}, [])

	const getIdToken = (): Promise<string> => {
		if (!currentUser) return Promise.reject(new Error('Not authenticated'))
		return currentUser.getIdToken()
	}

	return (
		<AuthContext.Provider
			value={{ currentUser, userLoggedIn, loading, getIdToken }}
		>
			{children}
		</AuthContext.Provider>
	)
}
