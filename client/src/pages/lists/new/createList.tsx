import { Loader2, X } from 'lucide-react'
import { useState } from 'react'

type Props = {
	onClose: () => void
	onCreate: (name: string) => Promise<void>
}

const CreateList = ({ onClose, onCreate }: Props) => {
	const [name, setName] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!name.trim()) return
		setLoading(true)
		await onCreate(name.trim())
		setLoading(false)
	}

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
			onClick={onClose}>
			<div
				className='bg-surface rounded-2xl shadow-xl w-full max-w-md mx-4 p-6'
				onClick={(e) => e.stopPropagation()}>
				<div className='flex items-center justify-between mb-6'>
					<h2 className='text-xl font-semibold text-text-primary'>
						Create New List
					</h2>
					<button
						type='button'
						className='cursor-pointer rounded-lg p-1 text-text-tertiary hover:bg-bg-tertiary hover:text-text-secondary transition-colors'
						onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				<form className='flex flex-col gap-4' onSubmit={handleSubmit}>
					<input
						type='text'
						placeholder='List name'
						autoFocus
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className='w-full text-lg py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent text-text-primary placeholder:text-text-tertiary'
					/>
					<div className='flex justify-end gap-3 mt-2'>
						<button
							type='button'
							className='cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors'
							onClick={onClose}>
							Cancel
						</button>
						<button
							type='submit'
							disabled={loading || !name.trim()}
							className='cursor-pointer flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors'>
							{loading ? <Loader2 size={14} className='animate-spin' /> : null}
							Create
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default CreateList
