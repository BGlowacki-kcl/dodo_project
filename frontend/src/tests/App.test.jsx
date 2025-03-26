import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { NotificationProvider } from '../context/notification.context';

// Import the context directly (not from react-router-dom mock)
import * as NotificationContext from '../context/notification.context';

// Use importOriginal pattern for mocking react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // Keep all original exports
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ pathname: '/test-path' }))
  };
});

// Import hooks after mocking the module
import { useNavigate, useLocation, MemoryRouter } from 'react-router-dom';

// Mock the useNotification hook
vi.mock('../context/notification.context', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNotification: vi.fn()
  };
});

// Mock auth guard to avoid authentication issues in tests
vi.mock('../guards/auth.guard', () => ({
  default: ({ children }) => <div data-testid="auth-guard">{children}</div>
}));

// Mock navbar component
vi.mock('../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar Component</div>
}));

// Mock API calls
vi.mock('../services/application.service', () => ({
  getApplicationById: vi.fn().mockResolvedValue({}),
}));

vi.mock('../services/assessment.service', () => ({
  getTasksId: vi.fn().mockResolvedValue([]),
}));

// Mock some basic page components
vi.mock('../pages/SignInUp', () => ({
  default: () => <div data-testid="signin-component">Sign In Component</div>
}));

vi.mock('../pages/applicant/Landing', () => ({
  default: () => <div data-testid="landing-component">Landing Component</div>
}));

vi.mock('../pages/applicant/ApplicantDashboard', () => ({
  default: () => <div data-testid="dashboard-component">Dashboard Component</div>
}));

vi.mock('../pages/applicant/CodeAssessment', () => ({
  default: () => <div data-testid="code-assessment">Code Assessment Component</div>
}));

// Mock global fetch to prevent actual network requests
global.fetch = vi.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
  })
);

// Test utility to render the App component with a memory router
const renderWithRouter = (ui, { route = '/' } = {}) => {
  // Set up location mock for each render
  useLocation.mockReturnValue({ pathname: route });
  
  return render(
    <MemoryRouter initialEntries={[route]}>
      <NotificationProvider>{ui}</NotificationProvider>
    </MemoryRouter>
  );
};

describe('App Component', () => {
  const mockNavigate = vi.fn();
  const mockShowNotification = vi.fn();
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Set default mock values
    useNavigate.mockReturnValue(mockNavigate);
    NotificationContext.useNotification.mockReturnValue(mockShowNotification);
    useLocation.mockReturnValue({ pathname: '/test-path' });
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  it('renders without crashing', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders Navbar when not on code assessment page', () => {
    useLocation.mockReturnValue({ pathname: '/some-path' });
    renderWithRouter(<App />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('does not render Navbar on code assessment pages', () => {
    useLocation.mockReturnValue({ pathname: '/codeassessment/123' });
    renderWithRouter(<App />, { route: '/codeassessment/123' });
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
  });

  it('sets up session expiration handler on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    renderWithRouter(<App />);
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('sessionExpired', expect.any(Function));
  });

  it('cleans up session expiration handler on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderWithRouter(<App />);
    
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('sessionExpired', expect.any(Function));
  });

  it('navigates to signin and shows notification when session expires', async () => {    
    renderWithRouter(<App />);
    
    // Simulate session expiration
    const sessionExpiredEvent = new Event('sessionExpired');
    window.dispatchEvent(sessionExpiredEvent);
    
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Session expired. Please sign in again', 'error');
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  it('renders landing page on root path', async () => {
    renderWithRouter(<App />, { route: '/' });
    
    // The landing page should be wrapped in an auth guard
    const authGuard = screen.getByTestId('auth-guard');
    expect(authGuard).toBeInTheDocument();
    
    // Inside the auth guard should be our landing component
    expect(screen.getByTestId('landing-component')).toBeInTheDocument();
  });

  it('renders sign in page on /signin path', async () => {
    renderWithRouter(<App />, { route: '/signin' });
    
    const authGuard = screen.getByTestId('auth-guard');
    expect(authGuard).toBeInTheDocument();
    
    expect(screen.getByTestId('signin-component')).toBeInTheDocument();
  });

  it('renders applicant dashboard on /applicant-dashboard path', async () => {
    renderWithRouter(<App />, { route: '/applicant-dashboard' });
    
    const authGuard = screen.getByTestId('auth-guard');
    expect(authGuard).toBeInTheDocument();
    
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
  });

  it('applies AuthGuard to protected routes', () => {
    renderWithRouter(<App />, { route: '/applicant-dashboard' });
    const authGuard = screen.getByTestId('auth-guard');
    expect(authGuard).toBeInTheDocument();
  });
});
