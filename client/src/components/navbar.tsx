import { LogOut, Menu, Cog, ShoppingCart, UserCircle, X } from 'lucide-react'
import ThemeToggler from './themeToggler'
import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/authContext'
import { SignOut } from '@/utils/auth'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { userLoggedIn, currentUser } = useAuth()
	const [menuOpen, setMenuOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(e.target as Node)
			) {
				setMenuOpen(false)
			}
		}
		if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
		return () =>
			document.removeEventListener('mousedown', handleClickOutside)
	}, [menuOpen])

	const handleSignOut = async () => {
		setMenuOpen(false)
		await SignOut()
		navigate('/')
	}

	return (
		<header className='fixed top-0 inset-x-0 z-40 bg-surface border-b border-border-light shadow-sm'>
			<div className='flex items-center justify-between px-6 md:px-12 lg:px-20 h-16'>
				<button
					type='button'
					className='flex items-center gap-2 cursor-pointer'
					onClick={() => navigate('/lists')}>
					<div className='p-1.5 rounded-lg'>
						<ShoppingCart
							size={26}
							className='text-green-500'
						/>
					</div>
					<span className='text-2xl font-semibold text-text-primary'>
						iGrocery
					</span>
				</button>

				{/* Desktop actions */}
				<div className='hidden sm:flex items-center gap-1'>
					<button
						className='p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer'
						onClick={() => navigate('/settings')}>
						<Cog size={24} />
					</button>
					<button
						className='p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer'
						onClick={() => navigate('/profile')}>
						{currentUser?.photoURL ? (
							<img
								src={currentUser.photoURL}
								alt={t('nav.profile')}
								className='w-7 h-7 rounded-full object-cover ring-2 ring-border'
							/>
						) : (
							<UserCircle size={24} />
						)}
					</button>
					{userLoggedIn && (
						<button
							className='p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer'
							title={t('nav.signOut')}
							onClick={handleSignOut}>
							<LogOut size={22} />
						</button>
					)}
					<ThemeToggler />
				</div>

				{/* Mobile hamburger */}
				<div
					className='relative sm:hidden'
					ref={menuRef}>
					<button
						className='p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer'
						onClick={() => setMenuOpen((prev) => !prev)}>
						{menuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>

					{menuOpen && (
						<div className='absolute right-0 top-full mt-2 w-48 bg-surface border border-border-light rounded-xl shadow-lg py-2 z-50'>
							<button
								className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer'
								onClick={() => {
									navigate('/settings')
									setMenuOpen(false)
								}}>
								<Cog size={18} />
								{t('nav.settings')}
							</button>
							<button
								className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer'
								onClick={() => {
									navigate('/profile')
									setMenuOpen(false)
								}}>
								{currentUser?.photoURL ? (
									<img
										src={currentUser.photoURL}
										alt={t('nav.profile')}
										className='w-5 h-5 rounded-full object-cover ring-1 ring-border'
									/>
								) : (
									<UserCircle size={18} />
								)}
								{t('nav.profile')}
							</button>
							<div className='text-sm text-text-secondary hover:text-text-primary px-4 py-2.5 flex items-center gap-3'>
								{t('nav.theme')}
								<ThemeToggler />
							</div>
							{userLoggedIn && (
								<button
									className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer'
									onClick={handleSignOut}>
									<LogOut size={18} />
									{t('nav.signOut')}
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</header>
	)
}

export default Navbar
