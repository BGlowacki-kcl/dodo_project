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
import EmployerSignIn from "./pages/employer/EmployerSignIn.jsx";
import AddDetails from './pages/AddDetails.jsx';
import Forbidden from './pages/Forbidden';
import CodeAss from './pages/applicant/CodeAss';
import EmployerLogin from './pages/employer/EmployerLogin.jsx';
import SearchResults from './pages/SearchResults'
import AddPdf from './pages/addPdf.jsx';
import EmployerApplicants from './pages/employer/EmployerApplicants';
import ApplicantDetails from './pages/employer/ApplicantDetails';

function App() {
	const routeConfig = [
		// For unLogged users (landing and authorization pages)
		{ path: '/signin', element: <SignInUp/>, roles: ['unLogged'] },
		{ path: '/signup', element: <SignInUp/>, roles: ['unLogged'] },
		{ path: '/employer-login', element: <EmployerLogin />, roles: ['unLogged'] },
		
		// Pages for any user
		{ path: '/', element: <LandingPage />, roles: ['unLogged', 'employer', 'jobSeeker'] },
		{ path: '/search-results', element: <SearchResults />, roles: ['jobSeeker', 'employer', 'unLogged'] },
		
		// Completing profile page, for logged users
		{ path: '/addDetails', element: <AddDetails />, roles: ['jobSeeker', 'employer'] },
		
		// jobSeeker accessible pages
		{ path: '/swipe', element: <Swiping />, roles: ['jobSeeker'] },
		{ path: '/user/jobs', element: <UserJobsPage />, roles: ['jobSeeker'] },
		{ path: '/codeassessment/:appId', element: <CodeAss />, roles: ['jobSeeker'] },
		{ path: '/user/applications', element: <UserApplicationsPage />, roles: ['jobSeeker'] },
		{ path: '/applicant-dashboard', element: <ApplicantDashboard />, roles: ['jobSeeker'] },
		{ path: '/applicant/:applicantId', element: <ApplicantDetails />, roles: ['jobSeeker'] },
		{ path: '/user/applications/:appId', element: <SingleApplicationPage />, roles: ['jobSeeker'] },
		
		// Employer accessible pages
		{ path: '/posts', element: <EmployerPosts />, roles: ['employer'] },
		{ path: '/posts/new', element: <CreateJobPost />, roles: ['employer'] },
		{ path: '/applicants', element: <EmployerApplicants />, roles: ['employer'] },
		{ path: '/employer/posts', element: <EmployerPosts />, roles: ['employer'] },
		{ path: '/posts/edit/:id', element: <EditJobPost />, roles: ['employer'] },

		{ path: '/forbidden', element: <Forbidden />, dontCheck: true }
	  ];

	return (
		<Box className="bg-background min-h-screen">
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
								<AuthGuard roles={route.roles}>{route.element}</AuthGuard>
							)
						}
					/>
				))}
			</Routes>
		</Box>
	);
}

export default App;
