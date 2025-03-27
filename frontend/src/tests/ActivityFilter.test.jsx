// frontend/src/tests/ActivityFilter.test.jsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActivityFilter from '../components/filters/ActivityFilter.jsx';
import { FaFilter, FaClipboardList, FaBriefcase, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaFilter: () => <span data-testid="fa-filter" />,
  FaClipboardList: () => <span data-testid="fa-clipboard-list" />,
  FaBriefcase: () => <span data-testid="fa-briefcase" />,
  FaCalendarAlt: () => <span data-testid="fa-calendar-alt" />,
  FaCheckCircle: () => <span data-testid="fa-check-circle" />
}));

describe('ActivityFilter Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ActivityFilter isOpen={false} onClose={() => {}} applyFilters={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders filter options when isOpen is true', async () => {
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Activity Filters')).toBeInTheDocument();
      expect(screen.getByText('Titles')).toBeInTheDocument();
      expect(screen.getByText('Types')).toBeInTheDocument();
      expect(screen.getByText('Submission Date')).toBeInTheDocument();
      expect(screen.getByText('Statuses')).toBeInTheDocument();

      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Full-Time')).toBeInTheDocument();
      expect(screen.getByText('Applying')).toBeInTheDocument();
      expect(screen.getByText('1 Week Ago')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('updates title selection when checkbox is clicked', async () => {
    const mockApplyFilters = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={mockApplyFilters} />
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    const titleCheckbox = screen.getByLabelText('Software Engineer');
    fireEvent.click(titleCheckbox);

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: ['Software Engineer'],
        types: [],
        statuses: [],
        submissionDateRange: ''
      })
    );
  });

  it('updates type selection when checkbox is clicked', async () => {
    const mockApplyFilters = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={mockApplyFilters} />
    );

    await waitFor(() => {
      expect(screen.getByText('Full-Time')).toBeInTheDocument();
    });

    const typeCheckbox = screen.getByLabelText('Full-Time');
    fireEvent.click(typeCheckbox);

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: [],
        types: ['Full-Time'],
        statuses: [],
        submissionDateRange: ''
      })
    );
  });

  it('updates status selection when checkbox is clicked', async () => {
    const mockApplyFilters = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={mockApplyFilters} />
    );

    await waitFor(() => {
      expect(screen.getByText('Applying')).toBeInTheDocument();
    });

    const statusCheckbox = screen.getByLabelText('Applying');
    fireEvent.click(statusCheckbox);

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: [],
        types: [],
        statuses: ['Applying'],
        submissionDateRange: ''
      })
    );
  });

  it('updates date range selection when radio is clicked', async () => {
    const mockApplyFilters = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={mockApplyFilters} />
    );

    await waitFor(() => {
      expect(screen.getByText('1 Week Ago')).toBeInTheDocument();
    });

    const dateRadio = screen.getByLabelText('1 Week Ago');
    fireEvent.click(dateRadio);

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: [],
        types: [],
        statuses: [],
        submissionDateRange: '1_week'
      })
    );
  });

  it('filters titles based on search input', async () => {
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    const titleSearchInput = screen.getByPlaceholderText('Search titles...');
    fireEvent.change(titleSearchInput, { target: { value: 'Software' } });

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Data Scientist')).not.toBeInTheDocument();
    expect(screen.queryByText('Product Manager')).not.toBeInTheDocument();
  });

  it('filters types based on search input', async () => {
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Full-Time')).toBeInTheDocument();
    });

    const typeSearchInput = screen.getByPlaceholderText('Search types...');
    fireEvent.change(typeSearchInput, { target: { value: 'Full' } });

    expect(screen.getByText('Full-Time')).toBeInTheDocument();
    expect(screen.queryByText('Part-Time')).not.toBeInTheDocument();
    expect(screen.queryByText('Internship')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={mockOnClose} applyFilters={() => {}} />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('applies multiple filters and calls applyFilters', async () => {
    const mockApplyFilters = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={mockApplyFilters} />
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Software Engineer'));
    fireEvent.click(screen.getByLabelText('Full-Time'));
    fireEvent.click(screen.getByLabelText('Applying'));
    fireEvent.click(screen.getByLabelText('1 Week Ago'));

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith({
      titles: ['Software Engineer'],
      types: ['Full-Time'],
      statuses: ['Applying'],
      submissionDateRange: '1_week'
    });
  });

  // Additional Tests for Improved Coverage
  it('deselects title when checkbox is clicked again', async () => {
    const mockApplyFilters = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={mockApplyFilters} />
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    const titleCheckbox = screen.getByLabelText('Software Engineer');
    fireEvent.click(titleCheckbox); // Select
    fireEvent.click(titleCheckbox); // Deselect

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: [],
        types: [],
        statuses: [],
        submissionDateRange: ''
      })
    );
  });

  it('handles multiple title selections', async () => {
    const mockApplyFilters = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={mockApplyFilters} />
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Software Engineer'));
    fireEvent.click(screen.getByLabelText('Data Scientist'));

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: ['Software Engineer', 'Data Scientist'],
        types: [],
        statuses: [],
        submissionDateRange: ''
      })
    );
  });

  it('handles case-insensitive title search', async () => {
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    const titleSearchInput = screen.getByPlaceholderText('Search titles...');
    fireEvent.change(titleSearchInput, { target: { value: 'SOFTWARE' } });

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Data Scientist')).not.toBeInTheDocument();
  });

  it('shows no titles when search has no matches', async () => {
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    const titleSearchInput = screen.getByPlaceholderText('Search titles...');
    fireEvent.change(titleSearchInput, { target: { value: 'NonExistent' } });

    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Scientist')).not.toBeInTheDocument();
    expect(screen.queryByText('Product Manager')).not.toBeInTheDocument();
  });

  it('calls onClose when header close button is clicked', async () => {
    const mockOnClose = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={mockOnClose} applyFilters={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Activity Filters')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('maintains state across multiple interactions', async () => {
    const mockApplyFilters = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={mockApplyFilters} />
    );

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Software Engineer'));
    fireEvent.click(screen.getByLabelText('Full-Time'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: ['Software Engineer'],
        types: ['Full-Time'],
        statuses: [],
        submissionDateRange: ''
      })
    );

    fireEvent.click(screen.getByLabelText('Applying'));
    fireEvent.click(screen.getByLabelText('1 Week Ago'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: ['Software Engineer'],
        types: ['Full-Time'],
        statuses: ['Applying'],
        submissionDateRange: '1_week'
      })
    );
  });

  it('applies filters with all statuses selected', async () => {
    const mockApplyFilters = vi.fn();
    render(
      <ActivityFilter isOpen={true} onClose={() => {}} applyFilters={mockApplyFilters} />
    );

    await waitFor(() => {
      expect(screen.getByText('Applying')).toBeInTheDocument();
    });

    const statuses = [
      'Applying', 'Applied', 'In Review', 'Shortlisted',
      'Code Challenge', 'Rejected', 'Accepted'
    ];
    statuses.forEach(status => {
      fireEvent.click(screen.getByLabelText(status));
    });

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: [],
        types: [],
        statuses,
        submissionDateRange: ''
      })
    );
  });
});