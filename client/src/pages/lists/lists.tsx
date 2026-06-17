import { useCallback, useEffect, useRef, useState } from 'react'
import { ClipboardList, Copy, Plus, ScanLine, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ListCard from '@/components/listCard'
import ListCardsSkeleton from '@/components/loadingSkeletons/listCards'
import CreateList from './new/createList'
import QrScannerModal from '@/components/qrScannerModal'
import { getLists, createList, copyList, deleteList, leaveList } from '@/utils/sync'
import { Api } from '@/utils/api'
import type { GroceryList, UserProfile } from '@/utils/api'
import { useAuth } from '@/contexts/authContext'
import { useTranslation } from 'react-i18next'

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
		const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
		const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime()
		return bTime - aTime
	})
}

const Lists = () => {
	const { t } = useTranslation()
	const { currentUser } = useAuth()
	const [loading, setLoading] = useState<boolean>(true)
	const [lists, setLists] = useState<GroceryList[]>([])
	const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([])
	const [sortOrder, setSortOrder] = useState<SortOrder>(readSortOrder)
	const [showNewListModal, setShowNewListModal] = useState<boolean>(false)
	const [showQrScanner, setShowQrScanner] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
	const [actionLoading, setActionLoading] = useState(false)
	const polling = useRef(false)

	const navigate = useNavigate()
	const selectionMode = selectedIds.size > 0

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
						.catch(() => { /* profiles are non-critical */ })
				}
			})
			.catch(() => {
				if (!cancelled) setError(t('lists.loadError'))
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => { cancelled = true }
	}, [t])

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

	const handleCopyList = async (listId: string) => {
		const newList = await copyList(listId)
		if (newList) setLists((prev) => [newList, ...prev])
	}

	const handleCreateList = async (name: string) => {
		setError(null)
		const newList = await createList(name)
		setShowNewListModal(false)
		if (newList) {
			navigate(`/lists/${newList.id}`)
		} else {
			const updated = await getLists()
			setLists(updated)
		}
	}

	// ── Selection handlers ────────────────────────────────────────────────────

	const handleLongPress = useCallback((listId: string) => {
		setSelectedIds(new Set([listId]))
	}, [])

	const handleToggleSelect = useCallback((listId: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(listId)) next.delete(listId)
			else next.add(listId)
			return next
		})
	}, [])

	const handleClearSelection = () => setSelectedIds(new Set())

	const handleCopySelected = async () => {
		const ids = [...selectedIds]
		setSelectedIds(new Set())
		setActionLoading(true)
		const copies = await Promise.all(ids.map((id) => copyList(id)))
		const newLists = copies.filter((l): l is GroceryList => l !== null)
		if (newLists.length > 0) setLists((prev) => [...newLists, ...prev])
		setActionLoading(false)
	}

	const handleDeleteSelected = async () => {
		const ids = [...selectedIds]
		setSelectedIds(new Set())
		setActionLoading(true)
		await Promise.all(
			ids.map((id) => {
				const list = lists.find((l) => l.id === id)
				if (!list) return Promise.resolve()
				return list.userId === currentUser?.uid
					? deleteList(id)
					: leaveList(id)
			})
		)
		setLists((prev) => prev.filter((l) => !ids.includes(l.id)))
		setActionLoading(false)
	}

	return (
		<section className='px-6 md:px-12 lg:px-20 py-8 flex flex-col gap-8'>
			{/* Selection action bar — sits over the navbar (z-50 > navbar z-40) */}
			<div
				className={`fixed top-0 left-0 right-0 z-50 h-16 bg-orange-500 shadow-lg flex items-center justify-between px-4 md:px-12 lg:px-20 transition-all duration-200 ${
					selectionMode ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
				}`}>
				<div className='flex items-center gap-3'>
					<button
						type='button'
						className='p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer'
						onClick={handleClearSelection}>
						<X size={20} />
					</button>
					<span className='text-white font-medium'>
						{t('lists.selectedCount', { count: selectedIds.size })}
					</span>
				</div>
				<div className='flex items-center gap-1'>
					<button
						type='button'
						disabled={actionLoading}
						className='flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/20 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50'
						onClick={() => void handleCopySelected()}>
						<Copy size={18} />
						<span className='hidden sm:inline'>{t('list.copyList.tooltip')}</span>
					</button>
					<button
						type='button'
						disabled={actionLoading}
						className='flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-red-600/60 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50'
						onClick={() => void handleDeleteSelected()}>
						<Trash2 size={18} />
						<span className='hidden sm:inline'>{t('common.delete')}</span>
					</button>
				</div>
			</div>

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
						{t('lists.title')}
					</h1>
					<p className='mt-1 text-text-secondary max-w-[160px] sm:max-w-xs md:max-w-none'>
						{t('lists.subtitle')}
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<button
						type='button'
						title={t('lists.scanQR')}
						className='flex items-center gap-2 border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary font-medium px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200'
						onClick={() => setShowQrScanner(true)}>
						<ScanLine size={18} />
						<span className='hidden sm:inline text-sm'>{t('lists.scanQR')}</span>
					</button>
					<button
						type='button'
						className='flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg cursor-pointer transition-colors duration-200'
						onClick={() => setShowNewListModal(true)}>
						<Plus size={18} />
						<span className='hidden sm:inline'>{t('lists.newList')}</span>
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
						<ListCardsSkeleton key={index} index={index} />
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
							onCopy={handleCopyList}
							isSelected={selectedIds.has(list.id)}
							selectionMode={selectionMode}
							onLongPress={handleLongPress}
							onToggleSelect={handleToggleSelect}
						/>
					))}
				</div>
			) : (
				/* Empty state */
				<div className='flex flex-col items-center justify-center py-24 text-center'>
					<div className='rounded-full bg-orange-50 p-6 mb-6'>
						<ClipboardList size={48} className='text-orange-500' />
					</div>
					<h2 className='text-xl font-semibold text-text-primary'>
						{t('lists.noListsTitle')}
					</h2>
					<p className='mt-2 text-text-secondary max-w-sm'>
						{t('lists.noListsSubtitle')}
					</p>
					<button
						type='button'
						className='mt-6 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg cursor-pointer transition-colors duration-200'
						onClick={() => setShowNewListModal(true)}>
						<Plus size={18} />
						{t('lists.createNewList')}
					</button>
				</div>
			)}
		</section>
	)
}

export default Lists
