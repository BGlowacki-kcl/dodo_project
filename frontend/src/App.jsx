import './App.css'
import Box from '@mui/material/Box';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ApplicantDashboard from "./Dashboards/ApplicantDashboard.jsx";
import EmployerDashboard from "./Dashboards/EmployerDashboard.jsx";
import { Routes, Route } from 'react-router-dom';

function App() {

  return (
    <Box className="bg-gray-100 min-h-screen">
			<Navbar />
			<Routes>
				<Route path='/' element={<EmployerDashboard />} />
			</Routes>
		</Box>
  )
}

export default App
