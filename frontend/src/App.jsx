import './App.css'
import Box from '@mui/material/Box';
import SignInUp from './pages/SignInUp';

import Navbar from './components/Navbar';

import LandingPage from './pages/LandingPage';
import ApplicantDashboard from "./pages/dashboards/ApplicantDashboard.jsx";
import EmployerDashboard from "./pages/dashboards/EmployerDashboard.jsx";
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AuthGuard from './guards/auth.guard';
import EmployeePosts from './pages/EmployerPostsPage';

function App() {

  return (
    <Box className="bg-gray-100 min-h-screen">
		<Navbar />
		<Routes>
			<Route path='/SignIn' element={<SignInUp mode="SignIn" />} />
			<Route path='/SignUp' element={<SignInUp mode="SignUp" />} />
			<Route path="/dashboard" element={<AuthGuard> <Dashboard /> </AuthGuard>} /> {/* TODO: Fix the problem about back arrow  */}
			<Route path="/" element={<AuthGuard><LandingPage /></AuthGuard>} />
			<Route path="/applicantdashboard" element={<ApplicantDashboard />} />
			<Route path="/employerdashboard" element={<EmployerDashboard />} />
			<Route path="/Posts" element={<EmployeePosts />} />
		</Routes>
	</Box>
  )
}

export default App
