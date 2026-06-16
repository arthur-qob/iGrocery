const SettingsSection = ({
	icon,
	title,
	children
}: {
	icon: React.ReactNode
	title: string
	children: React.ReactNode
}) => (
	<div className='bg-surface border border-border-light rounded-2xl'>
		<div className='flex items-center gap-3 px-6 py-4 border-b border-border-light'>
			<span className='text-text-secondary'>{icon}</span>
			<h2 className='text-base font-semibold text-text-primary'>
				{title}
			</h2>
		</div>
		<div className='divide-y divide-border-light'>{children}</div>
	</div>
)

export default SettingsSection
