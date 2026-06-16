import { useState } from 'react'
import { Bell, Palette, List, ShoppingCart } from 'lucide-react'
import Toggle from '@/components/toggle'
import SettingsSection from '@/components/settingsSection'
import SettingsRow from '@/components/settingsRow'
import ThemeToggler from '@/components/themeToggler'
import CustomSelect from '@/components/customSelect'
import { Link } from 'react-router-dom'
import { usePushNotifications } from '@/contexts/pushNotifications'

type SortOrder = 'name' | 'date-created' | 'date-modified'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
	{ value: 'name', label: 'Name (A–Z)' },
	{ value: 'date-created', label: 'Date created' },
	{ value: 'date-modified', label: 'Last modified' }
]

const loadPref = <T,>(key: string, fallback: T): T => {
	try {
		const stored = localStorage.getItem(key)
		return stored !== null ? (JSON.parse(stored) as T) : fallback
	} catch {
		return fallback
	}
}

const savePref = (key: string, value: unknown) =>
	localStorage.setItem(key, JSON.stringify(value))

const SettingsPanel = () => {
	const [sortOrder, setSortOrder] = useState<SortOrder>(() =>
		loadPref('settings.lists.sortOrder', 'date-modified')
	)
	const [autoArchive, setAutoArchive] = useState<boolean>(() =>
		loadPref('settings.lists.autoArchive', false)
	)

	const { permission, requestPermission } = usePushNotifications()

	const handleSortChange = (value: SortOrder) => {
		setSortOrder(value)
		savePref('settings.lists.sortOrder', value)
	}

	const handleAutoArchiveChange = (value: boolean) => {
		setAutoArchive(value)
		savePref('settings.lists.autoArchive', value)
	}

	const notificationDescription =
		permission === 'granted'
			? 'You will be notified when list members make changes.'
			: permission === 'denied'
				? 'Notifications are blocked. Enable them in your browser settings.'
				: 'Allow iGrocery to send you push notifications.'

	return (
		<div className='min-h-screen bg-bg-secondary'>
			<Link
				to='/lists'
				className='flex items-center justify-center gap-2 w-full px-6 md:px-12 lg:px-20 h-16'>
				<div className='p-1.5 rounded-lg'>
					<ShoppingCart
						size={36}
						className='text-green-500'
					/>
				</div>
				<span className='text-4xl font-semibold text-text-primary'>
					iGrocery
				</span>
			</Link>
			<main>
				<div className='max-w-2xl mx-auto px-6 md:px-12 py-10 space-y-6'>
					<div>
						<h1 className='text-3xl font-semibold text-text-primary'>
							Settings
						</h1>
						<p className='mt-1 text-text-secondary'>
							Manage your preferences
						</p>
					</div>

					{/* Appearance */}
					<SettingsSection
						icon={<Palette size={18} />}
						title='Appearance'>
						<SettingsRow
							label='Theme'
							description='Choose your preferred color scheme'>
							<ThemeToggler />
						</SettingsRow>
					</SettingsSection>

					{/* Lists */}
					<SettingsSection
						icon={<List size={18} />}
						title='Lists'>
						<SettingsRow
							label='Default sort order'
							description='How lists are ordered when you open the app'>
							<CustomSelect
								value={sortOrder}
								options={SORT_OPTIONS}
								onChange={handleSortChange}
							/>
						</SettingsRow>

						<SettingsRow
							label='Auto-archive closed lists'
							description='Automatically hide lists marked as closed'
							disabled={true}
							alert='This feature is not yet implemented'>
							<Toggle
								checked={autoArchive}
								onChange={handleAutoArchiveChange}
							/>
						</SettingsRow>
					</SettingsSection>

					{/* Notifications */}
					<SettingsSection
						icon={<Bell size={18} />}
						title='Notifications'>
						<SettingsRow
							label='Push notifications'
							description={notificationDescription}>
							{permission === 'granted' ? (
								<span className='inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full'>
									<span className='w-1.5 h-1.5 rounded-full bg-green-500' />
									Enabled
								</span>
							) : permission === 'denied' ? (
								<span className='text-xs text-text-tertiary'>
									Blocked
								</span>
							) : (
								<button
									type='button'
									onClick={() => void requestPermission()}
									className='px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer'>
									Enable
								</button>
							)}
						</SettingsRow>
					</SettingsSection>

					<p className='text-center text-xs text-text-secondary pb-4'>
						iGrocery v1.0.0
					</p>
				</div>
			</main>
		</div>
	)
}

export default SettingsPanel
