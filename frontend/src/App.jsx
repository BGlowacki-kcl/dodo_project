import './App.css';
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
import Swiping from './pages/applicant/Swiping.jsx';
import CreateJobPost from './pages/employer/CreateJobPost.jsx';
import EditJobPost from './pages/employer/EditJobPost.jsx';
import UserJobsPage from './pages/user/UserJobsPage.jsx';
import UserApplicationsPage from './pages/user/UserApplicationsPage.jsx';
import SingleApplicationPage from './pages/user/SingleApplicationPage.jsx';
import AddDetails from './pages/AddDetails.jsx';
import AddPdf from './pages/addPdf.jsx';
import Forbidden from './pages/Forbidden';

function App() {

	const routeConfig = [
		{ path: '/SignIn', element: <SignInUp mode="SignIn" />, isPublic: true },
		{ path: '/SignUp', element: <SignInUp mode="SignUp" />, isPublic: true },
		{ path: '/', element: <LandingPage />, isPublic: true },
		{ path: '/dashboard', element: <Dashboard />, roles: ['jobSeeker'] },
		{ path: '/applicant-dashboard', element: <ApplicantDashboard />, roles: ['applicant'] },
		{ path: '/employer-dashboard', element: <EmployerDashboard />, roles: ['employer'] },
		{ path: '/posts', element: <EmployerPosts />, roles: ['employer'] },
		{ path: '/user/jobs', element: <UserJobsPage />, roles: ['applicant'] },
		{ path: '/user/applications', element: <UserApplicationsPage />, roles: ['applicant'] },
		{ path: '/user/applications/:appId', element: <SingleApplicationPage />, roles: ['applicant'] },
		{ path: '/addDetails', element: <AddDetails />, roles: ['applicant', 'employer'] },
		{ path: '/addPdf', element: <AddPdf />, roles: ['applicant'] },
		{ path: '/posts/new', element: <CreateJobPost />, roles: ['employer'] },
		{ path: '/posts/edit/:id', element: <EditJobPost />, roles: ['employer'] },
		{ path: '/swipe', element: <Swiping />, roles: ['applicant'] },
		{ path: '/forbidden', element: <Forbidden />, isPublic: true }
	  ];

  return (
    <Box className="bg-gray-100 min-h-screen">
			<Navbar />
			<Routes>
			{routeConfig.map((route) => (
				<Route
				key={route.path}
				path={route.path}
				element={
					route.isPublic ? (
					route.element
					) : (
					<AuthGuard roles={route.roles} element={route.element} />
					)
				}
				/>
			))}
			</Routes>
		</Box>
  );
}

export default App;
