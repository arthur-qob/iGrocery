import {
	Calendar,
	ChevronRight,
	ShoppingCart,
} from 'lucide-react'
import type { GroceryList, UserProfile } from '@/utils/api'

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
					// fallback to initials if image fails to load
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

const ListCard = ({
	list,
	navigate,
	memberProfiles = [],
}: {
	list: GroceryList
	navigate: (path: string) => void
	memberProfiles?: UserProfile[]
}) => {
	const isOpen = list.status === 'OPENED'
	const date = list.createdAt
		? new Date(list.createdAt).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		: null

	const isShared = list.members.length > 1
	const visibleMembers = list.members.slice(0, 3)
	const overflow = list.members.length - 3

	return (
		<div
			className='group cursor-pointer rounded-xl border border-border-light bg-surface p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'
			onClick={() => navigate(`/lists/${list.id}`)}>
			<div className='flex items-center justify-between mb-4'>
				<div className='h-1.5 w-12 rounded-full mb-4 flex items-center gap-1.5'>
					<div className='bg-orange-500 h-full w-full rounded-full' />
					<div className='bg-green-500 h-full w-full rounded-full' />
				</div>
				<ChevronRight
					size={20}
					className='text-text-tertiary'
				/>
			</div>

			<h3 className='text-lg font-semibold text-text-primary group-hover:text-orange-500 transition-colors truncate'>
				{list.name}
			</h3>

			<div className='mt-3 space-y-2'>
				{date && (
					<div className='flex items-center gap-2 text-sm text-text-secondary'>
						<Calendar
							size={14}
							className='text-text-tertiary'
						/>
						<span>{date}</span>
					</div>
				)}
				<div className='flex items-center gap-2 text-sm text-text-secondary'>
					<ShoppingCart
						size={14}
						className='text-text-tertiary'
					/>
					<span>{list.members.length} member{list.members.length !== 1 ? 's' : ''}</span>
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
							// Profile not loaded yet — show placeholder circle
							return (
								<div
									key={uid}
									className={`w-7 h-7 rounded-full border-2 border-bg-secondary ${avatarColor(uid)}`}
								/>
							)
						})}
						{overflow > 0 && (
							<span className='ml-3 text-xs text-text-secondary'>
								+{overflow}
							</span>
						)}
					</div>
				)}

				<span
					className={`ml-auto inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
					{isOpen ? 'OPEN' : 'CLOSED'}
				</span>
			</div>
		</div>
	)
}

export default ListCard
