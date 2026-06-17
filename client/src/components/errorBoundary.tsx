import { Component } from 'react'
import type { ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null }

	static getDerivedStateFromError(error: Error): State {
		return { error }
	}

	render() {
		if (this.state.error) {
			return (
				<div className='min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-bg-secondary'>
					<div className='rounded-full bg-red-50 p-5'>
						<svg
							className='w-10 h-10 text-red-500'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
							strokeWidth={1.5}>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
							/>
						</svg>
					</div>
					<h1 className='text-xl font-semibold text-text-primary'>Something went wrong</h1>
					<p className='text-sm text-text-secondary max-w-sm'>
						{this.state.error.message || 'An unexpected error occurred.'}
					</p>
					<button
						type='button'
						className='mt-2 px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors'
						onClick={() => window.location.reload()}>
						Reload page
					</button>
				</div>
			)
		}
		return this.props.children
	}
}

export default ErrorBoundary
