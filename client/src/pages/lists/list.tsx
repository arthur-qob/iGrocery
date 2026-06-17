import { useEffect, useRef, useState } from 'react'
import {
	Check,
	ChevronDown,
	ChevronLeft,
	Copy,
	Edit,
	Loader2,
	LogOut,
	Plus,
	QrCode,
	Share,
	Trash,
	X
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getList, getItems, createItem, updateItem, deleteItem, updateList, deleteList, leaveList, copyList } from '@/utils/sync'
import { Api } from '@/utils/api'
import type { GroceryList, GroceryItem } from '@/utils/api'
import { useCurrency, CURRENCY_OPTIONS } from '@/hooks/useCurrency'
import { useAuth } from '@/contexts/authContext'
import { useTranslation } from 'react-i18next'

// ── Edit Item Modal ──────────────────────────────────────────────────────────

type WeightUnit = 'kg' | 'lbs' | 'oz'

type EditItemModalProps = {
	item: GroceryItem
	onClose: () => void
	onSave: (data: Partial<Omit<GroceryItem, 'id'>>) => Promise<void>
}

const EditItemModal = ({ item, onClose, onSave }: EditItemModalProps) => {
	const { t } = useTranslation()
	const [name, setName] = useState(item.name)
	const [quantity, setQuantity] = useState(String(item.quantity))
	const [price, setPrice] = useState(String(item.price))
	const [weightValue, setWeightValue] = useState(String(item.weight?.value ?? ''))
	const [weightUnit, setWeightUnit] = useState<WeightUnit>(item.weight?.unit ?? 'kg')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		const data: Partial<Omit<GroceryItem, 'id'>> = {
			name: name.trim(),
			quantity: parseInt(quantity, 10),
			price: parseFloat(price),
		}
		if (weightValue) {
			data.weight = { value: parseFloat(weightValue), unit: weightUnit }
		}
		await onSave(data)
		setLoading(false)
	}

	return (
		<div
			className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm'
			onClick={onClose}>
			<div
				className='bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6'
				onClick={(e) => e.stopPropagation()}>
				<div className='flex items-center justify-between mb-6'>
					<h2 className='text-xl font-semibold text-text-primary'>{t('list.editItem.title')}</h2>
					<button
						type='button'
						className='cursor-pointer rounded-lg p-1 text-text-tertiary hover:bg-bg-tertiary hover:text-text-secondary transition-colors'
						onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				<form className='flex flex-col gap-4' onSubmit={handleSubmit}>
					<div className='flex flex-col gap-1'>
						<label className='text-sm font-medium text-text-primary'>{t('list.editItem.name')}</label>
						<input
							type='text'
							autoFocus
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent text-text-primary placeholder:text-text-tertiary'
						/>
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium text-text-primary'>{t('list.editItem.quantity')}</label>
							<input
								type='number'
								min={1}
								value={quantity}
								onChange={(e) => setQuantity(e.target.value)}
								required
								className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent text-text-primary'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium text-text-primary'>{t('list.editItem.price')}</label>
							<input
								type='number'
								step='0.01'
								min={0}
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								required
								className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent text-text-primary'
							/>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium text-text-primary'>
								{t('list.editItem.weight')}{' '}
								<span className='text-text-tertiary font-normal'>{t('list.editItem.weightOptional')}</span>
							</label>
							<input
								type='number'
								step='0.1'
								min={0}
								value={weightValue}
								onChange={(e) => setWeightValue(e.target.value)}
								className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent text-text-primary'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='text-sm font-medium text-text-primary'>{t('list.editItem.unit')}</label>
							<select
								value={weightUnit}
								onChange={(e) => setWeightUnit(e.target.value as WeightUnit)}
								className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-surface text-text-primary'>
								<option value='kg'>{t('list.units.kg')}</option>
								<option value='lbs'>{t('list.units.lbs')}</option>
								<option value='oz'>{t('list.units.oz')}</option>
							</select>
						</div>
					</div>
					<div className='flex justify-end gap-3 mt-2'>
						<button
							type='button'
							className='cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors'
							onClick={onClose}>
							{t('list.editItem.cancel')}
						</button>
						<button
							type='submit'
							disabled={loading}
							className='cursor-pointer flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white transition-colors'>
							{loading ? <Loader2 size={14} className='animate-spin' /> : null}
							{t('list.editItem.save')}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

// ── Share Modal ──────────────────────────────────────────────────────────────

type ShareModalProps = {
	listId: string
	onClose: () => void
}

const ShareModal = ({ listId, onClose }: ShareModalProps) => {
	const { t } = useTranslation()
	const [inviteUrl, setInviteUrl] = useState<string | null>(null)
	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
	const [showQr, setShowQr] = useState(false)
	const [copied, setCopied] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		Api.createInvite(listId)
			.then(({ token }) => {
				setInviteUrl(`${window.location.origin}/invite/${token}`)
			})
			.catch(() => setError(t('list.share.error')))
			.finally(() => setLoading(false))
	}, [listId, t])

	const handleCopy = async () => {
		if (!inviteUrl) return
		await navigator.clipboard.writeText(inviteUrl)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const handleToggleQr = async () => {
		if (!inviteUrl) return
		if (!qrDataUrl) {
			const QRCode = await import('qrcode')
			const dataUrl = await QRCode.default.toDataURL(inviteUrl, { margin: 1, width: 200 })
			setQrDataUrl(dataUrl)
		}
		setShowQr((v) => !v)
	}

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
			onClick={onClose}>
			<div
				className='bg-surface rounded-2xl shadow-xl w-full max-w-md mx-4 p-6'
				onClick={(e) => e.stopPropagation()}>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold text-text-primary'>{t('list.share.title')}</h2>
					<button
						type='button'
						className='cursor-pointer rounded-lg p-1 text-text-tertiary hover:bg-bg-tertiary transition-colors'
						onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				{loading && (
					<div className='flex items-center justify-center py-8'>
						<Loader2 size={24} className='animate-spin text-text-tertiary' />
					</div>
				)}

				{error && (
					<p className='text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2'>{error}</p>
				)}

				{inviteUrl && (
					<div className='flex flex-col gap-4'>
						<p className='text-sm text-text-secondary'>
							{t('list.share.description')}
						</p>

						<div className='flex items-center gap-2'>
							<input
								type='text'
								readOnly
								value={inviteUrl}
								className='flex-1 min-w-0 text-sm py-2 px-3 rounded-lg border border-border bg-bg-secondary text-text-secondary outline-none'
							/>
							<button
								type='button'
								onClick={handleCopy}
								className='shrink-0 cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-colors'>
								{copied ? <Check size={15} /> : <Copy size={15} />}
								{copied ? t('list.share.copied') : t('list.share.copy')}
							</button>
						</div>

						<button
							type='button'
							onClick={handleToggleQr}
							className='cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-bg-secondary transition-colors'>
							<QrCode size={16} />
							{showQr ? t('list.share.hideQR') : t('list.share.showQR')}
						</button>

						{showQr && qrDataUrl && (
							<div className='flex justify-center p-3 bg-white rounded-xl'>
								<img src={qrDataUrl} alt='Invite QR code' className='rounded' />
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}

// ── Confirm Modal ────────────────────────────────────────────────────────────

type ConfirmModalProps = {
	title: string
	message: string
	confirmLabel: string
	danger?: boolean
	onConfirm: () => void
	onClose: () => void
}

const ConfirmModal = ({ title, message, confirmLabel, danger = false, onConfirm, onClose }: ConfirmModalProps) => {
	const { t } = useTranslation()
	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
			onClick={onClose}>
			<div
				className='bg-surface rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6'
				onClick={(e) => e.stopPropagation()}>
				<h2 className='text-lg font-semibold text-text-primary'>{title}</h2>
				<p className='mt-2 text-sm text-text-secondary'>{message}</p>
				<div className='flex justify-end gap-3 mt-6'>
					<button
						type='button'
						className='cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors'
						onClick={onClose}>
						{t('common.cancel')}
					</button>
					<button
						type='button'
						className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
							danger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
						}`}
						onClick={onConfirm}>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	)
}

// ── Main List Page ────────────────────────────────────────────────────────────

const List = () => {
	const { t } = useTranslation()
	const { id: listId } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { currentUser } = useAuth()

	const [loading, setLoading] = useState<boolean>(true)
	const [list, setList] = useState<GroceryList | null>(null)
	const [items, setItems] = useState<GroceryItem[]>([])
	const [error, setError] = useState<string | null>(null)

	const { fmt } = useCurrency(list?.currency ?? 'USD')

	// UI state
	const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false)
	const [editingItem, setEditingItem] = useState<GroceryItem | null>(null)
	const [showShareModal, setShowShareModal] = useState(false)
	const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
	const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
	const [leavingOrDeletingList, setLeavingOrDeletingList] = useState(false)
	const [copyingList, setCopyingList] = useState(false)
	const [confirmDialog, setConfirmDialog] = useState<ConfirmModalProps | null>(null)

	const isOwner = list ? list.userId === currentUser?.uid : null

	// Add item form state
	const [addName, setAddName] = useState('')
	const [addQty, setAddQty] = useState('1')
	const [addPrice, setAddPrice] = useState('0')
	const [addWeightVal, setAddWeightVal] = useState('')
	const [addWeightUnit, setAddWeightUnit] = useState<WeightUnit>('kg')
	const [addLoading, setAddLoading] = useState(false)

	// List name edit
	const [listName, setListName] = useState('')
	const nameDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
	const nameInputFocused = useRef(false)
	const polling = useRef(false)

	// ── Load data ──────────────────────────────────────────────────────────────
	useEffect(() => {
		if (!listId) return
		let cancelled = false
		setLoading(true)

		Promise.all([getList(listId), getItems(listId)])
			.then(([l, i]) => {
				if (cancelled) return
				if (!l) { setError(t('list.errors.notFound')); return }
				setList(l)
				setListName(l.name)
				setItems(i)
			})
			.catch(() => {
				if (!cancelled) setError(t('list.errors.loadFailed'))
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})

		return () => { cancelled = true }
	}, [listId, t])

	// ── Live polling ──────────────────────────────────────────────────────────
	useEffect(() => {
		if (!listId || loading) return
		const tick = async () => {
			if (polling.current || document.hidden) return
			polling.current = true
			try {
				const [freshList, freshItems] = await Promise.all([
					Api.getList(listId),
					Api.getItems(listId),
				])
				setItems(freshItems)
				setList(freshList)
				if (!nameInputFocused.current) setListName(freshList.name)
			} catch (e) {
				if ((e as { status?: number }).status === 404) {
					setError(t('list.errors.deleted'))
				}
				// other errors are network blips — silently ignore
			} finally {
				polling.current = false
			}
		}
		const id = setInterval(() => { void tick() }, 5000)
		return () => clearInterval(id)
	}, [listId, loading, t])

	// ── Derived state ─────────────────────────────────────────────────────────
	const allChecked = items.length > 0 && items.every((item) => !!item.isChecked)
	const groceriesTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
	const totalToPay = items.reduce(
		(sum, item) => sum + (item.isChecked ? item.quantity * item.price : 0),
		0
	)

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleNameChange = (value: string) => {
		setListName(value)
		if (nameDebounce.current) clearTimeout(nameDebounce.current)
		nameDebounce.current = setTimeout(() => {
			if (listId && value.trim()) {
				void updateList(listId, { name: value.trim() })
			}
		}, 800)
	}

	const handleStatusChange = async (status: 'OPENED' | 'CLOSED') => {
		setIsSelectOpen(false)
		if (!listId || !list) return
		setList({ ...list, status })
		await updateList(listId, { status })
	}

	const handleCurrencyChange = async (currency: string) => {
		setIsCurrencyOpen(false)
		if (!listId || !list) return
		setList({ ...list, currency })
		await updateList(listId, { currency })
	}

	const handleCheckItem = async (item: GroceryItem) => {
		if (!listId || !item.id) return
		const newChecked = !item.isChecked
		setItems((prev) =>
			prev.map((i) => (i.id === item.id ? { ...i, isChecked: newChecked } : i))
		)
		await updateItem(listId, item.id, { isChecked: newChecked })
	}

	const handleCheckAllItems = async () => {
		if (!listId) return
		const newChecked = !allChecked
		const updated = items.map((i) => ({ ...i, isChecked: newChecked }))
		setItems(updated)
		await Promise.all(
			updated.map((i) => i.id ? updateItem(listId, i.id, { isChecked: newChecked }) : Promise.resolve())
		)
	}

	const handleAddItem = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!listId) return
		setAddLoading(true)
		const item: Omit<GroceryItem, 'id'> = {
			name: addName.trim(),
			quantity: parseInt(addQty, 10),
			price: parseFloat(addPrice),
		}
		if (addWeightVal) {
			item.weight = { value: parseFloat(addWeightVal), unit: addWeightUnit }
		}
		await createItem(listId, item)
		// Re-fetch items to get the server-assigned ID
		const fresh = await getItems(listId)
		setItems(fresh)
		setShowAddItemModal(false)
		setAddName(''); setAddQty('1'); setAddPrice('0'); setAddWeightVal('')
		setAddLoading(false)
	}

	const handleEditItem = async (data: Partial<Omit<GroceryItem, 'id'>>) => {
		if (!listId || !editingItem?.id) return
		await updateItem(listId, editingItem.id, data)
		setItems((prev) =>
			prev.map((i) => (i.id === editingItem.id ? { ...i, ...data } : i))
		)
		setEditingItem(null)
	}

	const handleDeleteItem = async (item: GroceryItem) => {
		if (!listId || !item.id) return
		setItems((prev) => prev.filter((i) => i.id !== item.id))
		await deleteItem(listId, item.id)
	}

	const handleCopyList = async () => {
		if (!listId || copyingList) return
		setCopyingList(true)
		const newList = await copyList(listId)
		setCopyingList(false)
		if (newList) navigate(`/lists/${newList.id}`)
	}

	const handleDeleteList = () => {
		setConfirmDialog({
			title: t('list.deleteList.title'),
			message: t('list.deleteList.message'),
			confirmLabel: t('list.deleteList.confirm'),
			danger: true,
			onConfirm: async () => {
				setConfirmDialog(null)
				setLeavingOrDeletingList(true)
				await deleteList(listId!)
				navigate('/lists')
			},
			onClose: () => setConfirmDialog(null),
		})
	}

	const handleLeaveList = () => {
		setConfirmDialog({
			title: t('list.leaveList.title'),
			message: t('list.leaveList.message'),
			confirmLabel: t('list.leaveList.confirm'),
			onConfirm: async () => {
				setConfirmDialog(null)
				setLeavingOrDeletingList(true)
				await leaveList(listId!)
				navigate('/lists')
			},
			onClose: () => setConfirmDialog(null),
		})
	}

	// ── Render ────────────────────────────────────────────────────────────────

	if (error) {
		return (
			<section className='px-4 md:px-12 lg:px-20 py-6 md:py-8'>
				<button
					type='button'
					className='self-start cursor-pointer -ml-2 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors mb-4'
					onClick={() => navigate(-1)}>
					<ChevronLeft size={20} />
				</button>
				<div className='rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600'>
					{error}
				</div>
			</section>
		)
	}

	return (
		<section className='px-4 md:px-12 lg:px-20 py-6 md:py-8 flex flex-col gap-6 md:gap-8'>
			{/* Back button */}
			<button
				type='button'
				className='self-start cursor-pointer -ml-2 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors'
				onClick={() => navigate(-1)}>
				<ChevronLeft size={20} />
			</button>

			{/* Header: title + actions */}
			<div className='flex items-center justify-between gap-4'>
				<input
					type='text'
					className='flex-1 min-w-0 text-2xl md:text-3xl font-semibold text-text-primary py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent'
					value={listName}
					onChange={(e) => handleNameChange(e.target.value)}
					onFocus={() => { nameInputFocused.current = true }}
					onBlur={() => { nameInputFocused.current = false }}
					disabled={loading}
					placeholder={t('list.listNamePlaceholder')}
				/>
				<div className='flex items-center gap-1 shrink-0'>
					{/* Currency dropdown */}
					<div className='relative'>
						<button
							type='button'
							className='inline-flex items-center gap-1 p-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors'
							onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
							onBlur={() => setIsCurrencyOpen(false)}>
							{list?.currency ?? 'USD'} <ChevronDown size={14} />
						</button>
						<div
							className={`absolute top-10 right-0 w-max bg-surface rounded-lg shadow-lg border border-border overflow-hidden ${
								isCurrencyOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
							} transition-all duration-200 z-50`}>
							<ul className='p-2 space-y-1'>
								{CURRENCY_OPTIONS.map((opt) => (
									<li
										key={opt.value}
										className='text-sm text-text-primary hover:bg-green-100 transition-colors duration-200 rounded-md px-3 py-1.5 cursor-pointer'
										onMouseDown={() => handleCurrencyChange(opt.value)}>
										{opt.label}
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Status dropdown */}
					<div className='relative'>
						<button
							type='button'
							className='inline-flex items-center gap-1 p-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors'
							onClick={() => setIsSelectOpen(!isSelectOpen)}
							onBlur={() => setIsSelectOpen(false)}>
							{t(`list.status.${list?.status ?? 'OPENED'}` as const)} <ChevronDown size={14} />
						</button>
						<div
							className={`absolute top-10 right-0 w-max bg-surface rounded-lg shadow-lg border border-border overflow-hidden ${
								isSelectOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
							} transition-all duration-200 z-50`}>
							<ul className='p-2 space-y-1'>
								{(['OPENED', 'CLOSED'] as const).map((type) => (
									<li
										key={type}
										className='text-sm text-text-primary hover:bg-green-100 transition-colors duration-200 rounded-md px-3 py-1.5 cursor-pointer'
										onMouseDown={() => handleStatusChange(type)}>
										{t(`list.status.${type}`)}
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Share */}
					<button
						type='button'
						className='cursor-pointer p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors'
						onClick={() => setShowShareModal(true)}>
						<Share size={18} />
					</button>

					{/* Duplicate */}
					<button
						type='button'
						disabled={copyingList}
						title={t('list.copyList.tooltip')}
						className='cursor-pointer p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors disabled:opacity-50'
						onClick={() => void handleCopyList()}>
						{copyingList ? (
							<Loader2 size={18} className='animate-spin' />
						) : (
							<Copy size={18} />
						)}
					</button>

					{/* Leave (non-owner) or Delete (owner) */}
					{isOwner === true && (
						<button
							type='button'
							disabled={leavingOrDeletingList}
							className='cursor-pointer p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50'
							title={t('list.tooltip.deleteList')}
							onClick={handleDeleteList}>
							{leavingOrDeletingList ? (
								<Loader2 size={18} className='animate-spin' />
							) : (
								<Trash size={18} />
							)}
						</button>
					)}
					{isOwner === false && (
						<button
							type='button'
							disabled={leavingOrDeletingList}
							className='cursor-pointer p-2 rounded-lg text-text-secondary hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50'
							title={t('list.tooltip.leaveList')}
							onClick={handleLeaveList}>
							{leavingOrDeletingList ? (
								<Loader2 size={18} className='animate-spin' />
							) : (
								<LogOut size={18} />
							)}
						</button>
					)}
				</div>
			</div>

			{loading || items.length > 0 ? (
				<>
					{/* ── Mobile card list ──────────────────────────────────── */}
					<div className='md:hidden flex flex-col rounded-xl border border-border overflow-hidden divide-y divide-border-light'>
						{loading
							? Array.from({ length: 5 }).map((_, index) => (
									<div
										key={index}
										className='p-4 flex gap-3 animate-pulse'>
										<div className='h-4 w-4 mt-1 rounded bg-border shrink-0' />
										<div className='flex-1 flex flex-col gap-2'>
											<div className='h-4 w-32 rounded bg-border' />
											<div className='h-3 w-48 rounded bg-border-light' />
											<div className='h-3 w-16 rounded bg-border self-end' />
										</div>
									</div>
								))
							: items.map((item) => (
									<div
										key={item.id}
										className='bg-surface p-4 flex gap-3 hover:bg-bg-secondary transition-colors'>
										<input
											type='checkbox'
											checked={!!item.isChecked}
											onChange={() => handleCheckItem(item)}
											className='mt-0.5 shrink-0 cursor-pointer'
										/>
										<div className='flex-1 min-w-0'>
											<div className='flex items-start justify-between gap-2'>
												<span
													className={`font-medium text-text-primary ${item.isChecked ? 'line-through text-text-tertiary' : ''}`}>
													{item.name}
												</span>
												<div className='flex items-center gap-0.5 shrink-0'>
													<button
														type='button'
														className='cursor-pointer p-1.5 rounded text-text-tertiary hover:text-blue-500 hover:bg-blue-50 transition-colors'
														onClick={() => setEditingItem(item)}>
														<Edit size={15} />
													</button>
													<button
														type='button'
														className='cursor-pointer p-1.5 rounded text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors'
														onClick={() => handleDeleteItem(item)}>
														<Trash size={15} />
													</button>
												</div>
											</div>
											<div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary'>
												<span className={item.isChecked ? 'line-through text-text-tertiary' : ''}>
													{t('list.qty', { qty: item.quantity })}
												</span>
												{item.weight && (
													<span
														className={`inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs ${item.isChecked ? 'opacity-50' : ''}`}>
														{item.weight.value} {t(`list.units.${item.weight.unit as WeightUnit}`)}
													</span>
												)}
												<span className={item.isChecked ? 'line-through text-text-tertiary' : ''}>
													{t('list.priceEach', { price: fmt(item.price) })}
												</span>
											</div>
											<div className='mt-1 text-sm font-semibold text-text-primary text-right'>
												{fmt(item.quantity * item.price)}
											</div>
										</div>
									</div>
								))}

						{!loading && (
							<button
								type='button'
								className='flex items-center gap-2 px-4 py-3 text-sm text-text-tertiary hover:text-green-600 hover:bg-bg-secondary transition-colors cursor-pointer w-full'
								onClick={() => setShowAddItemModal(true)}>
								<Plus size={16} />
								{t('list.addItem')}
							</button>
						)}
					</div>

					{/* Mobile totals */}
					{!loading && (
						<div className='md:hidden flex flex-col gap-2 rounded-xl border border-border bg-bg-secondary p-4'>
							<div className='flex items-center justify-between text-sm'>
								<span className='font-semibold text-text-primary'>{t('list.totals.groceriesTotal')}</span>
								<span className='font-bold text-text-primary'>{fmt(groceriesTotal)}</span>
							</div>
							<div className='flex items-center justify-between text-sm pt-2 border-t border-border'>
								<span className='font-semibold text-text-primary'>{t('list.totals.totalToPay')}</span>
								<span className='font-bold text-green-600'>{fmt(totalToPay)}</span>
							</div>
						</div>
					)}

					{/* ── Desktop table ─────────────────────────────────────── */}
					<div className='hidden md:block overflow-x-auto rounded-xl border border-border'>
						<table className='w-full'>
							<thead>
								<tr className='bg-bg-secondary border-b border-border'>
									<th className='px-4 py-3 text-left'>
										<input
											type='checkbox'
											checked={allChecked}
											onChange={handleCheckAllItems}
										/>
									</th>
									<th className='text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3'>{t('list.table.item')}</th>
									<th className='text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3'>{t('list.table.qty')}</th>
									<th className='text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3'>{t('list.table.weight')}</th>
									<th className='text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3'>{t('list.table.price')}</th>
									<th className='text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3'>{t('list.table.total')}</th>
									<th className='w-20' />
								</tr>
							</thead>
							<tbody>
								{loading
									? Array.from({ length: 5 }).map((_, index) => (
											<tr key={index} className='border-b border-border-light animate-pulse'>
												<td className='px-4 py-3'><div className='h-4 w-4 rounded bg-border' /></td>
												<td className='px-4 py-3'><div className='h-4 w-28 rounded bg-border' /></td>
												<td className='px-4 py-3'><div className='h-4 w-8 rounded bg-border' /></td>
												<td className='px-4 py-3'><div className='h-5 w-16 rounded-full bg-border-light' /></td>
												<td className='px-4 py-3'><div className='h-4 w-14 rounded bg-border ml-auto' /></td>
												<td className='px-4 py-3'><div className='h-4 w-14 rounded bg-border ml-auto' /></td>
												<td className='px-4 py-3'><div className='h-4 w-16 rounded bg-border-light ml-auto' /></td>
											</tr>
										))
									: items.map((item) => (
											<tr
												key={item.id}
												className='border-b border-border-light hover:bg-bg-secondary transition-colors duration-150'>
												<td className='px-4 py-3'>
													<input
														type='checkbox'
														checked={!!item.isChecked}
														onChange={() => handleCheckItem(item)}
													/>
												</td>
												<td className={`px-4 py-3 font-medium text-text-primary ${item.isChecked ? 'line-through text-text-secondary' : ''}`}>
													{item.name}
												</td>
												<td className={`px-4 py-3 text-text-secondary ${item.isChecked ? 'line-through text-text-tertiary' : ''}`}>
													{item.quantity}
												</td>
												<td className='px-4 py-3 text-text-secondary'>
													{item.weight ? (
														<span className={`inline-flex items-center gap-1 text-sm bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full ${item.isChecked ? 'opacity-50' : ''}`}>
															{item.weight.value} {t(`list.units.${item.weight.unit as WeightUnit}`)}
														</span>
													) : (
														<span className='text-text-tertiary'>&mdash;</span>
													)}
												</td>
												<td className='px-4 py-3 text-right text-text-secondary'>
													{fmt(item.price)}
												</td>
												<td className='px-4 py-3 text-right font-medium text-text-primary'>
													{fmt(item.quantity * item.price)}
												</td>
												<td className='px-4 py-3'>
													<div className='flex items-center justify-end gap-2'>
														<button
															type='button'
															className='cursor-pointer p-1 rounded text-text-tertiary hover:text-blue-500 hover:bg-blue-50 transition-colors'
															onClick={() => setEditingItem(item)}>
															<Edit size={16} />
														</button>
														<button
															type='button'
															className='cursor-pointer p-1 rounded text-text-tertiary hover:text-red-500 hover:bg-red-50 transition-colors'
															onClick={() => handleDeleteItem(item)}>
															<Trash size={16} />
														</button>
													</div>
												</td>
											</tr>
										))}

								{!loading && (
									<tr
										className='group hover:bg-bg-secondary transition-colors duration-150 cursor-pointer'
										onClick={() => setShowAddItemModal(true)}>
										<td colSpan={7} className='px-4 py-3'>
											<button
												type='button'
												className='flex items-center gap-2 text-sm text-text-tertiary group-hover:text-green-600 transition-colors'>
												<Plus size={16} />
												{t('list.addItem')}
											</button>
										</td>
									</tr>
								)}
							</tbody>
							{!loading && (
								<tfoot>
									<tr className='border-t-2 border-border bg-bg-secondary'>
										<td colSpan={5} className='px-4 py-3 text-right font-semibold text-text-primary'>
											{t('list.totals.groceriesTotal')}
										</td>
										<td className='px-4 py-3 text-right font-bold text-text-primary'>
											{fmt(groceriesTotal)}
										</td>
										<td />
									</tr>
									<tr className='border-t border-border bg-bg-secondary'>
										<td colSpan={5} className='px-4 py-3 text-right font-semibold text-text-primary'>
											{t('list.totals.totalToPay')}
										</td>
										<td className='px-4 py-3 text-right font-bold text-green-600'>
											{fmt(totalToPay)}
										</td>
										<td />
									</tr>
								</tfoot>
							)}
						</table>
					</div>
				</>
			) : (
				<div className='text-center py-16 flex flex-col sm:flex-row items-center justify-center gap-2'>
					<p className='text-text-secondary'>No items in this list yet.</p>
					<button
						type='button'
						className='cursor-pointer flex items-center gap-2 text-green-500 hover:border-b border-green-500 transition-all duration-200'
						onClick={() => setShowAddItemModal(true)}>
						{t('list.addItem')}
					</button>
				</div>
			)}

			{/* ── Add Item Modal ─────────────────────────────────────────────── */}
			{showAddItemModal && (
				<div
					className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm'
					onClick={() => setShowAddItemModal(false)}>
					<div
						className='bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md p-6'
						onClick={(e) => e.stopPropagation()}>
						<div className='flex items-center justify-between mb-6'>
							<h2 className='text-xl font-semibold text-text-primary'>{t('list.addItemModal.title')}</h2>
							<button
								type='button'
								className='cursor-pointer rounded-lg p-1 text-text-tertiary hover:bg-bg-tertiary hover:text-text-secondary transition-colors'
								onClick={() => setShowAddItemModal(false)}>
								<X size={20} />
							</button>
						</div>

						<form className='flex flex-col gap-4' onSubmit={handleAddItem}>
							<div className='flex flex-col gap-1'>
								<label className='text-sm font-medium text-text-primary'>{t('list.addItemModal.name')}</label>
								<input
									type='text'
									autoFocus
									value={addName}
									onChange={(e) => setAddName(e.target.value)}
									required
									className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent text-text-primary placeholder:text-text-tertiary'
								/>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='flex flex-col gap-1'>
									<label className='text-sm font-medium text-text-primary'>{t('list.addItemModal.quantity')}</label>
									<input
										type='number'
										min={1}
										value={addQty}
										onChange={(e) => setAddQty(e.target.value)}
										required
										className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent text-text-primary'
									/>
								</div>
								<div className='flex flex-col gap-1'>
									<label className='text-sm font-medium text-text-primary'>{t('list.addItemModal.price')}</label>
									<input
										type='number'
										step='0.01'
										min={0}
										value={addPrice}
										onChange={(e) => setAddPrice(e.target.value)}
										required
										className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent text-text-primary'
									/>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='flex flex-col gap-1'>
									<label className='text-sm font-medium text-text-primary'>
										{t('list.addItemModal.weight')}{' '}
										<span className='text-text-tertiary font-normal'>{t('list.addItemModal.weightOptional')}</span>
									</label>
									<input
										type='number'
										step='0.1'
										min={0}
										value={addWeightVal}
										onChange={(e) => setAddWeightVal(e.target.value)}
										className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-transparent text-text-primary placeholder:text-text-tertiary'
									/>
								</div>
								<div className='flex flex-col gap-1'>
									<label className='text-sm font-medium text-text-primary'>{t('list.addItemModal.unit')}</label>
									<select
										value={addWeightUnit}
										onChange={(e) => setAddWeightUnit(e.target.value as WeightUnit)}
										className='w-full py-2 border-b-2 border-border outline-none focus:border-green-500 transition-colors duration-200 bg-surface text-text-primary'>
										<option value='kg'>{t('list.units.kg')}</option>
										<option value='lbs'>{t('list.units.lbs')}</option>
										<option value='oz'>{t('list.units.oz')}</option>
									</select>
								</div>
							</div>
							<div className='flex justify-end gap-3 mt-2'>
								<button
									type='button'
									className='cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-tertiary transition-colors'
									onClick={() => setShowAddItemModal(false)}>
									{t('list.addItemModal.cancel')}
								</button>
								<button
									type='submit'
									disabled={addLoading}
									className='cursor-pointer flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white transition-colors'>
									{addLoading ? <Loader2 size={14} className='animate-spin' /> : null}
									{t('list.addItemModal.add')}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ── Edit Item Modal ────────────────────────────────────────────── */}
			{editingItem && (
				<EditItemModal
					item={editingItem}
					onClose={() => setEditingItem(null)}
					onSave={handleEditItem}
				/>
			)}

			{/* ── Share Modal ────────────────────────────────────────────────── */}
			{showShareModal && (
				<ShareModal
					listId={listId ?? ''}
					onClose={() => setShowShareModal(false)}
				/>
			)}

			{/* ── Confirm Modal ───────────────────────────────────────────────── */}
			{confirmDialog && <ConfirmModal {...confirmDialog} />}
		</section>
	)
}

export default List
