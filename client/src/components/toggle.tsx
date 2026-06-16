const Toggle = ({
	checked,
	onChange
}: {
	checked: boolean
	onChange: (v: boolean) => void
}) => (
	<button
		type='button'
		role='switch'
		aria-checked={checked}
		onClick={() => onChange(!checked)}
		className={`relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
			checked ? 'bg-orange-500' : 'bg-border'
		}`}>
		<span
			className={`absolute top-1 w-4 h-4 bg-surface border border-border rounded-full shadow-sm transition-all duration-200 ${
				checked ? 'left-5 border-orange-200' : 'left-1'
			}`}
		/>
	</button>
)

export default Toggle
