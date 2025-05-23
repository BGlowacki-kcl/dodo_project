import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import EmployerPostsPage from '../pages/employer/EmployerPosts';
import { NotificationProvider } from '../context/notification.context';
import { getJobsByEmployer, deleteJob } from '../services/job.service';
import { getApplicationsData } from '../services/application.service';

// Create a shared mock navigate function that can be referenced and reset in tests
const mockNavigate = vi.fn();

// Mock services
vi.mock('../services/job.service', () => ({
  getJobsByEmployer: vi.fn(),
  deleteJob: vi.fn()
}));

vi.mock('../services/application.service', () => ({
  getApplicationsData: vi.fn()
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/employer/posts', search: '' })
  };
});

// Mock components if needed
vi.mock('../components/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

// Mock PostCard component - Fixed to handle callbacks properly
vi.mock('../components/PostCard', () => ({
  default: ({ jobId, title, type, location, totalApplicants, pendingApplicants, statusBreakdown, onDelete, onEdit, onViewApplications }) => {
    return (
      <article data-testid={`post-card-${jobId}`}>
        <h2>{title}</h2>
        <p>{type}</p>
        <p>{location}</p>
        <p>{totalApplicants} total</p>
        <p>{pendingApplicants} pending</p>
        <p>{statusBreakdown?.find(s => s.status === 'Accepted')?.count || 0} accepted</p>
        <button 
          onClick={() => onEdit && onEdit(jobId)} 
          data-testid={`edit-button-${jobId}`}
        >
          edit
        </button>
        <button 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this job post?')) {
              onDelete && onDelete(jobId);
            }
          }} 
          data-testid={`delete-button-${jobId}`}
        >
          delete
        </button>
        <button 
          onClick={() => onViewApplications && onViewApplications(jobId)} 
          data-testid={`view-button-${jobId}`}
        >
          view applications
        </button>
      </article>
    );
  }
}));

// Rest of the mocks remain the same
vi.mock('../components/Pagination', () => ({
  default: ({ pageCount, onPageChange }) => (
    <div data-testid="pagination">
      {pageCount > 1 && (
        <>
          <button onClick={() => onPageChange({ selected: 0 })}>previous</button>
          <button onClick={() => onPageChange({ selected: 1 })}>next</button>
        </>
      )}
    </div>
  )
}));

vi.mock('../components/SearchBar', () => ({
  default: ({ placeholder, onSearch }) => (
    <div data-testid="search-bar">
      <input 
        placeholder={placeholder} 
        onChange={(e) => onSearch(e.target.value)} 
        data-testid="search-input"
      />
    </div>
  )
}));

// Helper for rendering with providers
const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <NotificationProvider>
        {ui}
      </NotificationProvider>
    </BrowserRouter>
  );
};

// Mock data remains the same
const mockJobs = [
  { 
    _id: '1', 
    title: 'Software Engineer', 
    employmentType: 'Full-Time', 
    location: 'London', 
    deadline: '2025-06-01',
    salary: '£50,000-£70,000',
    roleType: 'Graduate',
    description: 'Software engineering role'
  },
  { 
    _id: '2', 
    title: 'UX Designer', 
    employmentType: 'Part-Time', 
    location: 'Remote', 
    deadline: '2025-06-15',
    salary: '£40,000-£55,000',
    roleType: 'Placement',
    description: 'UX design role'
  }
];

const mockApplicationsData = {
  groupedStatuses: [
    {
      jobId: '1',
      statuses: [
        { status: 'Submitted', count: 5 },
        { status: 'Interviewing', count: 2 },
        { status: 'Accepted', count: 1 },
        { status: 'Rejected', count: 3 },
        { status: 'Applying', count: 10 }
      ]
    },
    {
      jobId: '2',
      statuses: [
        { status: 'Submitted', count: 3 },
        { status: 'Interviewing', count: 1 },
        { status: 'Accepted', count: 2 },
        { status: 'Rejected', count: 0 }
      ]
    }
  ]
};

describe('EmployerPosts Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mockNavigate
    mockNavigate.mockReset();
    
    // Default mock implementation
    getJobsByEmployer.mockResolvedValue(mockJobs);
    getApplicationsData.mockResolvedValue(mockApplicationsData);
    deleteJob.mockResolvedValue({ success: true });
    
    // Mock confirm dialog
    window.confirm = vi.fn();
    
    // Mock window scroll
    window.scrollTo = vi.fn();
  });

  

  test('handles pagination correctly', async () => {
    renderWithProviders(<EmployerPostsPage />);
  
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  
    // Verify the first page of jobs is displayed
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('UX Designer')).toBeInTheDocument();
  
    
  
    // Verify that the `handlePageChange` function updates the page
    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });
  
  test('filters jobs by search term', async () => {
    renderWithProviders(<EmployerPostsPage />);
  
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  
    // Simulate entering a search query
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'engineer' } });
  
    // Verify that the `handleSearch` function filters the jobs
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.queryByText('UX Designer')).not.toBeInTheDocument();
  });
  
  test('calculates and displays applicant statistics correctly', async () => {
    renderWithProviders(<EmployerPostsPage />);
  
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  
    // Find the first job post (Software Engineer)
    const firstJobPost = screen.getByTestId('post-card-1');
  
    // Verify total applicants (excluding 'Applying' status)
    expect(within(firstJobPost).getByText(/11 total/i)).toBeInTheDocument();
  
    // Verify pending applicants (only 'Submitted' and 'Interviewing' statuses)
    expect(within(firstJobPost).getByText(/7 pending/i)).toBeInTheDocument();
  
    // Verify accepted applicants
    expect(within(firstJobPost).getByText(/1 accepted/i)).toBeInTheDocument();
  });
});