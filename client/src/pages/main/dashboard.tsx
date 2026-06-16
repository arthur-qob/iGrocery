import Lists from '@/pages/lists/lists'
import Navbar from '@/components/navbar'

const Dashboard = () => {
	return (
		<div className='min-h-screen bg-bg-secondary'>
			<Navbar />

			<main className='pt-16'>
				<Lists />
			</main>
		</div>
	)
}

export default Dashboard
