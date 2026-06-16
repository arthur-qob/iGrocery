import type { DecodedIdToken } from 'firebase-admin/auth'
import type { Request, Response, NextFunction } from 'express'
import { auth } from '../config/firebase.js'

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: DecodedIdToken
		}
	}
}

export async function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const header = req.headers.authorization
	if (!header?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Missing or invalid Authorization header' })
		return
	}
	try {
		req.user = await auth.verifyIdToken(header.slice(7))
		next()
	} catch {
		res.status(401).json({ error: 'Invalid or expired token' })
	}
}
