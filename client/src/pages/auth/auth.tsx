import SignInForm from './signin'
import SignUpForm from './signup'
import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

const Auth = () => {
	const [isSignIn, setIsSignIn] = useState(true)

	const toggleForm = () => {
		setIsSignIn(!isSignIn)
	}

	return (
		<div className='w-full min-h-screen flex flex-col md:flex-row bg-bg-secondary'>
			<section className='hidden md:flex md:w-1/2 h-screen items-center justify-center'>
				<div className='flex flex-col items-center justify-center gap-6 py-10 px-8 animate-fade-in'>
					<div className='mb-4 animate-bounce-slow p-4 rounded-full bg-gradient-to-br from-orange-100 to-orange-50'>
						<ShoppingCart
							size={64}
							className='text-orange-500'
							strokeWidth={1.5}
						/>
					</div>
					<h2 className='text-xl text-text-secondary font-normal text-center tracking-wide'>
						Organize your grocery list with
						<span className='block text-orange-500 font-semibold mt-1'>
							iGrocery
						</span>
					</h2>
					<Link
						to='/'
						className='text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 text-center hover:scale-105 transition-transform duration-300'>
						iGrocery
					</Link>
					<div className='w-16 h-1 bg-orange-500 rounded-full'></div>
					<p className='px-4 py-3 rounded-xl text-lg text-text-primary text-center max-w-sm leading-relaxed bg-orange-500/10 border-l-4 border-orange-500'>
						Smart grocery shopping made simple. Save time, money,
						and stay organized.
					</p>
				</div>
			</section>
			<section className='flex-1 flex items-center justify-center py-10 px-6 md:px-8'>
					<div
						className={`relative bg-surface border border-border w-full max-w-md py-5 rounded-lg shadow-lg flex items-center justify-center ${isSignIn ? 'min-h-140' : 'min-h-165'} transition-all duration-500 ease-in-out`}>
					<div
						className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
							isSignIn
								? 'opacity-100 scale-100'
								: 'opacity-0 scale-95 pointer-events-none'
						}`}>
						<SignInForm onToggleForm={toggleForm} />
					</div>
					<div
						className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
							!isSignIn
								? 'opacity-100 scale-100'
								: 'opacity-0 scale-95 pointer-events-none'
						}`}>
						<SignUpForm onToggleForm={toggleForm} />
					</div>
				</div>
			</section>
		</div>
	)
}

export default Auth
