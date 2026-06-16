import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/theme'

const options = [
	{ value: 'light' as const, icon: Sun, label: 'Light' },
	{ value: 'dark' as const, icon: Moon, label: 'Dark' },
	{ value: 'system' as const, icon: Monitor, label: 'System' }
]

const ThemeToggler = () => {
	const { theme, resolvedTheme, setTheme } = useTheme()
	const activeIndex = options.findIndex((o) => o.value === theme)

	return (
		<div className='relative grid grid-cols-3 bg-bg-tertiary rounded-full p-1'>
			{/* Sliding pill */}
			<div
				className='absolute top-1 bottom-1 rounded-full bg-surface shadow-sm transition-all duration-200 ease-in-out'
				style={{
					left: `calc(4px + ${activeIndex} * (100% - 8px) / 3)`,
					width: 'calc((100% - 8px) / 3)'
				}}
			/>
			{options.map(({ value, icon: Icon, label }) => (
				<button
					key={value}
					type='button'
					onClick={() => setTheme(value)}
					className={`relative z-10 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm font-medium rounded-full cursor-pointer select-none transition-colors duration-200 ${
						theme === value
							? 'text-text-primary'
							: 'text-text-tertiary hover:text-text-secondary'
					}`}>
					{value === 'system' && theme === 'system' ? (
						resolvedTheme === 'dark' ? (
							<Moon size={14} />
						) : (
							<Sun size={14} />
						)
					) : (
						<Icon size={14} />
					)}
					<span className='hidden sm:inline'>{label}</span>
				</button>
			))}
		</div>
	)
}

export default ThemeToggler
