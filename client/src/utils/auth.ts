import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	updateProfile
} from 'firebase/auth'
import { auth } from './firebase/firebaseConfig'

const provider = new GoogleAuthProvider()

export const SignIn = async ({
	mode,
	email,
	password
}: {
	mode: 'email&pswd' | 'google'
	email: string | null
	password: string | null
}): Promise<void> => {
	if (mode === 'email&pswd') {
		if (email === null || password === null) return
		await signInWithEmailAndPassword(auth, email, password)
	} else if (mode === 'google') {
		await signInWithPopup(auth, provider)
	}
}

export const SignUp = async ({
	mode,
	name,
	email,
	password
}: {
	mode: 'email&pswd' | 'google'
	name: string
	email: string | null
	password: string | null
}): Promise<void> => {
	if (mode === 'email&pswd') {
		if (email === null || password === null) return
		const result = await createUserWithEmailAndPassword(auth, email, password)
		if (name) {
			await updateProfile(result.user, { displayName: name })
		}
	} else if (mode === 'google') {
		await signInWithPopup(auth, provider)
	}
}

export const SignOut = async (): Promise<void> => {
	await signOut(auth)
}
