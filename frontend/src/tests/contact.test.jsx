// frontend/src/tests/Contact.test.jsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Contact from '../pages/Contact.jsx';
import sendEmail from '../services/email.service';
import { NotificationProvider } from '../context/notification.context.jsx';

// Mock the sendEmail service
vi.mock('../services/email.service', () => ({
  default: vi.fn()
}));

// Mock component for FormItem
vi.mock('../components/FormItem.jsx', () => ({
  default: ({ htmlFor, name, label, value, onChange, required, placeholder, largeArena }) => (
    <div>
      <label htmlFor={htmlFor}>{label}</label>
      {largeArena ? (
        <textarea
          id={htmlFor}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={htmlFor}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}));

// Mock WhiteBox
vi.mock('../components/WhiteBox.jsx', () => ({
  default: ({ children, className }) => <div className={className}>{children}</div>
}));

// Mock useNotification hook
const mockShowNotification = vi.fn();
vi.mock('../context/notification.context.jsx', async () => {
  const actual = await vi.importActual('../context/notification.context.jsx');
  return {
    ...actual,
    NotificationProvider: ({ children }) => <div>{children}</div>,
    useNotification: () => mockShowNotification
  };
});

// Custom render with providers
const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <NotificationProvider>{ui}</NotificationProvider>
    </BrowserRouter>
  );
};

describe('Contact Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates form fields on user input', () => {
    renderWithProviders(<Contact />);
    const nameInput = screen.getByLabelText('Your Name');
    const emailInput = screen.getByLabelText('Email Address');
    const subjectInput = screen.getByLabelText('Subject');
    const messageInput = screen.getByLabelText('Your Message');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    fireEvent.change(messageInput, { target: { value: 'Test Message' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(subjectInput.value).toBe('Test Subject');
    expect(messageInput.value).toBe('Test Message');
  });

  it('renders footer with current year', () => {
    renderWithProviders(<Contact />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`Joborithm © ${currentYear} - Your gateway to the best career opportunities.`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
});