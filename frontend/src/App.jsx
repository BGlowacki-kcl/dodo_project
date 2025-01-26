import './App.css'
import Box from '@mui/material/Box';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import { Routes, Route } from 'react-router-dom';

function App() {

  return (
    <Box className="bg-gray-100 min-h-screen">
			<Navbar />
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/home" element={<HomePage />} />
			</Routes>
		</Box>
  )
}

export default App
