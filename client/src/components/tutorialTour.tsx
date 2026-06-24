import { Joyride, type EventData, type Step, STATUS } from 'react-joyride'
import { useTheme } from '@/contexts/theme'
import { useTranslation } from 'react-i18next'

interface TutorialTourProps {
	run: boolean
	onFinish: () => void
}

const TutorialTour = ({ run, onFinish }: TutorialTourProps) => {
	const { theme } = useTheme()
	const { t } = useTranslation()
	const isDark = theme === 'dark'

	const steps: Step[] = [
		{
			target: 'body',
			placement: 'center',
			content: (
				<div style={{ textAlign: 'center', padding: '8px 4px' }}>
					<div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
					<h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>
						{t('tutorial.welcome.title')}
					</h2>
					<p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>
						{t('tutorial.welcome.body')}
					</p>
				</div>
			),
		},
		{
			target: '[data-tour="new-list-btn"]',
			placement: 'bottom',
			content: (
				<div>
					<h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>
						{t('tutorial.newList.title')}
					</h3>
					<p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.85 }}>
						{t('tutorial.newList.body')}
					</p>
				</div>
			),
		},
		{
			target: '[data-tour="scan-qr-btn"]',
			placement: 'bottom',
			content: (
				<div>
					<h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>
						{t('tutorial.scanQr.title')}
					</h3>
					<p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.85 }}>
						{t('tutorial.scanQr.body')}
					</p>
				</div>
			),
		},
		{
			target: '[data-tour="navbar-logo"]',
			placement: 'bottom',
			content: (
				<div>
					<h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>
						{t('tutorial.navbar.title')}
					</h3>
					<p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.85 }}>
						{t('tutorial.navbar.body')}
					</p>
				</div>
			),
		},
		{
			target: '[data-tour="navbar-settings"]',
			placement: 'bottom',
			content: (
				<div>
					<h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>
						{t('tutorial.settings.title')}
					</h3>
					<p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.85 }}>
						{t('tutorial.settings.body')}
					</p>
				</div>
			),
		},
		{
			target: '[data-tour="navbar-profile"]',
			placement: 'bottom',
			content: (
				<div>
					<h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>
						{t('tutorial.profile.title')}
					</h3>
					<p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.85 }}>
						{t('tutorial.profile.body')}
					</p>
				</div>
			),
		},
		{
			target: 'body',
			placement: 'center',
			content: (
				<div style={{ textAlign: 'center', padding: '8px 4px' }}>
					<div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
					<h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>
						{t('tutorial.done.title')}
					</h2>
					<p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>
						{t('tutorial.done.body')}
					</p>
				</div>
			),
		},
	]

	const handleEvent = (data: EventData) => {
		const { status } = data
		if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
			onFinish()
		}
	}

	// Brand orange
	const primaryColor = '#f97316'
	const bgColor = isDark ? '#1a1a1a' : '#ffffff'
	const textColor = isDark ? '#f3f4f6' : '#111827'
	const borderColor = isDark ? '#374151' : '#e5e7eb'

	return (
		<Joyride
			run={run}
			steps={steps}
			continuous
			scrollToFirstStep
			onEvent={handleEvent}
			locale={{
				back: t('tutorial.controls.back'),
				close: t('tutorial.controls.close'),
				last: t('tutorial.controls.last'),
				next: t('tutorial.controls.next'),
				skip: t('tutorial.controls.skip'),
				open: t('tutorial.controls.open'),
			}}
			options={{
				primaryColor,
				backgroundColor: bgColor,
				textColor,
				overlayColor: 'rgba(0,0,0,0.55)',
				zIndex: 10000,
				spotlightRadius: 10,
				showProgress: true,
				buttons: ['back', 'close', 'primary', 'skip'],
			}}
			styles={{
				tooltip: {
					borderRadius: 14,
					boxShadow: isDark
						? '0 8px 32px rgba(0,0,0,0.5)'
						: '0 8px 32px rgba(0,0,0,0.12)',
					border: `1px solid ${borderColor}`,
					padding: '20px 24px',
				},
				tooltipTitle: {
					display: 'none',
				},
				tooltipContent: {
					padding: 0,
				},
				tooltipFooter: {
					marginTop: 16,
				},
				buttonPrimary: {
					backgroundColor: primaryColor,
					borderRadius: 8,
					fontSize: 13,
					fontWeight: 600,
					padding: '8px 18px',
					color: '#fff',
				},
				buttonBack: {
					color: primaryColor,
					fontSize: 13,
					fontWeight: 500,
					marginRight: 8,
				},
				buttonSkip: {
					color: isDark ? '#9ca3af' : '#6b7280',
					fontSize: 13,
				},
				buttonClose: {
					color: isDark ? '#9ca3af' : '#6b7280',
					padding: 8,
				},
			}}
		/>
	)
}

export default TutorialTour
