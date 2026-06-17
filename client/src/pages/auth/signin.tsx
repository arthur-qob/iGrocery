import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SignIn } from '@/utils/auth'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

interface SignInFormProps {
	onToggleForm?: () => void
}

const SignInForm = ({ onToggleForm }: SignInFormProps) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()
	const from = (location.state as { from?: string } | null)?.from ?? '/lists'
	const [showPassword, setShowPassword] = useState<boolean>(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			await SignIn({ mode: 'email&pswd', email, password })
			navigate(from, { replace: true })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : t('auth.errors.signInFailed')
			setError(friendlyError(msg, t))
		} finally {
			setLoading(false)
		}
	}

	const handleGoogle = async () => {
		setError(null)
		setLoading(true)
		try {
			await SignIn({ mode: 'google', email: null, password: null })
			navigate(from, { replace: true })
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : t('auth.errors.signInFailed')
			setError(friendlyError(msg, t))
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='w-full max-w-md px-8'>
			<h1 className='text-3xl font-medium mb-10 text-center text-text-primary'>
				{t('auth.signIn')}
			</h1>

			<form className='flex flex-col gap-6' onSubmit={handleSubmit}>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='signin-email'
						className='text-sm text-text-secondary font-medium'>
						{t('auth.email')}
					</label>
					<input
						autoFocus
						type='email'
						name='email'
						id='signin-email'
						placeholder={t('auth.enterEmail')}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className='w-full outline-none border-0 border-b-2 border-border focus:border-green-500 bg-transparent pb-2 text-lg text-text-primary placeholder:text-text-tertiary transition-colors duration-200'
					/>
				</div>

				<div className='flex flex-col gap-1'>
					<label
						htmlFor='signin-password'
						className='text-sm text-text-secondary font-medium'>
						{t('auth.password')}
					</label>
					<div className='flex flex-row items-center justify-between border-b-2 border-border focus-within:border-green-500 pb-2 transition-colors duration-200'>
						<input
							type={showPassword ? 'text' : 'password'}
							name='password'
							id='signin-password'
							placeholder={t('auth.enterPassword')}
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

				{error && (
					<p className='text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2'>
						{error}
					</p>
				)}

				<button
					type='submit'
					disabled={loading}
					className='w-full flex items-center justify-center gap-2 text-white font-medium text-lg py-3 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300'>
					{loading ? <Loader2 size={20} className='animate-spin' /> : null}
					{t('auth.signIn')}
				</button>

				<div className='flex items-center gap-4'>
					<span className='flex-1 border-t border-border'></span>
					<span className='text-text-secondary'>{t('common.or')}</span>
					<span className='flex-1 border-t border-border'></span>
				</div>

				<button
					type='button'
					onClick={handleGoogle}
					disabled={loading}
					className='w-full text-text-secondary font-medium text-lg py-3 rounded-xl border border-border hover:bg-bg-tertiary disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-300'>
					{t('auth.signInWithGoogle')}
				</button>
			</form>

			<div className='mt-8 text-center'>
				{onToggleForm ? (
					<button
						type='button'
						onClick={onToggleForm}
						className='text-green-500 hover:text-green-600 transition-colors duration-300 underline bg-none border-none cursor-pointer'>
						{t('auth.noAccountYet')}
					</button>
				) : (
					<Link
						to='/signup'
						className='text-green-500 hover:text-green-600 transition-colors duration-300 underline'>
						{t('auth.noAccountYet')}
					</Link>
				)}
			</div>
		</div>
	)
}

function friendlyError(msg: string, t: TFunction): string {
	if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential'))
		return t('auth.errors.invalidCredential')
	if (msg.includes('too-many-requests'))
		return t('auth.errors.tooManyRequests')
	if (msg.includes('network-request-failed'))
		return t('auth.errors.networkError')
	return msg
}

export default SignInForm
