import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SettingsSection from '@/components/settingsSection'
import SettingsRow from '@/components/settingsRow'
import {
	Camera,
	Check,
	KeyRound,
	Loader2,
	LogOut,
	ShoppingCart,
	Trash2,
	UserCircle,
	X
} from 'lucide-react'
import { useAuth } from '@/contexts/authContext'
import { SignOut } from '@/utils/auth'
import { Api } from '@/utils/api'
import { sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { auth, app } from '@/utils/firebase/firebaseConfig'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useTranslation } from 'react-i18next'

const ProfilePanel = () => {
	const { t } = useTranslation()
	const { currentUser } = useAuth()
	const navigate = useNavigate()
	const photoInputRef = useRef<HTMLInputElement>(null)

	const [signingOut, setSigningOut] = useState(false)
	const [resetSent, setResetSent] = useState(false)
	const [resetError, setResetError] = useState<string | null>(null)
	const [resetLoading, setResetLoading] = useState(false)

	// Profile photo
	const [photoURL, setPhotoURL] = useState(currentUser?.photoURL ?? null)
	const [photoLoading, setPhotoLoading] = useState(false)
	const [photoError, setPhotoError] = useState<string | null>(null)

	// Display name editing
	const [editingName, setEditingName] = useState(false)
	const [displayName, setDisplayName] = useState(currentUser?.displayName ?? '')
	const [saveNameLoading, setSaveNameLoading] = useState(false)

	const handleSignOut = async () => {
		setSigningOut(true)
		await SignOut()
		navigate('/')
	}

	const handleResetPassword = async () => {
		if (!currentUser?.email) return
		setResetLoading(true)
		setResetError(null)
		try {
			await sendPasswordResetEmail(auth, currentUser.email)
			setResetSent(true)
		} catch {
			setResetError(t('profile.errors.resetFailed'))
		} finally {
			setResetLoading(false)
		}
	}

	const handleSaveName = async () => {
		if (!displayName.trim()) return
		setSaveNameLoading(true)
		try {
			await Api.updateMe({ displayName: displayName.trim() })
			setEditingName(false)
		} catch {
			// silently ignore
		} finally {
			setSaveNameLoading(false)
		}
	}

	const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file || !currentUser) return

		setPhotoLoading(true)
		setPhotoError(null)
		try {
			const storage = getStorage(app)
			const storageRef = ref(storage, `avatars/${currentUser.uid}`)
			await uploadBytes(storageRef, file)
			const url = await getDownloadURL(storageRef)
			await updateProfile(currentUser, { photoURL: url })
			setPhotoURL(url)
		} catch {
			setPhotoError(t('profile.errors.photoUploadFailed'))
		} finally {
			setPhotoLoading(false)
			// Reset input so the same file can be re-selected if needed
			e.target.value = ''
		}
	}

	return (
		<div className='min-h-screen bg-bg-secondary'>
			<Link
				to='/lists'
				className='flex items-center justify-center gap-2 w-full px-6 md:px-12 lg:px-20 h-16'>
				<div className='p-1.5 rounded-lg'>
					<ShoppingCart size={36} className='text-green-500' />
				</div>
				<span className='text-4xl font-semibold text-text-primary'>
					iGrocery
				</span>
			</Link>

			<main>
				<div className='max-w-2xl mx-auto px-6 md:px-12 py-10 space-y-6'>
					{/* Header */}
					<div>
						<h1 className='text-3xl font-semibold text-text-primary'>
							{t('profile.title')}
						</h1>
						<p className='mt-1 text-text-secondary'>
							{t('profile.subtitle')}
						</p>
					</div>

					{/* Avatar hero */}
					<div className='flex flex-col items-center gap-3 py-6'>
						<div className='relative group'>
							{/* Avatar */}
							<div className='w-50 h-50 rounded-full overflow-hidden bg-bg-tertiary border-4 border-surface shadow-md flex items-center justify-center'>
								{photoURL ? (
									<img
										src={photoURL}
										alt={t('profile.title')}
										className='w-full h-full object-cover'
									/>
								) : (
									<UserCircle
										size={64}
										className='text-text-tertiary'
										strokeWidth={1}
									/>
								)}
							</div>

							{/* Camera overlay button */}
							<button
								type='button'
								disabled={photoLoading}
								onClick={() => photoInputRef.current?.click()}
								className='absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait'>
								{photoLoading ? (
									<Loader2 size={22} className='text-white animate-spin' />
								) : (
									<Camera size={22} className='text-white' />
								)}
							</button>

							<input
								ref={photoInputRef}
								type='file'
								accept='image/*'
								className='hidden'
								onChange={handlePhotoChange}
							/>
						</div>

						{/* Change photo text button */}
						<button
							type='button'
							disabled={photoLoading}
							onClick={() => photoInputRef.current?.click()}
							className='text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors cursor-pointer disabled:opacity-50'>
							{photoLoading ? t('profile.uploading') : t('profile.changePhoto')}
						</button>

						{photoError && (
							<p className='text-xs text-red-500'>{photoError}</p>
						)}

						{/* Name + email summary */}
						{currentUser?.displayName && (
							<p className='text-lg font-semibold text-text-primary'>
								{currentUser.displayName}
							</p>
						)}
						{currentUser?.email && (
							<p className='text-sm text-text-secondary -mt-2'>
								{currentUser.email}
							</p>
						)}
					</div>

					<SettingsSection
						icon={
							photoURL ? (
								<img
									src={photoURL}
									alt={t('profile.title')}
									className='w-5 h-5 rounded-full object-cover'
								/>
							) : (
								<UserCircle size={18} />
							)
						}
						title={t('profile.account')}>

						{/* Display name */}
						<SettingsRow
							label={t('profile.displayName')}
							description={t('profile.displayNameDescription')}>
							{editingName ? (
								<div className='flex items-center gap-2'>
									<input
										type='text'
										value={displayName}
										onChange={(e) => setDisplayName(e.target.value)}
										className='text-sm border-b border-border outline-none bg-transparent text-text-primary w-36'
										autoFocus
									/>
									<button
										type='button'
										disabled={saveNameLoading}
										onClick={handleSaveName}
										className='text-green-500 hover:text-green-600 disabled:opacity-50'>
										{saveNameLoading ? <Loader2 size={15} className='animate-spin' /> : <Check size={15} />}
									</button>
									<button
										type='button'
										onClick={() => { setEditingName(false); setDisplayName(currentUser?.displayName ?? '') }}
										className='text-text-tertiary hover:text-text-secondary'>
										<X size={15} />
									</button>
								</div>
							) : (
								<button
									type='button'
									onClick={() => setEditingName(true)}
									className='text-sm text-text-secondary hover:text-orange-500 transition-colors cursor-pointer'>
									{currentUser?.displayName ?? '—'}
								</button>
							)}
						</SettingsRow>

						{/* Email */}
						<SettingsRow
							label={t('profile.email')}
							description={t('profile.emailDescription')}>
							<span className='text-sm text-text-secondary'>
								{currentUser?.email ?? '—'}
							</span>
						</SettingsRow>

						{/* Reset password */}
						<SettingsRow
							label={t('profile.changePassword')}
							description={t('profile.changePasswordDescription')}>
							{resetSent ? (
								<span className='text-sm text-green-600 flex items-center gap-1'>
									<Check size={14} /> {t('profile.emailSent')}
								</span>
							) : (
								<button
									type='button'
									disabled={resetLoading}
									onClick={handleResetPassword}
									className='flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors cursor-pointer disabled:opacity-50'>
									{resetLoading ? <Loader2 size={15} className='animate-spin' /> : <KeyRound size={15} />}
									{t('profile.sendResetEmail')}
								</button>
							)}
							{resetError && (
								<p className='text-xs text-red-500 mt-1'>{resetError}</p>
							)}
						</SettingsRow>

						{/* Delete account placeholder */}
						<SettingsRow
							label={t('profile.deleteAccount')}
							description={t('profile.deleteAccountDescription')}>
							<button
								type='button'
								className='flex items-center gap-2 text-sm text-red-500 hover:text-red-400 font-medium transition-colors cursor-pointer'>
								<Trash2 size={15} />
								{t('common.delete')}
							</button>
						</SettingsRow>
					</SettingsSection>

					{/* Sign out */}
					<button
						type='button'
						disabled={signingOut}
						onClick={handleSignOut}
						className='w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-medium transition-colors disabled:opacity-60 cursor-pointer'>
						{signingOut ? <Loader2 size={18} className='animate-spin' /> : <LogOut size={18} />}
						{t('profile.signOut')}
					</button>

					<p className='text-center text-xs text-text-secondary pb-4'>
						{t('version')}
					</p>
				</div>
			</main>
		</div>
	)
}

export default ProfilePanel
