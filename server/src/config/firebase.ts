import 'dotenv/config'
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getMessaging } from 'firebase-admin/messaging'

const clientEmail = process.env['FIREBASE_CLIENT_EMAIL']
const privateKey = process.env['FIREBASE_PRIVATE_KEY']

if (!process.env['GOOGLE_APPLICATION_CREDENTIALS'] && (!clientEmail || !privateKey)) {
	throw new Error(
		'Firebase Admin SDK credentials are not configured.\n' +
		'Option A: set GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json in server/.env\n' +
		'Option B: set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in server/.env\n' +
		'Download the service account JSON from Firebase Console → Project Settings → Service Accounts.'
	)
}

const credential = process.env['GOOGLE_APPLICATION_CREDENTIALS']
	? applicationDefault()
	: cert({
			projectId: process.env['FIREBASE_PROJECT_ID']!,
			clientEmail: clientEmail!,
			privateKey: privateKey!.replace(/\\n/g, '\n'),
		})

initializeApp({ credential })

export const db = getFirestore()
export const auth = getAuth()
export const messaging = getMessaging()
