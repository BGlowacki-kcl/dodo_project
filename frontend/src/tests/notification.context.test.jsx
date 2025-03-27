import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotification } from '../context/notification.context';
import { vi } from 'vitest';

// Mock Material UI components
vi.mock('@mui/material', () => ({
  Snackbar: ({ children, open, onClose }) => (
    <div data-testid="snackbar" data-open={open} onClick={onClose}>
      {children}
    </div>
  ),
  Alert: ({ children, severity }) => (
    <div data-testid="alert" data-severity={severity}>
      {children}
    </div>
  ),
}));

// Test component that uses the notification hook
const TestComponent = () => {
  const showNotification = useNotification();
  
  return (
    <div>
      <button 
        data-testid="success-btn"
        onClick={() => showNotification('Success message', 'success')}
      >
        Show Success
      </button>
      <button 
        data-testid="error-btn"
        onClick={() => showNotification('Error message', 'error')}
      >
        Show Error
      </button>
      <button 
        data-testid="default-btn"
        onClick={() => showNotification('Default message')}
      >
        Show Default
      </button>
    </div>
  );
};

describe('Notification Context', () => {
  beforeEach(() => {
    // Reset the mocks
    vi.clearAllMocks();
    // Reset timers before each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();
  });

  test('renders NotificationProvider without crashing', () => {
    render(
      <NotificationProvider>
        <div>Test Content</div>
      </NotificationProvider>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'false');
  });

  test('showNotification displays success notification with correct message', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByTestId('success-btn'));
    
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('alert')).toHaveAttribute('data-severity', 'success');
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  test('showNotification displays error notification with correct message', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByTestId('error-btn'));
    
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('alert')).toHaveAttribute('data-severity', 'error');
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  test('showNotification uses default severity when not specified', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByTestId('default-btn'));
    
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('alert')).toHaveAttribute('data-severity', 'info');
    expect(screen.getByText('Default message')).toBeInTheDocument();
  });

  test('notification is automatically dismissed after timeout', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByTestId('success-btn'));
    
    // Notification should be showing
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');
    
    // Fast-forward time to trigger auto-dismiss
    act(() => {
      vi.advanceTimersByTime(3000); // 3 seconds timeout
    });
    
    // Notification should now be closed
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'false');
  });

  test('notification can be closed manually', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByTestId('success-btn'));
    
    // Notification should be showing
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'true');
    
    // Click on the snackbar to trigger onClose
    fireEvent.click(screen.getByTestId('snackbar'));
    
    // Notification should now be closed
    expect(screen.getByTestId('snackbar')).toHaveAttribute('data-open', 'false');
  });

  test('multiple notifications replace previous ones', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Show first notification
    fireEvent.click(screen.getByTestId('success-btn'));
    expect(screen.getByText('Success message')).toBeInTheDocument();
    
    // Show second notification
    fireEvent.click(screen.getByTestId('error-btn'));
    
    // Should now show error message instead
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByTestId('alert')).toHaveAttribute('data-severity', 'error');
    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });
});
