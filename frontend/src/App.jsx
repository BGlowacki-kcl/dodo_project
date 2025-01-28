import './App.css'
import Box from '@mui/material/Box';
import SignInUp from './pages/SignInUp';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AuthGuard from './guards/auth.guard';

function App() {

  return (
    <Box className="bg-gray-100 min-h-screen">
			<Navbar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/SignIn' element={<SignInUp mode="SignIn" />} />
				<Route path='/SignUp' element={<SignInUp mode="SignUp" />} />
				<Route path="/dashboard" element={<AuthGuard> <Dashboard /> </AuthGuard>} /> {/* TODO: Fix the problem about back arrow  */}
			</Routes>
		</Box>
  )
}

export default App
