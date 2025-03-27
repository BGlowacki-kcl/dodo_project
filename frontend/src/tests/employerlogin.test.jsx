import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import EmployerLogin from '../pages/employer/EmployerLogin';
import { authService } from '../services/auth.service';
import * as notificationContext from '../context/notification.context';

// Mock dependencies
vi.mock('../services/auth.service', () => ({
  authService: {
    signIn: vi.fn()
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('EmployerLogin Component', () => {
  // Setup for each test
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the useNotification hook
    vi.spyOn(notificationContext, 'useNotification').mockImplementation(() => vi.fn());
  });

  // Test rendering
  test('renders the employer login form correctly', () => {
    render(
      <BrowserRouter>
        <EmployerLogin />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Employer Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText('Are you a jobseeker? Sign in here')).toBeInTheDocument();
  });

  // Test password visibility toggle
  test('toggles password visibility when eye icon is clicked', () => {
    render(
      <BrowserRouter>
        <EmployerLogin />
      </BrowserRouter>
    );
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Find the button by its position relative to the password input
    const toggleButton = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Toggle back
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // Test navigation link
  test('navigates to jobseeker sign-in when link is clicked', () => {
    render(
      <BrowserRouter>
        <EmployerLogin />
      </BrowserRouter>
    );
    
    const jobseekerLink = screen.getByText('Are you a jobseeker? Sign in here');
    expect(jobseekerLink).toHaveAttribute('href', '/signin');
  });

  // Test form submission - success case
  test('submits the form and calls signIn on success', async () => {
    authService.signIn.mockResolvedValueOnce({});
    
    render(
      <BrowserRouter>
        <EmployerLogin />
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'employer@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'Password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if loading state is shown
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    
    // Verify that signIn was called with correct parameters
    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith(
        'employer@example.com', 
        'Password123', 
        expect.any(Function), 
        'employer'
      );
    });
  });

  // Test form submission - error case
  test('displays error message when login fails', async () => {
    // Mock a failed login attempt
    const errorMessage = 'Invalid credentials';
    authService.signIn.mockRejectedValueOnce(new Error(errorMessage));
    
    render(
      <BrowserRouter>
        <EmployerLogin />
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'employer@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'WrongPassword' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // Test form validation
  test('requires email and password fields', () => {
    render(
      <BrowserRouter>
        <EmployerLogin />
      </BrowserRouter>
    );
    
    // Check that the form inputs have required attribute
    expect(screen.getByPlaceholderText('Enter your email')).toHaveAttribute('required');
    expect(screen.getByPlaceholderText('Enter your password')).toHaveAttribute('required');
  });

  // Test loading state disables form
  test('disables form inputs during loading state', async () => {
    // Mock a slow sign-in process to test loading state
    authService.signIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <BrowserRouter>
        <EmployerLogin />
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'employer@example.com' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'Password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check that inputs are disabled during loading
    expect(screen.getByPlaceholderText('Enter your email')).toBeDisabled();
    expect(screen.getByPlaceholderText('Enter your password')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });
});