import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import ThemeToggler from '@/components/themeToggler'

const NavBar = () => {
	const navigate = useNavigate()
	const [isOpen, setIsOpen] = useState(false)

	const toggleMenu = () => setIsOpen(!isOpen)

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id)
		element?.scrollIntoView({ behavior: 'smooth' })
		setIsOpen(false)
	}

	const navItems = [
		{ label: 'Features', id: 'features' },
		{ label: 'How It Works', id: 'how-it-works' },
		{ label: 'About', href: '#' },
		{ label: 'Contact', href: '#' }
	]

	return (
		<nav className='relative w-full px-6 sm:px-12 lg:px-20 py-4 flex justify-between items-center'>
			{/* Logo */}
			<Link
				to='/'
				className='flex items-center gap-2 hover:opacity-80 transition'>
				<div className='bg-gradient-to-r from-orange-500 to-green-500 p-2 rounded-lg'>
					<ShoppingCart
						size={24}
						className='text-white'
					/>
				</div>
				<span className='text-xl font-bold text-text-primary'>
					iGrocery
				</span>
			</Link>

			{/* Desktop Navigation */}
			<div className='hidden md:flex items-center gap-8'>
				{navItems.map((item) => (
					<button
						key={item.label}
						onClick={() => item.id && scrollToSection(item.id)}
						className='text-text-secondary hover:text-orange-500 font-medium transition-colors cursor-pointer'>
						{item.label}
					</button>
				))}
			</div>

			{/* Desktop right side: theme toggler + auth buttons */}
			<div className='hidden md:flex gap-4 items-center'>
				<ThemeToggler />
				<button
					type='button'
					onClick={() => navigate('/auth/signin')}
					className='text-text-secondary hover:text-orange-500 font-medium transition-colors'>
					Sign In
				</button>
				<button
					type='button'
					onClick={() => navigate('/auth/signup')}
					className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all'>
					Sign Up
				</button>
			</div>

			{/* Mobile: theme toggler + hamburger */}
			<div className='md:hidden flex items-center gap-2'>
				<ThemeToggler />
				<button
					type='button'
					onClick={toggleMenu}
					className='p-2 hover:bg-bg-tertiary rounded-lg transition text-text-secondary'>
					{isOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{/* Mobile Menu */}
			{isOpen && (
				<div className='absolute top-full left-0 right-0 bg-surface border-b border-border md:hidden shadow-lg z-50'>
					<div className='px-6 py-4 space-y-4'>
						<div className='space-y-3'>
							{navItems.map((item) => (
								<button
									key={item.label}
									onClick={() =>
										item.id && scrollToSection(item.id)
									}
									className='block w-full text-left text-text-secondary hover:text-orange-500 font-medium transition-colors py-2 cursor-pointer'>
									{item.label}
								</button>
							))}
						</div>

						<div className='flex flex-col gap-3 pt-4 border-t border-border'>
							<button
								type='button'
								onClick={() => {
									navigate('/auth/signin')
									setIsOpen(false)
								}}
								className='text-text-secondary hover:text-orange-500 font-medium transition-colors py-2 cursor-pointer text-left'>
								Sign In
							</button>
							<button
								type='button'
								onClick={() => {
									navigate('/auth/signup')
									setIsOpen(false)
								}}
								className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all w-full cursor-pointer'>
								Sign Up
							</button>
						</div>
					</div>
				</div>
			)}
		</nav>
	)
}

export default NavBar
