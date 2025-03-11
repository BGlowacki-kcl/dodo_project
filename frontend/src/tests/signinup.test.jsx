import { render, screen, fireEvent } from '@testing-library/react'; // Import fireEvent
import userEvent from '@testing-library/user-event'; // Import userEvent
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthForm from '../pages/SignInUp';
import { useNotification } from '../context/notification.context';
import { authService } from '../services/auth.service';
import { waitFor } from '@testing-library/react';

// Mock the useNotification hook
vi.mock('../context/notification.context', () => ({
  useNotification: vi.fn(),
}));

// Mock the authService methods
vi.mock('../services/auth.service', () => ({
  authService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
  },
}));

describe('AuthForm', () => {
  const mockShowNotification = vi.fn();

  beforeEach(() => {
    useNotification.mockReturnValue(mockShowNotification);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('successful sign-in', async () => {
    authService.signIn.mockResolvedValueOnce();

    render(
      <MemoryRouter initialEntries={['/signin']}>
        <AuthForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Sign in successful!', 'success');
    });
  });

  test('successful sign-up', async () => {
    authService.signUp.mockResolvedValueOnce();

    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AuthForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm your password/i), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Sign up successful! Please complete your profile.', 'success');
    });
  });

  test('password mismatch during sign-up', async () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AuthForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm your password/i), { target: { value: 'Password1234' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Sign up failed. Please try again.', 'error');
      expect // T have: Passwords do not match.
    });
  });

  test('weak password during sign-up', async () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AuthForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'weak' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm your password/i), { target: { value: 'weak' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Sign up failed. Please try again.', 'error');
    });
  });

  test('authentication error during sign-in', async () => {
    authService.signIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(
      <MemoryRouter initialEntries={['/signin']}>
        <AuthForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Sign in failed. Please check your email and password.', 'error');
    });
  });

  test('sign-in failure shows correct error message', async () => {
    authService.signIn.mockRejectedValueOnce(new Error('Sign in failed. Please check your email and password.'));

    render(
      <MemoryRouter initialEntries={['/signin']}>
        <AuthForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Sign in failed. Please check your email and password.', 'error');
    });
  });

  test('setError is called with error message when sign-in fails', async () => {
    const errorMessage = 'Network error occurred';
    authService.signIn.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <MemoryRouter initialEntries={['/signin']}>
        <AuthForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Sign in failed. Please check your email and password.', 'error');
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('setError is called with default message if error has no message', async () => {
    authService.signIn.mockRejectedValueOnce(new Error());

    render(
      <MemoryRouter initialEntries={['/signin']}>
        <AuthForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Sign in failed. Please check your email and password.', 'error');
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });
});

describe('Correct render of elements', () => { 

  test('renders Sign In form correctly', () => {
    render(
      <MemoryRouter initialEntries={['/signin']}>
        <Routes>
          <Route path="/signin" element={<AuthForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome Back!/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders Sign Up form correctly', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<AuthForm />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  test('toggle password visibility', async () => {
    render(
      <MemoryRouter initialEntries={['/signin']}>
        <AuthForm />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const toggleButton = screen.getByRole('button', { name: /👁️/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('password visibility toggle button changes icon', async () => {
    render(
      <MemoryRouter initialEntries={['/signin']}>
        <AuthForm />
      </MemoryRouter>
    );

    const toggleButton = screen.getByRole('button', { name: /👁️/i });

    expect(toggleButton).toHaveTextContent('👁️');
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('🙈');
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('👁️');
  });
});

describe(('Correctly handles password edge cases'), () => {

  test('correctly catches password outside legal values', async () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<AuthForm />} />
        </Routes>
      </MemoryRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    fireEvent.change(passwordInput, { target: { value: 'short' } });

    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });

    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(submitButton);

    const errorMessage = await screen.findByText(
      /Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number./i
    );
    expect(errorMessage).toBeInTheDocument();

  });

  test('correctly catches passwords mismatch', async () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<AuthForm />} />
        </Routes>
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    fireEvent.change(passwordInput, { target: { value: 'ValidPass1' } });

    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    fireEvent.change(confirmPasswordInput, { target: { value: 'MismatchPass1' } });

    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(submitButton);

    const errorMessage = await screen.findByText(/Passwords do not match./i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('does not process form if password confirmation is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<AuthForm />} />
        </Routes>
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    fireEvent.change(passwordInput, { target: { value: 'ValidPass1' } });

    const submitButton = screen.getByRole('button', { name: /Sign Up/i });
    await userEvent.click(submitButton);

    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

});