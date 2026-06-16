import { useEffect, useRef, useState } from 'react'
import { Plus, ClipboardList, ScanLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ListCard from '@/components/listCard'
import ListCardsSkeleton from '@/components/loadingSkeletons/listCards'
import CreateList from './new/createList'
import QrScannerModal from '@/components/qrScannerModal'
import { getLists, createList } from '@/utils/sync'
import { Api } from '@/utils/api'
import type { GroceryList, UserProfile } from '@/utils/api'

type SortOrder = 'name' | 'date-created' | 'date-modified'

function readSortOrder(): SortOrder {
	try {
		return JSON.parse(
			localStorage.getItem('settings.lists.sortOrder') ??
				'"date-modified"'
		) as SortOrder
	} catch {
		return 'date-modified'
	}
}

function sortLists(lists: GroceryList[], order: SortOrder): GroceryList[] {
	return [...lists].sort((a, b) => {
		if (order === 'name') return a.name.localeCompare(b.name)
		if (order === 'date-created') {
			return (
				new Date(b.createdAt ?? 0).getTime() -
				new Date(a.createdAt ?? 0).getTime()
			)
		}
		// date-modified: fall back to createdAt for lists that predate this feature
		const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
		const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime()
		return bTime - aTime
	})
}

const Lists = () => {
	const [loading, setLoading] = useState<boolean>(true)
	const [lists, setLists] = useState<GroceryList[]>([])
	const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([])
	const [sortOrder, setSortOrder] = useState<SortOrder>(readSortOrder)
	const [showNewListModal, setShowNewListModal] = useState<boolean>(false)
	const [showQrScanner, setShowQrScanner] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const polling = useRef(false)

	const navigate = useNavigate()

	// Reflect sort order changes made on the settings page
	useEffect(() => {
		const handler = (e: StorageEvent) => {
			if (e.key === 'settings.lists.sortOrder')
				setSortOrder(readSortOrder())
		}
		window.addEventListener('storage', handler)
		return () => window.removeEventListener('storage', handler)
	}, [])

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		getLists()
			.then((data) => {
				if (cancelled) return
				setLists(data)
				const uids = [...new Set(data.flatMap((l) => l.members))]
				if (uids.length > 0) {
					Api.getUserProfiles(uids)
						.then((profiles) => {
							if (!cancelled) setMemberProfiles(profiles)
						})
						.catch(() => {
							/* profiles are non-critical, silently skip */
						})
				}
			})
			.catch(() => {
				if (!cancelled)
					setError('Failed to load lists. Please try again.')
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [])

	// ── Live polling ─────────────────────────────────────────────────────────
	useEffect(() => {
		if (loading) return
		const tick = async () => {
			if (polling.current || document.hidden) return
			polling.current = true
			try {
				const data = await Api.getLists()
				setLists(data)
			} catch {
				// silently ignore — network blips shouldn't disrupt the UI
			} finally {
				polling.current = false
			}
		}
		const id = setInterval(() => { void tick() }, 5000)
		return () => clearInterval(id)
	}, [loading])

	const handleQrDetected = (raw: string) => {
		setShowQrScanner(false)
		try {
			const { pathname } = new URL(raw)
			if (/^\/invite\/\w+$/.test(pathname)) navigate(pathname)
		} catch {
			// not a valid URL — ignore
		}
	}

	const handleCreateList = async (name: string) => {
		setError(null)
		const newList = await createList(name)
		setShowNewListModal(false)
		if (newList) {
			navigate(`/lists/${newList.id}`)
		} else {
			// Offline: refresh local list
			const updated = await getLists()
			setLists(updated)
		}
	}

	return (
		<section className='px-6 md:px-12 lg:px-20 py-8 flex flex-col gap-8'>
			{showNewListModal && (
				<CreateList
					onClose={() => setShowNewListModal(false)}
					onCreate={handleCreateList}
				/>
			)}

			{showQrScanner && (
				<QrScannerModal
					onDetected={handleQrDetected}
					onClose={() => setShowQrScanner(false)}
				/>
			)}

			{/* Header */}
			<div className='flex items-end justify-between'>
				<div>
					<h1 className='text-3xl font-semibold text-text-primary'>
						Lists
					</h1>
					<p className='mt-1 text-text-secondary max-w-[160px] sm:max-w-xs md:max-w-none'>
						Organize and manage your grocery lists
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						title='Scan invite QR code'
						className='flex items-center gap-2 border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary font-medium px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200'
						onClick={() => setShowQrScanner(true)}>
						<ScanLine size={18} />
						<span className='hidden sm:inline text-sm'>Scan QR</span>
					</button>
					<button
						type='button'
						className='flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg cursor-pointer transition-colors duration-200'
						onClick={() => setShowNewListModal(true)}>
						<Plus size={18} />
						<span className='hidden sm:inline'>New List</span>
					</button>
				</div>
			</div>

			{error && (
				<div className='rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600'>
					{error}
				</div>
			)}

			{/* Loading skeleton */}
			{loading ? (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{Array.from({ length: 8 }).map((_, index) => (
						<ListCardsSkeleton
							key={index}
							index={index}
						/>
					))}
				</div>
			) : lists.length > 0 ? (
				/* List cards */
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{sortLists(lists, sortOrder).map((list) => (
						<ListCard
							key={list.id}
							list={list}
							navigate={navigate}
							memberProfiles={memberProfiles.filter((p) =>
								list.members.includes(p.uid)
							)}
						/>
					))}
				</div>
			) : (
				/* Empty state */
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<div className='rounded-full bg-orange-50 p-6 mb-6'>
						<ClipboardList
							size={48}
							className='text-orange-500'
						/>
					</div>
					<h2 className='text-xl font-semibold text-text-primary'>
						No lists yet
					</h2>
					<p className='mt-2 text-text-secondary max-w-sm'>
						Create your first grocery list to start organizing your
						shopping
					</p>
					<button
						type='button'
						className='mt-6 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200'
						onClick={() => setShowNewListModal(true)}>
						<Plus size={18} />
						Create New List
					</button>
				</div>
			)}
		</section>
	)
}

export default Lists
