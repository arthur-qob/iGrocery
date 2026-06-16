import 'dotenv/config'
import './config/firebase.js'
import express from 'express'
import cors from 'cors'
import { authMiddleware } from './middleware/auth.js'
import listsRouter from './routes/lists.js'
import itemsRouter from './routes/items.js'
import usersRouter from './routes/users.js'
import invitesRouter from './routes/invites.js'
import publicRouter from './routes/public.js'

const app = express()
const port = process.env['PORT'] ?? 3000

const allowedOrigins = (process.env['CLIENT_URL'] ?? 'http://localhost:5173')
	.split(',')
	.map((o) => o.trim())

app.use(
	cors({
		origin: (origin, cb) => {
			if (!origin || allowedOrigins.includes(origin)) cb(null, true)
			else cb(new Error(`Origin ${origin} not allowed by CORS`))
		},
		methods: ['GET', 'POST', 'PATCH', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
)
app.use(express.json())

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' })
})

app.use('/public', publicRouter)

app.use('/api', authMiddleware)
app.use('/api/lists', listsRouter)
app.use('/api/lists/:listId/items', itemsRouter)
app.use('/api/users', usersRouter)
app.use('/api/invites', invitesRouter)

app.use(
	(
		err: Error,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction
	) => {
		console.error(err)
		res.status(500).json({ error: 'Internal server error' })
	}
)

app.listen(port, () => {
	console.log(`Server running on port ${port}`)
})
