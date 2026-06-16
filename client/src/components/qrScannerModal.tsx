import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

type Props = {
	onDetected: (url: string) => void
	onClose: () => void
}

const QrScannerModal = ({ onDetected, onClose }: Props) => {
	const videoRef = useRef<HTMLVideoElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let stream: MediaStream | null = null
		let rafId: number | null = null
		let stopped = false

		const start = async () => {
			const { default: jsQR } = await import('jsqr')

			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: 'environment' },
				})
			} catch {
				if (!stopped) setError('Camera access denied. Please allow camera access and try again.')
				return
			}

			if (stopped) { stream.getTracks().forEach((t) => t.stop()); return }

			const video = videoRef.current
			if (!video) return
			video.srcObject = stream
			await video.play()

			const tick = () => {
				if (stopped) return
				const v = videoRef.current
				const canvas = canvasRef.current
				if (!v || !canvas) return

				if (v.readyState !== v.HAVE_ENOUGH_DATA) {
					rafId = requestAnimationFrame(tick)
					return
				}

				canvas.width = v.videoWidth
				canvas.height = v.videoHeight
				const ctx = canvas.getContext('2d')
				if (!ctx) return
				ctx.drawImage(v, 0, 0)

				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
				const code = jsQR(imageData.data, imageData.width, imageData.height)
				if (code?.data) {
					onDetected(code.data)
					return
				}

				rafId = requestAnimationFrame(tick)
			}

			rafId = requestAnimationFrame(tick)
		}

		void start()

		return () => {
			stopped = true
			if (rafId !== null) cancelAnimationFrame(rafId)
			stream?.getTracks().forEach((t) => t.stop())
		}
	}, [onDetected])

	return (
		<div
			className='fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm'
			onClick={onClose}>
			<div
				className='bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-6'
				onClick={(e) => e.stopPropagation()}>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-lg font-semibold text-text-primary'>Scan Invite QR Code</h2>
					<button
						type='button'
						className='cursor-pointer rounded-lg p-1 text-text-tertiary hover:bg-bg-tertiary hover:text-text-secondary transition-colors'
						onClick={onClose}>
						<X size={20} />
					</button>
				</div>

				{error ? (
					<p className='text-sm text-red-500 bg-red-50 rounded-lg px-3 py-3'>{error}</p>
				) : (
					<>
						<div className='relative rounded-xl overflow-hidden bg-black aspect-square'>
							<video
								ref={videoRef}
								className='w-full h-full object-cover'
								playsInline
								muted
							/>
							{/* Corner-marker overlay */}
							<div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
								<div className='relative w-52 h-52'>
									<span className='absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-lg' />
									<span className='absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-lg' />
									<span className='absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-lg' />
									<span className='absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-lg' />
								</div>
							</div>
						</div>
						<p className='mt-3 text-xs text-text-secondary text-center'>
							Point your camera at an iGrocery invite QR code
						</p>
					</>
				)}

				<canvas ref={canvasRef} className='hidden' />
			</div>
		</div>
	)
}

export default QrScannerModal
