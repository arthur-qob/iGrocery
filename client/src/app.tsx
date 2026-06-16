import { useTheme } from './contexts/theme'
import AppRoutes from './utils/routes'

const App = () => {
	const { theme } = useTheme()
	return (
		<main data-theme={theme}>
			<AppRoutes />
		</main>
	)
}

export default App
