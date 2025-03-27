import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ApplicantShortlist from '../components/Shortlist';
import { getShortlist } from '../services/shortlist.service';

// Mock the shortlist service
vi.mock('../services/shortlist.service', () => ({
  getShortlist: vi.fn(),
}));

describe('ApplicantShortlist Component', () => {
  const mockShortlistData = {
    jobs: [
      {
        _id: '1',
        title: 'Frontend Developer',
        company: 'Tech Co',
        location: 'London',
        type: 'Full-time',
      },
      {
        _id: '2',
        title: 'UX Designer',
        company: 'Design Studio',
        location: 'Remote',
        type: 'Contract',
      },
      {
        _id: '3',
        title: 'Backend Developer',
        company: 'Startup Inc',
        location: 'New York',
        type: 'Full-time',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getShortlist.mockResolvedValue(mockShortlistData);
  });

  it('renders shortlisted jobs after fetching data', async () => {
    render(<ApplicantShortlist />);

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('UX Designer')).toBeInTheDocument();
      expect(screen.getByText('Backend Developer')).toBeInTheDocument();
    });

    expect(getShortlist).toHaveBeenCalledTimes(1);
  });

  it('handles empty shortlist gracefully', async () => {
    getShortlist.mockResolvedValue({ jobs: [] });

    render(<ApplicantShortlist />);

    await waitFor(() => {
      expect(screen.getByText('No shortlisted jobs available.')).toBeInTheDocument();
    });
  });

  it('filters jobs by location', async () => {
    render(<ApplicantShortlist />);

    await waitFor(() => {
      expect(screen.getAllByText('Apply Now').length).toBe(3);
    });

    const locationInput = screen.getByPlaceholderText('Enter location');
    fireEvent.change(locationInput, { target: { value: 'London' } });

    // Should only show the London job
    expect(screen.getAllByText('Apply Now').length).toBe(1);
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.queryByText('UX Designer')).not.toBeInTheDocument();
  });

  it('filters jobs by job type', async () => {
    render(<ApplicantShortlist />);

    await waitFor(() => {
      expect(screen.getAllByText('Apply Now').length).toBe(3);
    });

    // Use getByRole instead of getByLabelText
    const jobTypeSelect = screen.getByRole('combobox');
    fireEvent.change(jobTypeSelect, { target: { value: 'Contract' } });

    // Should only show the Contract job
    expect(screen.getAllByText('Apply Now').length).toBe(1);
    expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
    expect(screen.getByText('UX Designer')).toBeInTheDocument();
  });

  it('combines multiple filters', async () => {
    render(<ApplicantShortlist />);

    await waitFor(() => {
      expect(screen.getAllByText('Apply Now').length).toBe(3);
    });

    // Set multiple filters using role or other selectors
    const locationInput = screen.getByPlaceholderText('Enter location');
    const jobTypeSelect = screen.getByRole('combobox');
    
    fireEvent.change(locationInput, { target: { value: 'New York' } });
    fireEvent.change(jobTypeSelect, { target: { value: 'Full-time' } });

    // Should only show the New York Full-time job
    expect(screen.getAllByText('Apply Now').length).toBe(1);
    expect(screen.getByText('Backend Developer')).toBeInTheDocument();
    expect(screen.queryByText('Frontend Developer')).not.toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Simulate API error
    console.error = vi.fn(); // Suppress console errors
    getShortlist.mockRejectedValue(new Error('Failed to fetch'));

    render(<ApplicantShortlist />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
      expect(screen.getByText('No shortlisted jobs available.')).toBeInTheDocument();
    });
  });
});
