/**
 * Main Application Component
 * Handles routing and application structure
 */
import Box from '@mui/material/Box';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from './context/notification.context';
import { useEffect } from 'react';

// Importing components
import Navbar from './components/Navbar';
import AuthGuard from './guards/auth.guard';

// Importing pages
import SignInUp from './pages/SignInUp';
import LandingPage from './pages/applicant/Landing.jsx';
import ApplicantDashboard from "./pages/applicant/ApplicantDashboard.jsx";
import EmployerDashboard from "./pages/employer/EmployerDashboard.jsx";
import EmployerPosts from './pages/employer/EmployerPosts.jsx';
import Swiping from './pages/applicant/Swiping.jsx';
import CreateJobPost from './pages/employer/CreateJobPost.jsx';
import SingleApplicationPage from './pages/user/SingleApplicationPage.jsx';
import AddDetails from './pages/AddDetails.jsx';
import Forbidden from './pages/Forbidden';
import CodeAss from './pages/applicant/CodeAssessment';
import EmployerLogin from './pages/employer/EmployerLogin.jsx';
import SearchResults from './pages/SearchResults';
import EmployerApplicants from './components/EmployerApplicants';
import ApplicantDetails from './pages/employer/ApplicantDetails';
import Contact from './pages/Contact';
import Apply from './pages/applicant/Apply';
import JobDetailsPage from './pages/user/JobDetailsPage.jsx';
import PostDetails from './pages/employer/PostDetails';

/**
 * Main application component
 * @returns {JSX.Element} - The application UI
 */
function App() {
	const navigate = useNavigate();
	const showNotification = useNotification();
	const location = useLocation();

	// Set up session expiration handler
	useEffect(() => {
        setupSessionExpirationHandler();
        
        return () => {
            cleanupSessionExpirationHandler();
        };
    }, [navigate, showNotification]);

	/**
	 * Sets up event listener for session expiration
	 */
	const setupSessionExpirationHandler = () => {
		window.addEventListener("sessionExpired", handleSessionExpired);
	};

	/**
	 * Removes event listener for session expiration
	 */
	const cleanupSessionExpirationHandler = () => {
		window.removeEventListener("sessionExpired", handleSessionExpired);
	};

	/**
	 * Handles session expiration event
	 */
	const handleSessionExpired = () => {
		showNotification("Session expired. Please sign in again", "error");
		navigate("/signin");
	};

	// Determine if navbar should be hidden on certain routes
	const hideNavbar = location.pathname.startsWith('/codeassessment');

	// Route configuration
	const routeConfig = defineRouteConfig();

	return (
		<Box className="bg-background min-h-screen">
			{!hideNavbar && <Navbar />}
			<Routes>
				{renderRoutes(routeConfig)}
			</Routes>
		</Box>
	);
}

/**
 * Defines the application route configuration
 * @returns {Array} - Array of route configuration objects
 */
function defineRouteConfig() {
	return [
		// For unLogged users (landing and authorization pages)
		{ path: '/signin', element: <SignInUp/>, roles: ['unLogged'] },
		{ path: '/signup', element: <SignInUp/>, roles: ['unLogged'] },
		{ path: '/employer-login', element: <EmployerLogin />, roles: ['unLogged'] },
		
		// Pages for any user
		{ path: '/', element: <LandingPage />, roles: ['unLogged', 'employer', 'jobSeeker'] },
		{ path: '/contact', element: <Contact />, roles: ['unLogged', 'employer', 'jobSeeker'] },
		
		// Completing profile page, for logged users
		{ path: '/addDetails', element: <AddDetails />, roles: ['jobSeeker', 'employer'] },
		
		// jobSeeker accessible pages
		{ path: '/swipe', element: <Swiping />, roles: ['jobSeeker'] },
		{ path: '/codeassessment/:appId', element: <CodeAss />, roles: ['jobSeeker'] },
		{ path: '/applicant-dashboard', element: <ApplicantDashboard />, roles: ['jobSeeker'] },
		{ path: '/user/applications/:appId', element: <SingleApplicationPage />, roles: ['jobSeeker'] },
		{ path: '/apply/:jobId', element: <Apply />, roles: ['jobSeeker'] },
		
		// Pages accessible for job seekers and unLogged users
		{ path: '/search-results', element: <SearchResults />, roles: ['jobSeeker', 'unLogged'] },
		{ path: '/user/jobs/details/:jobId', element: <JobDetailsPage />, roles: ['jobSeeker', 'unLogged'] },
		
		// Employer accessible pages
		{ path: '/applicant/:applicationId', element: <ApplicantDetails />, roles: ['employer'] },
		{ path: '/posts/new', element: <CreateJobPost />, roles: ['employer'] },
		{ path: '/employer/applicants/:jobId', element: <EmployerApplicants />, roles: ['employer'] },
		{ path: '/employer/posts', element: <EmployerPosts />, roles: ['employer'] },
		{ path: 'employer-dashboard', element: <EmployerDashboard />, roles: ['employer'] },
		{ path: '/applicant/:applicationId', element: <ApplicantDetails />, roles: ['employer'] },
		{ path: '/employer/post/:jobId', element: <PostDetails />, roles: ['employer'] },

		{ path: '/forbidden', element: <Forbidden />, dontCheck: true }
	];
}

/**
 * Renders route components based on configuration
 * @param {Array} routeConfig - Array of route configuration objects
 * @returns {Array} - Array of Route components
 */
function renderRoutes(routeConfig) {
	return routeConfig.map((route) => (
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
	));
}

export default App;