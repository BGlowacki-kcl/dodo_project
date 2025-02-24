import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthForm from '../pages/SignInUp';

test('renders Sign In form correctly', () => {
  render(
    // Router only used for signin and signup forms as both are in one page, only changed by url
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
