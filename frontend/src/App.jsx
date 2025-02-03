import './App.css'
import Box from '@mui/material/Box';
import SignInUp from './pages/SignInUp';

import Navbar from './components/Navbar';

import LandingPage from './pages/applicant/Landing.jsx';
import ApplicantDashboard from "./pages/applicant/ApplicantDashboard.jsx";
import EmployerDashboard from "./pages/employer/EmployerDashboard.jsx";
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AuthGuard from './guards/auth.guard';
import EmployerPosts from './pages/employer/EmployerPosts.jsx';

import UserJobsPage from './pages/user/UserJobsPage.jsx';
import UserApplicationsPage from './pages/user/UserApplicationsPage.jsx';
import SingleApplicationPage from './pages/user/SingleApplicationPage.jsx';

function App() {

  return (
    <Box className="bg-gray-100 min-h-screen">
			<Navbar />
			<Routes>
				<Route path='/SignIn' element={<SignInUp mode="SignIn" />} />
				<Route path='/SignUp' element={<SignInUp mode="SignUp" />} />
				<Route path="/dashboard" element={<AuthGuard> <Dashboard /> </AuthGuard>} /> {/* TODO: Fix the problem about back arrow  */}
				<Route path="/" element={<LandingPage />} />
				<Route path="applicant-dashboard/" element={<ApplicantDashboard />} /> 
				<Route path="/employer-dashboard" element={<EmployerDashboard />} />
				<Route path="/posts" element={<EmployerPosts />} />
				<Route path="/user/jobs" element={<UserJobsPage />} />
				<Route path="/user/applications" element={<UserApplicationsPage />} />
				<Route path="/user/applications/:appId" element={<SingleApplicationPage />} />
			</Routes>
		</Box>
  )
}

export default App
