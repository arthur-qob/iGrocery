import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, ShoppingCart, X } from 'lucide-react'
import { Api } from '@/utils/api'

const AcceptInvite = () => {
	const { token } = useParams<{ token: string }>()
	const navigate = useNavigate()

	const [listName, setListName] = useState<string | null>(null)
	const [listId, setListId] = useState<string | null>(null)
	const [loadError, setLoadError] = useState<string | null>(null)
	const [accepting, setAccepting] = useState(false)
	const [acceptError, setAcceptError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!token) return
		Api.getInvitePreview(token)
			.then(({ listId, listName }) => {
				setListId(listId)
				setListName(listName)
			})
			.catch(() => setLoadError('This invite link is invalid or has expired.'))
			.finally(() => setLoading(false))
	}, [token])

	const handleAccept = async () => {
		if (!token) return
		setAccepting(true)
		setAcceptError(null)
		try {
			const { listId } = await Api.acceptInvite(token)
			navigate(`/lists/${listId}`, { replace: true })
		} catch {
			setAcceptError('Failed to join the list. Please try again.')
			setAccepting(false)
		}
	}

	const handleDecline = () => {
		navigate('/lists')
	}

	if (loading) {
		return (
			<section className='flex flex-col items-center justify-center min-h-[60vh]'>
				<Loader2 size={32} className='animate-spin text-text-tertiary' />
			</section>
		)
	}

	if (loadError) {
		return (
			<section className='px-4 md:px-12 lg:px-20 py-16 flex flex-col items-center gap-6 text-center'>
				<div className='p-4 rounded-full bg-red-50'>
					<X size={32} className='text-red-400' />
				</div>
				<div>
					<h1 className='text-2xl font-semibold text-text-primary mb-2'>Invalid Invite</h1>
					<p className='text-text-secondary'>{loadError}</p>
				</div>
				<button
					type='button'
					onClick={() => navigate('/lists')}
					className='cursor-pointer px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors'>
					Go to my lists
				</button>
			</section>
		)
	}

	return (
		<section className='px-4 md:px-12 lg:px-20 py-16 flex flex-col items-center gap-8 text-center'>
			<div className='p-5 rounded-full bg-gradient-to-br from-green-100 to-green-50'>
				<ShoppingCart size={40} className='text-green-500' strokeWidth={1.5} />
			</div>

			<div className='flex flex-col gap-2'>
				<p className='text-text-secondary text-sm font-medium uppercase tracking-wider'>
					You've been invited to join
				</p>
				<h1 className='text-3xl font-bold text-text-primary'>{listName}</h1>
			</div>

			<p className='text-text-secondary max-w-sm'>
				Would you like to join this grocery list? You'll be able to view and edit items together with the other members.
			</p>

			{acceptError && (
				<p className='text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2'>
					{acceptError}
				</p>
			)}

			<div className='flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs'>
				<button
					type='button'
					onClick={handleAccept}
					disabled={accepting}
					className='cursor-pointer w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold text-lg transition-colors'>
					{accepting ? <Loader2 size={18} className='animate-spin' /> : null}
					{accepting ? 'Joining…' : 'Join List'}
				</button>
				<button
					type='button'
					onClick={handleDecline}
					disabled={accepting}
					className='cursor-pointer w-full px-6 py-3 rounded-xl border border-border text-text-secondary hover:bg-bg-tertiary disabled:opacity-60 font-medium text-lg transition-colors'>
					Decline
				</button>
			</div>

			{listId && (
				<button
					type='button'
					onClick={() => navigate(`/lists/${listId}`)}
					className='text-sm text-text-tertiary hover:text-text-secondary transition-colors underline'>
					Already a member? Go to the list
				</button>
			)}
		</section>
	)
}

export default AcceptInvite
