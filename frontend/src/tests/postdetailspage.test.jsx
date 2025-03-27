import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MemoryRouter } from "react-router-dom";
import { vi } from 'vitest';
import PostDetails from '../pages/employer/PostDetails';
import { getJobById, updateJob } from '../services/job.service';


vi.spyOn(console, "error").mockImplementation(() => {});

// Mock services
vi.mock('../services/job.service', () => ({
  getJobById: vi.fn(),
  updateJob: vi.fn(),
}));

// Mock components
vi.mock('../components/PostStatistics', () => ({
  default: () => <div data-testid="post-statistics">Post Statistics</div>,
}));

vi.mock('../components/EmployerApplicants', () => ({
  default: () => <div data-testid="employer-applicants">Employer Applicants</div>,
}));

vi.mock('../components/JobDetailsContent', () => ({
  default: ({ job }) => (
    <div data-testid="job-details-content">
      {job ? `Job Title: ${job.title}` : 'No job details available'}
    </div>
  ),
}));

vi.mock('../components/DeadlineBadge', () => ({
  default: ({ deadline }) => (
    <div data-testid="deadline-badge">{deadline ? `Deadline: ${deadline}` : 'No deadline'}</div>
  ),
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// Mock job data
const mockJob = {
  _id: '1',
  title: 'Software Engineer',
  deadline: '2025-06-01',
};

describe('PostDetails Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getJobById.mockResolvedValue(mockJob);
    updateJob.mockResolvedValue({ ...mockJob, deadline: '2025-06-15' });
  });

  test('renders the PostDetails page with job details', async () => {
    renderWithRouter(<PostDetails />);

    // Wait for job details to load
    await waitFor(() => {
      expect(screen.getByText('Post Details')).toBeInTheDocument();
    });

    // Verify job details are displayed
    
    expect(screen.getByTestId('deadline-badge')).toHaveTextContent('Deadline: 2025-06-01');
  });

  test('navigates between tabs', async () => {
    renderWithRouter(<PostDetails />);

    // Wait for job details to load
    await waitFor(() => {
      expect(screen.getByText('Post Details')).toBeInTheDocument();
    });

    // Verify default tab is "Statistics"
    expect(screen.getByTestId('post-statistics')).toBeInTheDocument();

    // Navigate to "Applicants" tab
    fireEvent.click(screen.getByText('Applicants'));
    expect(screen.getByTestId('employer-applicants')).toBeInTheDocument();

    // Navigate to "Post" tab
    fireEvent.click(screen.getByText('Post'));
    expect(screen.getByTestId('job-details-content')).toBeInTheDocument();
  });

  test('enables and saves deadline editing', async () => {
    renderWithRouter(<PostDetails />);
  
    // Wait for job details to load
    await waitFor(() => {
      expect(screen.getByText('Post Details')).toBeInTheDocument();
    });
  
    // Navigate to "Post" tab
    fireEvent.click(screen.getByText('Post'));
  
    // Enable deadline editing
    fireEvent.click(screen.getByTitle('Edit Deadline'));
    const deadlineInput = screen.getByDisplayValue('2025-06-01'); // Match the input value
    expect(deadlineInput).toBeInTheDocument();
  
    // Update the deadline
    fireEvent.change(deadlineInput, { target: { value: '2025-06-15' } });
    fireEvent.click(screen.getByTitle('Save Deadline'));
  
    
  });

  test('logs error when fetching job details fails', async () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
  
    getJobById.mockRejectedValue(new Error('Failed to fetch job details')); // Force API failure
  
    renderWithRouter(<PostDetails />);
  
    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalled();
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'Error fetching job details:', 
        expect.any(Error) // Expect an Error object
      );
    });
  
    consoleErrorMock.mockRestore(); 
  });

  

  
  
  

  
  
});