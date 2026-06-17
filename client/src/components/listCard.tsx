import { useRef } from 'react'
import {
	Calendar,
	Check,
	ChevronRight,
	Copy,
	ShoppingCart,
} from 'lucide-react'
import type { GroceryList, UserProfile } from '@/utils/api'
import { useTranslation } from 'react-i18next'

const AVATAR_COLORS = [
	'bg-orange-400',
	'bg-green-500',
	'bg-blue-400',
	'bg-purple-400',
	'bg-pink-400',
	'bg-teal-400',
]

function avatarColor(uid: string): string {
	let hash = 0
	for (let i = 0; i < uid.length; i++) hash += uid.charCodeAt(i)
	return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? 'bg-gray-400'
}

function avatarInitial(profile: UserProfile): string {
	if (profile.displayName) return profile.displayName[0]!.toUpperCase()
	return profile.uid[0]!.toUpperCase()
}

const MemberAvatar = ({ profile }: { profile: UserProfile }) => {
	if (profile.photoURL) {
		return (
			<img
				src={profile.photoURL}
				alt={profile.displayName ?? profile.uid}
				className='w-7 h-7 rounded-full border-2 border-bg-secondary object-cover'
				onError={(e) => {
					e.currentTarget.style.display = 'none'
					e.currentTarget.nextElementSibling?.removeAttribute('style')
				}}
			/>
		)
	}
	return (
		<div
			className={`w-7 h-7 rounded-full border-2 border-bg-secondary flex items-center justify-center text-white text-xs font-semibold ${avatarColor(profile.uid)}`}>
			{avatarInitial(profile)}
		</div>
	)
}

const LONG_PRESS_MS = 500

const ListCard = ({
	list,
	navigate,
	memberProfiles = [],
	onCopy,
	isSelected = false,
	selectionMode = false,
	onLongPress,
	onToggleSelect,
}: {
	list: GroceryList
	navigate: (path: string) => void
	memberProfiles?: UserProfile[]
	onCopy?: (listId: string) => void
	isSelected?: boolean
	selectionMode?: boolean
	onLongPress?: (listId: string) => void
	onToggleSelect?: (listId: string) => void
}) => {
	const { t, i18n } = useTranslation()

	const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const longPressTriggered = useRef(false)
	const pointerStartPos = useRef<{ x: number; y: number } | null>(null)

	const isOpen = list.status === 'OPENED'
	const date = list.createdAt
		? new Date(list.createdAt).toLocaleDateString(i18n.language, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		: null

	const isShared = list.members.length > 1
	const visibleMembers = list.members.slice(0, 3)
	const overflow = list.members.length - 3

	const cancelLongPress = () => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current)
			longPressTimer.current = null
		}
		pointerStartPos.current = null
	}

	const handlePointerDown = (e: React.PointerEvent) => {
		if (selectionMode) return
		pointerStartPos.current = { x: e.clientX, y: e.clientY }
		longPressTriggered.current = false
		longPressTimer.current = setTimeout(() => {
			longPressTriggered.current = true
			cancelLongPress()
			onLongPress?.(list.id)
		}, LONG_PRESS_MS)
	}

	const handlePointerMove = (e: React.PointerEvent) => {
		if (!pointerStartPos.current) return
		const dx = Math.abs(e.clientX - pointerStartPos.current.x)
		const dy = Math.abs(e.clientY - pointerStartPos.current.y)
		if (dx > 8 || dy > 8) cancelLongPress()
	}

	const handlePointerUp = () => cancelLongPress()
	const handlePointerLeave = () => cancelLongPress()

	const handleClick = () => {
		if (longPressTriggered.current) {
			longPressTriggered.current = false
			return
		}
		if (selectionMode) {
			onToggleSelect?.(list.id)
		} else {
			navigate(`/lists/${list.id}`)
		}
	}

	return (
		<div
			className={`relative group cursor-pointer rounded-xl border p-5 shadow-sm transition-all duration-200 select-none touch-manipulation ${
				isSelected
					? 'border-orange-500 bg-selected-bg shadow-md scale-[0.98]'
					: 'border-border-light bg-surface hover:shadow-md hover:-translate-y-0.5'
			}`}
			onClick={handleClick}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerLeave={handlePointerLeave}
			onContextMenu={(e) => e.preventDefault()}>

			{/* Selection checkmark badge */}
			{selectionMode && (
				<div
					className={`absolute top-3 left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
						isSelected
							? 'bg-orange-500 border-orange-500'
							: 'bg-surface border-border'
					}`}>
					{isSelected && <Check size={11} strokeWidth={3} className='text-white' />}
				</div>
			)}

			<div className='flex items-center justify-between mb-4'>
				<div className='h-1.5 w-12 rounded-full mb-4 flex items-center gap-1.5'>
					<div className='bg-orange-500 h-full w-full rounded-full' />
					<div className='bg-green-500 h-full w-full rounded-full' />
				</div>
				<div className='flex items-center gap-1'>
					{onCopy && !selectionMode && (
						<button
							type='button'
							title={t('list.copyList.tooltip')}
							className='hidden md:inline-flex cursor-pointer p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors'
							onClick={(e) => { e.stopPropagation(); onCopy(list.id) }}>
							<Copy size={15} />
						</button>
					)}
					{!selectionMode && (
						<ChevronRight size={20} className='text-text-tertiary' />
					)}
				</div>
			</div>

			<h3 className={`text-lg font-semibold transition-colors truncate ${selectionMode ? 'pl-6' : ''} ${isSelected ? 'text-selected-text' : 'text-text-primary group-hover:text-orange-500'}`}>
				{list.name}
			</h3>

			<div className='mt-3 space-y-2'>
				{date && (
					<div className='flex items-center gap-2 text-sm text-text-secondary'>
						<Calendar size={14} className='text-text-tertiary' />
						<span>{date}</span>
					</div>
				)}
				<div className='flex items-center gap-2 text-sm text-text-secondary'>
					<ShoppingCart size={14} className='text-text-tertiary' />
					<span>{t('lists.memberCount', { count: list.members.length })}</span>
				</div>
			</div>

			<div className='flex flex-row items-center justify-between mt-4'>
				{isShared && (
					<div className='flex items-center -space-x-2'>
						{visibleMembers.map((uid) => {
							const profile = memberProfiles.find((p) => p.uid === uid)
							if (profile) {
								return (
									<div key={uid} className='relative'>
										<MemberAvatar profile={profile} />
									</div>
								)
							}
							return (
								<div
									key={uid}
									className={`w-7 h-7 rounded-full border-2 border-bg-secondary ${avatarColor(uid)}`}
								/>
							)
						})}
						{overflow > 0 && (
							<span className='ml-3 text-xs text-text-secondary'>+{overflow}</span>
						)}
					</div>
				)}

				<span
					className={`ml-auto inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
					{t(`lists.status.${list.status as 'OPENED' | 'CLOSED'}`)}
				</span>
			</div>
		</div>
	)
}

export default ListCard
