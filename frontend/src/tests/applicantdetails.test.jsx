import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ApplicantDetails from '../pages/employer/ApplicantDetails';
import { getApplicationById, updateStatus } from '../services/application.service';

// Mock services
vi.mock('../services/application.service', () => ({
  getApplicationById: vi.fn(),
  updateStatus: vi.fn(),
}));

// Mock react-router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ applicationId: 'app123' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock components used in ApplicantDetails
vi.mock('../components/ApplicationDetails', () => ({
  default: ({ coverLetter, questions, answers, codeAssessment }) => (
    <div data-testid="application-details">
      <div data-testid="cover-letter">{coverLetter}</div>
      <div data-testid="questions-count">{questions?.length || 0} questions</div>
      <div data-testid="answers-count">{answers?.length || 0} answers</div>
      {codeAssessment && <div data-testid="code-assessment">Has code assessment</div>}
    </div>
  ),
}));

vi.mock('../components/UserDetails', () => ({
  default: ({ user }) => (
    <div data-testid="user-details">
      <div data-testid="user-name">{user?.name}</div>
      <div data-testid="user-email">{user?.email}</div>
    </div>
  ),
}));

vi.mock('../components/StatusBadge', () => ({
  default: ({ status }) => <div data-testid="status-badge">Status: {status}</div>,
}));

describe('ApplicantDetails Page', () => {
  // Mock data
  const mockApplicant = {
    _id: 'app123',
    status: 'Applied',
    coverLetter: 'I am very interested in this position',
    submittedAt: '2025-03-27T12:00:00Z',
    applicant: {
      name: 'John Doe',
      email: 'john@example.com',
      phoneNumber: '123-456-7890',
      location: 'Remote',
      skills: ['JavaScript', 'React'],
    },
    questions: [
      { _id: 'q1', questionText: 'Why do you want this job?' },
      { _id: 'q2', questionText: 'What is your experience?' },
    ],
    answers: [
      { questionId: 'q1', answerText: 'I love coding!' },
      { questionId: 'q2', answerText: '5 years experience' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getApplicationById.mockResolvedValue(mockApplicant);
    updateStatus.mockResolvedValue({ success: true });
  });

  test('renders the ApplicantDetails page with loading state', () => {
    render(
      <BrowserRouter>
        <ApplicantDetails />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading applicant details...')).toBeInTheDocument();
  });

  test('renders applicant details after successful fetch', async () => {
    render(
      <BrowserRouter>
        <ApplicantDetails />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading applicant details...')).not.toBeInTheDocument();
    });
    
    // Check page header
    expect(screen.getByText('Applicant Details')).toBeInTheDocument();
    
    // Check StatusBadge renders with correct status
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Status: Applied');
    
    // Check UserDetails renders
    expect(screen.getByTestId('user-details')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
    
    // Check ApplicationDetails renders
    expect(screen.getByTestId('application-details')).toBeInTheDocument();
    expect(screen.getByTestId('cover-letter')).toHaveTextContent('I am very interested in this position');
    expect(screen.getByTestId('answers-count')).toHaveTextContent('2 answers');
  });

  test('shortlists an applicant when Shortlist button is clicked', async () => {
    render(
      <BrowserRouter>
        <ApplicantDetails />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading applicant details...')).not.toBeInTheDocument();
    });
    
    // Find and click the Shortlist button
    const shortlistButton = screen.getByText('Shortlist');
    fireEvent.click(shortlistButton);
    
    // Check updateStatus was called with correct arguments
    expect(updateStatus).toHaveBeenCalledWith('app123', false);
  });

  test('rejects an applicant when Reject button is clicked', async () => {
    render(
      <BrowserRouter>
        <ApplicantDetails />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading applicant details...')).not.toBeInTheDocument();
    });
    
    // Find and click the Reject button
    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);
    
    // Check updateStatus was called with correct arguments
    expect(updateStatus).toHaveBeenCalledWith('app123', true);
  });

  test('displays error message when fetching applicant details fails', async () => {
    // Mock API failure
    const errorMessage = 'Failed to fetch application details';
    getApplicationById.mockRejectedValue(new Error(errorMessage));
    
    render(
      <BrowserRouter>
        <ApplicantDetails />
      </BrowserRouter>
    );
    
    // Wait for error to display
    await waitFor(() => {
      expect(screen.getByText(`Failed to load application: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  test('displays error message when updating status fails', async () => {
    // Set up component
    render(
      <BrowserRouter>
        <ApplicantDetails />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading applicant details...')).not.toBeInTheDocument();
    });
    
    // Mock API failure for status update
    updateStatus.mockRejectedValue(new Error('Failed to update status'));
    
    // Click the Shortlist button
    const shortlistButton = screen.getByText('Shortlist');
    fireEvent.click(shortlistButton);
    
    // Check error message appears
    await waitFor(() => {
      expect(screen.getByText(/Failed to update status:/)).toBeInTheDocument();
    });
  });

  test('shows no action buttons for accepted or rejected applications', async () => {
    // Mock an already accepted application
    getApplicationById.mockResolvedValue({
      ...mockApplicant,
      status: 'Accepted'
    });
    
    render(
      <BrowserRouter>
        <ApplicantDetails />
      </BrowserRouter>
    );
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading applicant details...')).not.toBeInTheDocument();
    });
    
    // Verify status badge shows Accepted
    expect(screen.getByTestId('status-badge')).toHaveTextContent('Status: Accepted');
    
    // Check that there are no action buttons
    expect(screen.queryByText('Shortlist')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject')).not.toBeInTheDocument();
  });

  
});
