import { useState } from 'react'
import { Bell, Palette, List, ShoppingCart } from 'lucide-react'
import Toggle from '@/components/toggle'
import SettingsSection from '@/components/settingsSection'
import SettingsRow from '@/components/settingsRow'
import ThemeToggler from '@/components/themeToggler'
import CustomSelect from '@/components/customSelect'
import { Link } from 'react-router-dom'
import { usePushNotifications } from '@/contexts/pushNotifications'
import { useTranslation } from 'react-i18next'

type SortOrder = 'name' | 'date-created' | 'date-modified'

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
	const { t } = useTranslation()

	// Sort options are built from translations so they update when locale changes
	const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
		{ value: 'name', label: t('settings.lists.sortOptions.name') },
		{ value: 'date-created', label: t('settings.lists.sortOptions.dateCreated') },
		{ value: 'date-modified', label: t('settings.lists.sortOptions.dateModified') },
	]

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
			? t('settings.notifications.descriptionGranted')
			: permission === 'denied'
				? t('settings.notifications.descriptionDenied')
				: t('settings.notifications.descriptionDefault')

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
							{t('settings.title')}
						</h1>
						<p className='mt-1 text-text-secondary'>
							{t('settings.subtitle')}
						</p>
					</div>

					{/* Appearance */}
					<SettingsSection
						icon={<Palette size={18} />}
						title={t('settings.appearance.title')}>
						<SettingsRow
							label={t('settings.appearance.theme')}
							description={t('settings.appearance.themeDescription')}>
							<ThemeToggler />
						</SettingsRow>
					</SettingsSection>

					{/* Lists */}
					<SettingsSection
						icon={<List size={18} />}
						title={t('settings.lists.title')}>
						<SettingsRow
							label={t('settings.lists.sortOrder')}
							description={t('settings.lists.sortOrderDescription')}>
							<CustomSelect
								value={sortOrder}
								options={SORT_OPTIONS}
								onChange={handleSortChange}
							/>
						</SettingsRow>

						<SettingsRow
							label={t('settings.lists.autoArchive')}
							description={t('settings.lists.autoArchiveDescription')}
							disabled={true}
							alert={t('settings.lists.autoArchiveAlert')}>
							<Toggle
								checked={autoArchive}
								onChange={handleAutoArchiveChange}
							/>
						</SettingsRow>
					</SettingsSection>

					{/* Notifications */}
					<SettingsSection
						icon={<Bell size={18} />}
						title={t('settings.notifications.title')}>
						<SettingsRow
							label={t('settings.notifications.pushNotifications')}
							description={notificationDescription}>
							{permission === 'granted' ? (
								<span className='inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full'>
									<span className='w-1.5 h-1.5 rounded-full bg-green-500' />
									{t('common.enabled')}
								</span>
							) : permission === 'denied' ? (
								<span className='text-xs text-text-tertiary'>
									{t('common.blocked')}
								</span>
							) : (
								<button
									type='button'
									onClick={() => void requestPermission()}
									className='px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors cursor-pointer'>
									{t('common.enable')}
								</button>
							)}
						</SettingsRow>
					</SettingsSection>

					<p className='text-center text-xs text-text-secondary pb-4'>
						{t('version')}
					</p>
				</div>
			</main>
		</div>
	)
}

export default SettingsPanel
