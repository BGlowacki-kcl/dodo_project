import { render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Forbidden from '../pages/Forbidden';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(), // Mock useNavigate
  };
});

test('renders forbidden page correctly', async () => {
  const navigate = vi.fn();

  // Override the mock implementation for useNavigate
  useNavigate.mockImplementation(() => navigate);

  render(
    <MemoryRouter>
      <Forbidden />
    </MemoryRouter>
  );

  // Check if the correct text and button are rendered
  expect(screen.getByText(/Go back/i)).toBeInTheDocument();
  expect(screen.getByText(/This page is forbidden/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Go Back/i })).toBeInTheDocument();

  // Simulate a button click and check if navigate was called
  const goBackButton = screen.getByRole('button', { name: /Go Back/i });
  await userEvent.click(goBackButton);
  expect(navigate).toHaveBeenCalledWith(-1);
});