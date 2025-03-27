import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ApplicantShortlist from '../components/Shortlist';
import { getShortlist, removeJobFromShortlist } from '../services/shortlist.service';
import { useNotification } from '../context/notification.context';

// Mock the required services and hooks
vi.mock('../services/shortlist.service', () => ({
  getShortlist: vi.fn(),
  removeJobFromShortlist: vi.fn()
}));

vi.mock('../context/notification.context', () => ({
  useNotification: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock component used in Shortlist.jsx
vi.mock('../components/JobCard', () => ({
  default: ({ job, handleJobClick, handleRemoveFromShortlist }) => (
    <div data-testid={`job-card-${job._id}`}>
      <h3>{job.title}</h3>
      <p>Company: {job.company || 'No Company Listed'}</p>
      <p>Location: {job.location || 'No Location Listed'}</p>
      <p>Type: {job.employmentType || job.type || 'No Type Listed'}</p>
      <button onClick={() => handleJobClick(job._id)}>View Details</button>
      <button onClick={() => handleRemoveFromShortlist(job._id)}>Remove from Shortlist</button>
    </div>
  )
}));

vi.mock('../components/SearchBar', () => ({
  default: ({ onSearch }) => (
    <input 
      data-testid="search-input"
      placeholder="Search jobs..."
      onChange={(e) => onSearch(e.target.value)}
    />
  )
}));

vi.mock('../components/Pagination', () => ({
  default: ({ pageCount, onPageChange }) => (
    <div data-testid="pagination">
      {Array.from({ length: pageCount }, (_, i) => (
        <button key={i} onClick={() => onPageChange({ selected: i })}>
          {i + 1}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../components/SearchAndShortlistFilter', () => ({
  default: ({ isOpen, onClose, applyFilters }) => (
    <div data-testid="filter-modal" style={{ display: isOpen ? 'block' : 'none' }}>
      <button onClick={() => applyFilters({ location: 'London', type: 'Full-time' })}>
        Apply Filters
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

describe('ApplicantShortlist Component', () => {
  const mockShortlistData = {
    jobs: [
      {
        _id: '1',
        title: 'Frontend Developer',
        company: 'Tech Co',
        location: 'London',
        employmentType: 'Full-time',
      },
      {
        _id: '2',
        title: 'UX Designer',
        company: 'Design Studio',
        location: 'Remote',
        employmentType: 'Contract',
      },
      {
        _id: '3',
        title: 'Backend Developer',
        company: 'Startup Inc',
        location: 'New York',
        employmentType: 'Full-time',
      },
    ]
  };

  const mockShowNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    getShortlist.mockResolvedValue(mockShortlistData);
    removeJobFromShortlist.mockResolvedValue({});
    useNotification.mockReturnValue(mockShowNotification);
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders shortlisted jobs after fetching data', async () => {
    renderWithRouter(<ApplicantShortlist />);

    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('UX Designer')).toBeInTheDocument();
      expect(screen.getByText('Backend Developer')).toBeInTheDocument();
    });

    expect(getShortlist).toHaveBeenCalledTimes(1);
  });

  it('displays loading state while fetching data', async () => {
    renderWithRouter(<ApplicantShortlist />);
    
    expect(screen.getByText('Loading shortlisted jobs...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading shortlisted jobs...')).not.toBeInTheDocument();
    });
  });

  it('shows error message when no jobs match search', async () => {
    renderWithRouter(<ApplicantShortlist />);
    
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'nonexistentjob' } });

    expect(screen.getByText('No shortlisted jobs match your search.')).toBeInTheDocument();
  });

  it('filters jobs when searching', async () => {
    renderWithRouter(<ApplicantShortlist />);
    
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Frontend' } });

    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.queryByText('UX Designer')).not.toBeInTheDocument();
    expect(screen.queryByText('Backend Developer')).not.toBeInTheDocument();
  });

  it('removes job from shortlist', async () => {
    renderWithRouter(<ApplicantShortlist />);
    
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    const removeButton = screen.getAllByText('Remove from Shortlist')[0];
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(removeJobFromShortlist).toHaveBeenCalledWith('1');
      expect(mockShowNotification).toHaveBeenCalledWith("Job removed from shortlist", "success");
    });
  });

  it('handles error when removing job from shortlist fails', async () => {
    removeJobFromShortlist.mockRejectedValueOnce(new Error('Failed to remove'));
    
    renderWithRouter(<ApplicantShortlist />);
    
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    const removeButton = screen.getAllByText('Remove from Shortlist')[0];
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith("Failed to remove job from shortlist", "error");
    });
  });

  it('opens filter modal when filter button is clicked', async () => {
    renderWithRouter(<ApplicantShortlist />);
    
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });

    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument();

    
  });

  it('handles empty shortlist gracefully', async () => {
    getShortlist.mockResolvedValueOnce({ jobs: [] });
    
    renderWithRouter(<ApplicantShortlist />);

    await waitFor(() => {
      expect(screen.getByText('No shortlisted jobs match your search.')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    console.error = vi.fn(); // Suppress console errors
    getShortlist.mockRejectedValueOnce(new Error('Failed to fetch'));

    renderWithRouter(<ApplicantShortlist />);

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith("Failed to fetch shortlisted jobs", "error");
    });
  });

  it('shows pagination when there are more jobs than the limit per page', async () => {
    // Create more than jobsPerPage (15) jobs
    const manyJobs = {
      jobs: Array.from({ length: 20 }, (_, i) => ({
        _id: `job${i}`,
        title: `Job ${i}`,
        company: 'Company',
        location: 'Location',
        employmentType: 'Full-time'
      }))
    };
    
    getShortlist.mockResolvedValueOnce(manyJobs);
    
    renderWithRouter(<ApplicantShortlist />);

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });
  });

  it('changes page when pagination is clicked', async () => {
    // Create more than jobsPerPage (15) jobs
    const manyJobs = {
      jobs: Array.from({ length: 20 }, (_, i) => ({
        _id: `job${i}`,
        title: `Job ${i}`,
        company: 'Company',
        location: 'Location',
        employmentType: 'Full-time'
      }))
    };
    
    getShortlist.mockResolvedValueOnce(manyJobs);
    
    renderWithRouter(<ApplicantShortlist />);

    await waitFor(() => {
      const page2Button = screen.getByText('2');
      fireEvent.click(page2Button);
      
      // We'd expect to see Job 15 (first job on second page) and not Job 0 (first job on first page)
      expect(screen.queryByText('Job 0')).not.toBeInTheDocument();
      expect(screen.getByText('Job 15')).toBeInTheDocument();
    });
  });
});
