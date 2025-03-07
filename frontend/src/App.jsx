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
import Forbidden from './pages/Forbidden';
import CodeAss from './pages/applicant/CodeAss';

function App() {

	const routeConfig = [
		{ path: '/signin', element: <SignInUp/>, roles: ['unLogged'] },
		{ path: '/signup', element: <SignInUp/>, roles: ['unLogged'] },
		{ path: '/', element: <LandingPage />, roles: ['unLogged'] },
		{ path: '/dashboard', element: <Dashboard />, roles: ['jobSeeker', 'employer'] },
		{ path: '/applicant-dashboard', element: <ApplicantDashboard />, roles: ['jobSeeker'] },
		{ path: '/employer-dashboard', element: <EmployerDashboard />, roles: ['employer'] },
		{ path: '/posts', element: <EmployerPosts />, roles: ['employer'] },
		{ path: '/user/jobs', element: <UserJobsPage />, roles: ['jobSeeker'] },
		{ path: '/user/applications', element: <UserApplicationsPage />, roles: ['jobSeeker'] },
		{ path: '/user/applications/:appId', element: <SingleApplicationPage />, roles: ['jobSeeker'] },
		{ path: '/addDetails', element: <AddDetails />, roles: ['jobSeeker', 'employer'] },
		{ path: '/posts/new', element: <CreateJobPost />, roles: ['employer'] },
		{ path: '/posts/edit/:id', element: <EditJobPost />, roles: ['employer'] },
		{ path: '/swipe', element: <Swiping />, roles: ['jobSeeker'] },
		{ path: '/codeassessment/:appId', element: <CodeAss />, roles: ['jobSeeker'] },
		{ path: '/forbidden', element: <Forbidden />, dontCheck: true }
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
					route.dontCheck ? (
						route.element
					) : (
						<AuthGuard roles={route.roles} >{route.element}</AuthGuard>
					)
				}
				/>
			))}
			</Routes>
		</Box>
  );
}

export default App;
