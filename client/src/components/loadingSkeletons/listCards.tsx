const ListCardsSkeleton = ({ index }: { index: number }) => {
	return (
		<div
			key={index}
			className='rounded-xl border border-border-light bg-surface p-5 shadow-sm animate-pulse'>
			<div className='h-2 w-20 rounded-full bg-green-200 mb-4' />
			<div className='h-5 w-3/4 rounded bg-border mb-3' />
			<div className='space-y-2.5'>
				<div className='h-3.5 w-1/2 rounded bg-border-light' />
				<div className='h-3.5 w-2/3 rounded bg-border-light' />
				<div className='h-3.5 w-1/3 rounded bg-border-light' />
			</div>
		</div>
	)
}

export default ListCardsSkeleton
