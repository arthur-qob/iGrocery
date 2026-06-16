import NavBar from '@/components/landingNavbar'
import {
	ShoppingCart,
	Users,
	QrCode,
	Mail,
	ListTodo,
	Package
} from 'lucide-react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
	return (
		<div className='min-h-screen bg-bg'>
			{/* Navigation */}
			<div className='sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border'>
				<NavBar />
			</div>

			{/* Hero Section */}
			<section className='px-6 sm:px-12 lg:px-20 py-20 sm:py-28'>
				<div className='max-w-4xl mx-auto text-center'>
					<div className='inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full mb-6 text-sm font-medium'>
						<ShoppingCart size={18} />
						Smart Shopping Made Simple
					</div>

					<h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight'>
						Shop Smarter, Together
					</h1>

					<p className='text-lg sm:text-xl text-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto'>
						Create organized shopping lists, collaborate with
						friends and family in real-time, and never forget an
						item again. All in one beautiful app.
					</p>

					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Link
							to='/auth/signup'
							className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg'>
							Get Started Free
						</Link>
						<Link
							to='/auth/signin'
							className='border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-semibold transition-all'>
							Sign In
						</Link>
					</div>

					{/* Hero Illustration */}
					<div className='mt-16 relative'>
						<div className='w-full h-72 bg-gradient-to-br from-green-500/10 to-orange-500/10 border border-border shadow-2xl rounded-2xl flex items-center justify-center'>
							<div className='grid grid-cols-3 gap-4'>
								<div className='bg-surface p-4 rounded-lg shadow-md border border-border transform hover:scale-110 transition-transform'>
									<ShoppingCart
										size={32}
										className='text-orange-500 mx-auto mb-2'
									/>
									<p className='text-xs font-semibold text-text-primary'>
										Lists
									</p>
								</div>
								<div className='bg-surface p-4 rounded-lg shadow-md border border-border transform hover:scale-110 transition-transform'>
									<Users
										size={32}
										className='text-green-500 mx-auto mb-2'
									/>
									<p className='text-xs font-semibold text-text-primary'>
										Collaborate
									</p>
								</div>
								<div className='bg-surface p-4 rounded-lg shadow-md border border-border transform hover:scale-110 transition-transform'>
									<QrCode
										size={32}
										className='text-blue-500 mx-auto mb-2'
									/>
									<p className='text-xs font-semibold text-text-primary'>
										Share
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='px-6 sm:px-12 lg:px-20 py-20'>
				<div className='max-w-6xl mx-auto'>
					<h2 className='text-3xl sm:text-4xl font-bold text-center text-text-primary mb-4'>
						Powerful Features
					</h2>
					<p className='text-center text-text-secondary mb-16 text-lg max-w-2xl mx-auto'>
						Everything you need to organize your shopping and
						collaborate with loved ones
					</p>

					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{/* Feature 1 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-orange-500 border border-border-light'>
							<div className='bg-orange-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<ListTodo
									size={28}
									className='text-orange-600'
								/>
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>
								Smart Lists
							</h3>
							<p className='text-text-secondary mb-4'>
								Create unlimited shopping lists with detailed
								item specifications including quantities, units,
								and weights.
							</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Custom quantities
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Unit conversions
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Weight tracking
								</li>
							</ul>
						</div>

						{/* Feature 2 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-green-500 border border-border-light'>
							<div className='bg-green-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<Users
									size={28}
									className='text-green-600'
								/>
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>
								Collaborate in Real-Time
							</h3>
							<p className='text-text-secondary mb-4'>
								Invite friends and family to share and
								collaborate on lists. See updates instantly as
								they shop.
							</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Invite by app
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Real-time sync
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									See who's shopping
								</li>
							</ul>
						</div>

						{/* Feature 3 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-blue-500 border border-border-light'>
							<div className='bg-blue-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<QrCode
									size={28}
									className='text-blue-500'
								/>
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>
								Quick Share
							</h3>
							<p className='text-text-secondary mb-4'>
								Generate QR codes for instant sharing, or invite
								via email. Your way, your choice.
							</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									QR code sharing
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Email invites
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Secure links
								</li>
							</ul>
						</div>

						{/* Feature 4 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-purple-500 border border-border-light'>
							<div className='bg-purple-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<Package
									size={28}
									className='text-purple-500'
								/>
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>
								Item Details
							</h3>
							<p className='text-text-secondary mb-4'>
								Track quantities, units, weights, and more.
								Perfect for meal planning and budget tracking.
							</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Detailed specs
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Notes & tags
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Price estimates
								</li>
							</ul>
						</div>

						{/* Feature 5 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-pink-500 border border-border-light'>
							<div className='bg-pink-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<Mail
									size={28}
									className='text-pink-500'
								/>
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>
								Email Sharing
							</h3>
							<p className='text-text-secondary mb-4'>
								Send invitations via email to make it easy for
								anyone to join your shopping lists.
							</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									One-click join
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									No app required
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Easy access
								</li>
							</ul>
						</div>

						{/* Feature 6 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-red-500 border border-border-light'>
							<div className='bg-red-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<ShoppingCart
									size={28}
									className='text-red-500'
								/>
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>
								Always Synced
							</h3>
							<p className='text-text-secondary mb-4'>
								Your lists are always up to date across all your
								devices. Shop from phone, tablet, or desktop.
							</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Cross-device sync
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Offline access
								</li>
								<li className='flex gap-2'>
									<span className='text-green-500 font-bold'>
										✓
									</span>
									Auto-save
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='px-6 sm:px-12 lg:px-20 py-20 bg-bg-secondary' id='how-it-works'>
				<div className='max-w-4xl mx-auto'>
					<h2 className='text-3xl sm:text-4xl font-bold text-center text-text-primary mb-16'>
						How It Works
					</h2>

					<div className='space-y-8'>
						{/* Step 1 */}
						<div className='flex gap-5 sm:gap-8 items-start'>
							<div className='flex-shrink-0'>
								<div className='flex items-center justify-center h-12 w-12 rounded-full bg-orange-500 text-white font-bold text-lg'>
									1
								</div>
							</div>
							<div>
								<h3 className='text-xl sm:text-2xl font-bold text-text-primary mb-2'>
									Create Your List
								</h3>
								<p className='text-text-secondary text-base sm:text-lg'>
									Start by creating a new shopping list. Add
									items with specific quantities, units,
									weights, and notes for each product.
								</p>
							</div>
						</div>

						{/* Step 2 */}
						<div className='flex gap-5 sm:gap-8 items-start'>
							<div className='flex-shrink-0'>
								<div className='flex items-center justify-center h-12 w-12 rounded-full bg-green-500 text-white font-bold text-lg'>
									2
								</div>
							</div>
							<div>
								<h3 className='text-xl sm:text-2xl font-bold text-text-primary mb-2'>
									Invite Collaborators
								</h3>
								<p className='text-text-secondary text-base sm:text-lg'>
									Share your list by generating a QR code,
									sending an email invite, or inviting
									directly from the app. Multiple sharing
									options for maximum flexibility.
								</p>
							</div>
						</div>

						{/* Step 3 */}
						<div className='flex gap-5 sm:gap-8 items-start'>
							<div className='flex-shrink-0'>
								<div className='flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white font-bold text-lg'>
									3
								</div>
							</div>
							<div>
								<h3 className='text-xl sm:text-2xl font-bold text-text-primary mb-2'>
									Shop Together
								</h3>
								<p className='text-text-secondary text-base sm:text-lg'>
									See real-time updates as family or friends
									add items, check off purchases, and make
									changes. Stay perfectly coordinated while
									shopping.
								</p>
							</div>
						</div>

						{/* Step 4 */}
						<div className='flex gap-5 sm:gap-8 items-start'>
							<div className='flex-shrink-0'>
								<div className='flex items-center justify-center h-12 w-12 rounded-full bg-purple-500 text-white font-bold text-lg'>
									4
								</div>
							</div>
							<div>
								<h3 className='text-xl sm:text-2xl font-bold text-text-primary mb-2'>
									Stay Organized
								</h3>
								<p className='text-text-secondary text-base sm:text-lg'>
									Check off items as you buy them, reuse lists
									for recurring shopping trips, and keep your
									shopping history for future reference.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='px-6 sm:px-12 lg:px-20 py-20'>
				<div className='max-w-4xl mx-auto bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 sm:p-12 lg:p-16 text-center shadow-2xl'>
					<h2 className='text-3xl sm:text-4xl font-bold text-white mb-6'>
						Ready to Shop Smarter?
					</h2>
					<p className='text-lg sm:text-xl text-orange-50 mb-10 max-w-2xl mx-auto'>
						Join thousands of users who are already organizing their
						shopping with iGrocery. Create your first list
						today—it's completely free!
					</p>
					<Link
						to='/auth/signup'
						className='inline-block bg-white hover:bg-gray-100 text-orange-600 px-10 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg'>
						Start Your Free Account
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className='bg-bg-tertiary text-text-secondary border-t border-border px-6 sm:px-12 lg:px-20 py-12'>
				<div className='max-w-6xl mx-auto'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-8'>
						<div>
							<h3 className='text-text-primary font-bold mb-4'>
								iGrocery
							</h3>
							<p className='text-sm'>
								Smart shopping lists for families and friends.
							</p>
						</div>
						<div>
							<h4 className='text-text-primary font-semibold mb-4'>
								Product
							</h4>
							<ul className='space-y-2 text-sm'>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Features
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Pricing
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Security
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className='text-text-primary font-semibold mb-4'>
								Company
							</h4>
							<ul className='space-y-2 text-sm'>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										About
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Blog
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Contact
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className='text-text-primary font-semibold mb-4'>
								Legal
							</h4>
							<ul className='space-y-2 text-sm'>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Privacy
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Terms
									</a>
								</li>
								<li>
									<a
										href='#'
										className='hover:text-white transition'>
										Cookies
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className='border-t border-border pt-8 text-center text-sm'>
						<p>&copy; 2026 iGrocery. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	)
}

export default LandingPage
