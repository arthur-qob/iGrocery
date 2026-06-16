import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

type Option<T extends string> = {
	value: T
	label: string
}

type Props<T extends string> = {
	value: T
	options: Option<T>[]
	onChange: (value: T) => void
	className?: string
}

const CustomSelect = <T extends string>({
	value,
	options,
	onChange,
	className = ''
}: Props<T>) => {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	const selected = options.find((o) => o.value === value)

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		if (open) document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [open])

	// Close on Escape
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false)
		}
		if (open) document.addEventListener('keydown', handler)
		return () => document.removeEventListener('keydown', handler)
	}, [open])

	return (
		<div
			ref={ref}
			className={`relative ${className}`}>
			{/* Trigger */}
			<button
				type='button'
				onClick={() => setOpen((prev) => !prev)}
				className='flex items-center justify-between gap-3 min-w-36 px-3 py-1.5 text-sm font-medium text-text-primary bg-bg-tertiary border border-border rounded-lg cursor-pointer hover:bg-bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500'>
				<span>{selected?.label ?? '—'}</span>
				<ChevronDown
					size={14}
					className={`text-text-tertiary shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{/* Dropdown */}
			{open && (
				<div className='absolute right-0 z-50 mt-1 min-w-full w-max bg-surface border border-border rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto animate-fade-in'>
					{options.map((option) => (
						<button
							key={option.value}
							type='button'
							onClick={() => {
								onChange(option.value)
								setOpen(false)
							}}
							className={`w-full flex items-center justify-between gap-4 px-4 py-2 text-sm cursor-pointer transition-colors ${
								option.value === value
									? 'text-orange-500 bg-orange-500/5 font-medium'
									: 'text-text-primary hover:bg-bg-tertiary'
							}`}>
							{option.label}
							{option.value === value && (
								<Check size={13} className='text-orange-500 shrink-0' />
							)}
						</button>
					))}
				</div>
			)}
		</div>
	)
}

export default CustomSelect
