const SettingsRow = ({
	label,
	description,
	disabled = false,
	alert,
	children
}: {
	label: string
	description?: string
	disabled?: boolean
	alert?: string
	children: React.ReactNode
}) => (
	<div className={`flex items-center justify-between gap-4 px-6 py-4 ${disabled ? 'opacity-50' : ''}`}>
		<div className='min-w-0'>
			<p className='text-sm font-medium text-text-primary'>{label}</p>
			{description && (
				<p className='text-xs text-text-secondary mt-0.5'>
					{description}
				</p>
			)}
			{alert && <p className='text-xs text-red-500 mt-0.5'>{alert}</p>}
		</div>
		<div className={`shrink-0 ${disabled ? 'pointer-events-none' : ''}`}>{children}</div>
	</div>
)

export default SettingsRow
