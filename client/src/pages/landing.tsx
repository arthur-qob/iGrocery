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
import { useTranslation } from 'react-i18next'

const LandingPage = () => {
	const { t } = useTranslation()

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
						{t('landing.badge')}
					</div>

					<h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight'>
						{t('landing.heroTitle')}
					</h1>

					<p className='text-lg sm:text-xl text-text-secondary mb-10 leading-relaxed max-w-2xl mx-auto'>
						{t('landing.heroSubtitle')}
					</p>

					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Link
							to='/auth/signup'
							className='bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg'>
							{t('landing.getStartedFree')}
						</Link>
						<Link
							to='/auth/signin'
							className='border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-semibold transition-all'>
							{t('landing.signIn')}
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
										{t('landing.features.smartLists.title')}
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
						{t('landing.featuresTitle')}
					</h2>
					<p className='text-center text-text-secondary mb-16 text-lg max-w-2xl mx-auto'>
						{t('landing.featuresSubtitle')}
					</p>

					<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{/* Feature 1 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-orange-500 border border-border-light'>
							<div className='bg-orange-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<ListTodo size={28} className='text-orange-600' />
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>{t('landing.features.smartLists.title')}</h3>
							<p className='text-text-secondary mb-4'>{t('landing.features.smartLists.description')}</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.smartLists.customQuantities')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.smartLists.unitConversions')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.smartLists.weightTracking')}</li>
							</ul>
						</div>

						{/* Feature 2 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-green-500 border border-border-light'>
							<div className='bg-green-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<Users size={28} className='text-green-600' />
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>{t('landing.features.collaborate.title')}</h3>
							<p className='text-text-secondary mb-4'>{t('landing.features.collaborate.description')}</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.collaborate.inviteByApp')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.collaborate.realtimeSync')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.collaborate.seeWhosShopping')}</li>
							</ul>
						</div>

						{/* Feature 3 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-blue-500 border border-border-light'>
							<div className='bg-blue-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<QrCode size={28} className='text-blue-500' />
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>{t('landing.features.quickShare.title')}</h3>
							<p className='text-text-secondary mb-4'>{t('landing.features.quickShare.description')}</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.quickShare.qrCodeSharing')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.quickShare.emailInvites')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.quickShare.secureLinks')}</li>
							</ul>
						</div>

						{/* Feature 4 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-purple-500 border border-border-light'>
							<div className='bg-purple-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<Package size={28} className='text-purple-500' />
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>{t('landing.features.itemDetails.title')}</h3>
							<p className='text-text-secondary mb-4'>{t('landing.features.itemDetails.description')}</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.itemDetails.detailedSpecs')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.itemDetails.notesTags')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.itemDetails.priceEstimates')}</li>
							</ul>
						</div>

						{/* Feature 5 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-pink-500 border border-border-light'>
							<div className='bg-pink-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<Mail size={28} className='text-pink-500' />
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>{t('landing.features.emailSharing.title')}</h3>
							<p className='text-text-secondary mb-4'>{t('landing.features.emailSharing.description')}</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.emailSharing.oneClickJoin')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.emailSharing.noAppRequired')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.emailSharing.easyAccess')}</li>
							</ul>
						</div>

						{/* Feature 6 */}
						<div className='bg-surface rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow border-l-4 border-red-500 border border-border-light'>
							<div className='bg-red-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6'>
								<ShoppingCart size={28} className='text-red-500' />
							</div>
							<h3 className='text-xl font-bold text-text-primary mb-3'>{t('landing.features.alwaysSynced.title')}</h3>
							<p className='text-text-secondary mb-4'>{t('landing.features.alwaysSynced.description')}</p>
							<ul className='space-y-2 text-sm text-text-secondary'>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.alwaysSynced.crossDeviceSync')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.alwaysSynced.offlineAccess')}</li>
								<li className='flex gap-2'><span className='text-green-500 font-bold'>✓</span>{t('landing.features.alwaysSynced.autoSave')}</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className='px-6 sm:px-12 lg:px-20 py-20 bg-bg-secondary' id='how-it-works'>
				<div className='max-w-4xl mx-auto'>
					<h2 className='text-3xl sm:text-4xl font-bold text-center text-text-primary mb-16'>
						{t('landing.howItWorksTitle')}
					</h2>

					<div className='space-y-8'>
						{[
							{ key: 'step1', color: 'bg-orange-500', step: 1 },
							{ key: 'step2', color: 'bg-green-500', step: 2 },
							{ key: 'step3', color: 'bg-blue-500', step: 3 },
							{ key: 'step4', color: 'bg-purple-500', step: 4 },
						].map(({ key, color, step }) => (
							<div key={key} className='flex gap-5 sm:gap-8 items-start'>
								<div className='flex-shrink-0'>
									<div className={`flex items-center justify-center h-12 w-12 rounded-full ${color} text-white font-bold text-lg`}>
										{step}
									</div>
								</div>
								<div>
									<h3 className='text-xl sm:text-2xl font-bold text-text-primary mb-2'>
										{t(`landing.steps.${key as 'step1' | 'step2' | 'step3' | 'step4'}.title`)}
									</h3>
									<p className='text-text-secondary text-base sm:text-lg'>
										{t(`landing.steps.${key as 'step1' | 'step2' | 'step3' | 'step4'}.description`)}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='px-6 sm:px-12 lg:px-20 py-20'>
				<div className='max-w-4xl mx-auto bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 sm:p-12 lg:p-16 text-center shadow-2xl'>
					<h2 className='text-3xl sm:text-4xl font-bold text-white mb-6'>
						{t('landing.ctaTitle')}
					</h2>
					<p className='text-lg sm:text-xl text-orange-50 mb-10 max-w-2xl mx-auto'>
						{t('landing.ctaSubtitle')}
					</p>
					<Link
						to='/auth/signup'
						className='inline-block bg-white hover:bg-gray-100 text-orange-600 px-10 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg'>
						{t('landing.startFreeAccount')}
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className='bg-bg-tertiary text-text-secondary border-t border-border px-6 sm:px-12 lg:px-20 py-12'>
				<div className='max-w-6xl mx-auto'>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-8'>
						<div>
							<h3 className='text-text-primary font-bold mb-4'>iGrocery</h3>
							<p className='text-sm'>{t('landing.footer.tagline')}</p>
						</div>
						<div>
							<h4 className='text-text-primary font-semibold mb-4'>{t('landing.footer.product')}</h4>
							<ul className='space-y-2 text-sm'>
								<li><a href='#' className='hover:text-white transition'>{t('landing.footer.links.features')}</a></li>
								<li><a href='#' className='hover:text-white transition'>{t('landing.footer.links.pricing')}</a></li>
								<li><a href='#' className='hover:text-white transition'>{t('landing.footer.links.security')}</a></li>
							</ul>
						</div>
						<div>
							<h4 className='text-text-primary font-semibold mb-4'>{t('landing.footer.company')}</h4>
							<ul className='space-y-2 text-sm'>
								<li><a href='#' className='hover:text-white transition'>{t('landing.footer.links.about')}</a></li>
								<li><a href='#' className='hover:text-white transition'>{t('landing.footer.links.blog')}</a></li>
								<li><a href='#' className='hover:text-white transition'>{t('landing.footer.links.contact')}</a></li>
							</ul>
						</div>
						<div>
							<h4 className='text-text-primary font-semibold mb-4'>{t('landing.footer.legal')}</h4>
							<ul className='space-y-2 text-sm'>
								<li><a href='#' className='hover:text-white transition'>{t('landing.footer.links.privacy')}</a></li>
								<li><a href='#' className='hover:text-white transition'>{t('landing.footer.links.terms')}</a></li>
								<li><a href='#' className='hover:text-white transition'>{t('landing.footer.links.cookies')}</a></li>
							</ul>
						</div>
					</div>
					<div className='border-t border-border pt-8 text-center text-sm'>
						<p>{t('landing.footer.copyright')}</p>
					</div>
				</div>
			</footer>
		</div>
	)
}

export default LandingPage
