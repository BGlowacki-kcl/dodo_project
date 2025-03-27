// src/tests/ModalMessages.test.jsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalMessages from '../components/ModalMessages.jsx';

describe('ModalMessages Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when show is false', () => {
    const { container } = render(
      <ModalMessages show={false} onClose={() => {}} message="Test message" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with default props when show is true', () => {
    render(
      <ModalMessages
        show={true}
        onClose={() => {}}
        message="Are you sure you want to proceed?"
      />
    );

    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument();
  });

  it('renders modal with confirm button when onConfirm is provided', () => {
    render(
      <ModalMessages
        show={true}
        onClose={() => {}}
        message="Please confirm your action"
        onConfirm={() => {}}
      />
    );

    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your action')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <ModalMessages
        show={true}
        onClose={mockOnClose}
        message="Test message"
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const mockOnConfirm = vi.fn();
    render(
      <ModalMessages
        show={true}
        onClose={() => {}}
        message="Test message"
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders custom button text when provided', () => {
    render(
      <ModalMessages
        show={true}
        onClose={() => {}}
        message="Custom text test"
        onConfirm={() => {}}
        confirmText="Yes"
        cancelText="No"
      />
    );

    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Custom text test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
  });

  it('applies correct CSS classes to modal elements', () => {
    render(
      <ModalMessages
        show={true}
        onClose={() => {}}
        message="Test styling"
        onConfirm={() => {}}
      />
    );

    // Correctly select the overlay (outer div) and content (inner div)
    const modalOverlay = screen.getByText('Test styling').closest('div').parentElement.parentElement;
    const modalContent = screen.getByText('Test styling').closest('div').parentElement;
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });

    expect(modalOverlay).toHaveClass('fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50');
    expect(modalContent).toHaveClass('bg-white w-full max-w-md p-6 rounded-lg shadow-lg');
    expect(cancelButton).toHaveClass('px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors');
    expect(confirmButton).toHaveClass('px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors');
  });
});