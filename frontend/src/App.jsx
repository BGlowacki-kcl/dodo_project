import './App.css'
import Box from '@mui/material/Box';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';

import LandingPage from './pages/LandingPage';
import ApplicantDashboard from "./dashboards/ApplicantDashboard.jsx";
import EmployerDashboard from "./dashboards/EmployerDashboard.jsx";
import { Routes, Route } from 'react-router-dom';
import EmployeePosts from './pages/EmployerPostsPage';

function App() {

  return (
    <Box className="bg-gray-100 min-h-screen">
			<Navbar />
			<Routes>

				<Route path="/" element={<LandingPage />} />
				<Route path="/applicantdashboard" element={<ApplicantDashboard />} />
				<Route path="/employerdashboard" element={<EmployerDashboard />} />
				<Route path="/home" element={<HomePage />} />
				<Route path="/Posts" element={<EmployeePosts />} />

			</Routes>
		</Box>
  )
}

export default App
