import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SignUp } from '@/utils/auth'

interface SignUpFormProps {
	onToggleForm?: () => void
}

const SignUpForm = ({ onToggleForm }: SignUpFormProps) => {
	const navigate = useNavigate()
	const location = useLocation()
	const from = (location.state as { from?: string } | null)?.from ?? '/lists'
	const [showPassword, setShowPassword] = useState<boolean>(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (password !== confirmPassword) {
			setError('Passwords do not match.')
			return
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters.')
			return
		}

		setLoading(true)
		try {
			await SignUp({ mode: 'email&pswd', name, email, password })
			navigate(from, { replace: true })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Sign up failed'
			setError(friendlyError(msg))
		} finally {
			setLoading(false)
		}
	}

	const handleGoogle = async () => {
		setError(null)
		setLoading(true)
		try {
			await SignUp({ mode: 'google', name: '', email: null, password: null })
			navigate(from, { replace: true })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : 'Sign up failed'
			setError(friendlyError(msg))
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='w-full max-w-md px-8'>
			<h1 className='text-3xl font-medium mb-10 text-center text-text-primary'>
				Sign Up
			</h1>

			<form className='flex flex-col gap-5' onSubmit={handleSubmit}>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='signup-name'
						className='text-sm text-text-secondary font-medium'>
						Name
					</label>
					<input
						autoFocus
						type='text'
						name='name'
						id='signup-name'
						placeholder='Enter your name'
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className='w-full outline-none border-0 border-b-2 border-border focus:border-orange-500 bg-transparent pb-2 text-lg text-text-primary placeholder:text-text-tertiary transition-colors duration-200'
					/>
				</div>

				<div className='flex flex-col gap-1'>
					<label
						htmlFor='signup-email'
						className='text-sm text-text-secondary font-medium'>
						Email
					</label>
					<input
						type='email'
						name='email'
						id='signup-email'
						placeholder='Enter your email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className='w-full outline-none border-0 border-b-2 border-border focus:border-orange-500 bg-transparent pb-2 text-lg text-text-primary placeholder:text-text-tertiary transition-colors duration-200'
					/>
				</div>

				<div className='flex flex-col gap-1'>
					<label
						htmlFor='signup-password'
						className='text-sm text-text-secondary font-medium'>
						Password
					</label>
					<div className='flex flex-row items-center justify-between border-b-2 border-border focus-within:border-orange-500 pb-2 transition-colors duration-200'>
						<input
							type={showPassword ? 'text' : 'password'}
							name='password'
							id='signup-password'
							placeholder='Enter your password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className='flex-1 outline-none border-none bg-transparent text-lg text-text-primary placeholder:text-text-tertiary'
						/>
						<button
							type='button'
							onClick={() => setShowPassword((prev) => !prev)}
							className='text-text-tertiary hover:text-text-secondary transition-colors duration-200 ml-2'>
							{showPassword ? (
								<EyeOff size={20} />
							) : (
								<Eye size={20} />
							)}
						</button>
					</div>
				</div>

				<div className='flex flex-col gap-1'>
					<label
						htmlFor='signup-confirm-password'
						className='text-sm text-text-secondary font-medium'>
						Confirm Password
					</label>
					<div className='flex flex-row items-center justify-between border-b-2 border-border focus-within:border-orange-500 pb-2 transition-colors duration-200'>
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							name='confirmPassword'
							id='signup-confirm-password'
							placeholder='Confirm your password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							className='flex-1 outline-none border-none bg-transparent text-lg text-text-primary placeholder:text-text-tertiary'
						/>
						<button
							type='button'
							onClick={() =>
								setShowConfirmPassword((prev) => !prev)
							}
							className='text-text-tertiary hover:text-text-secondary transition-colors duration-200 ml-2'>
							{showConfirmPassword ? (
								<EyeOff size={20} />
							) : (
								<Eye size={20} />
							)}
						</button>
					</div>
				</div>

				{error && (
					<p className='text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2'>
						{error}
					</p>
				)}

				<button
					type='submit'
					disabled={loading}
					className='w-full flex items-center justify-center gap-2 text-white font-medium text-lg py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300 mt-4'>
					{loading ? <Loader2 size={20} className='animate-spin' /> : null}
					Sign Up
				</button>

				<div className='flex items-center gap-4'>
					<span className='flex-1 border-t border-border'></span>
					<span className='text-text-secondary'>OR</span>
					<span className='flex-1 border-t border-border'></span>
				</div>

				<button
					type='button'
					onClick={handleGoogle}
					disabled={loading}
					className='w-full text-text-secondary font-medium text-lg py-3 rounded-xl border border-border hover:bg-bg-tertiary disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300'>
					Sign In with Google
				</button>
			</form>

			<div className='mt-3 text-center'>
				{onToggleForm ? (
					<button
						type='button'
						onClick={onToggleForm}
						className='text-orange-500 hover:text-orange-600 transition-colors duration-300 underline border-none cursor-pointer bg-transparent font-medium'>
						Already have an account? Sign in now!
					</button>
				) : (
					<Link
						to='/signin'
						className='text-orange-500 hover:text-orange-600 transition-colors duration-300 underline font-medium'>
						Already have an account? Sign in now!
					</Link>
				)}
			</div>
		</div>
	)
}

function friendlyError(msg: string): string {
	if (msg.includes('email-already-in-use'))
		return 'This email is already registered.'
	if (msg.includes('invalid-email'))
		return 'Please enter a valid email address.'
	if (msg.includes('weak-password'))
		return 'Password is too weak. Use at least 6 characters.'
	if (msg.includes('network-request-failed'))
		return 'Network error. Check your connection.'
	return msg
}

export default SignUpForm
