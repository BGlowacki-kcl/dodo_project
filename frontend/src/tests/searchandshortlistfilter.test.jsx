import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SearchAndShortlistFilter from '../components/filters/SearchAndShortlistFilter';
import {
  getAllJobRoles,
  getAllJobLocations,
  getAllJobTypes,
  getAllCompanies,
  getSalaryBounds,
} from '../services/job.service';

// Mock the required modules and hooks
vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    search: '?jobType=Full-time'
  }),
}));

vi.mock('../services/job.service', () => ({
  getAllJobRoles: vi.fn(),
  getAllJobLocations: vi.fn(),
  getAllJobTypes: vi.fn(),
  getAllCompanies: vi.fn(),
  getSalaryBounds: vi.fn(),
}));

vi.mock('../hooks/useLocalStorage', () => ({
  default: vi.fn((key, initialValue) => {
    const [state, setState] = React.useState(initialValue);
    return [state, setState];
  }),
}));

describe('SearchAndShortlistFilter Component', () => {
  const mockApplyFilters = vi.fn();
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock return values for the API calls
    getAllJobRoles.mockResolvedValue(['Developer', 'Designer']);
    getAllJobLocations.mockResolvedValue(['London', 'Remote']);
    getAllJobTypes.mockResolvedValue(['Full-time', 'Part-time']);
    getAllCompanies.mockResolvedValue(['Tech Co', 'Design Inc']);
    getSalaryBounds.mockResolvedValue({ minSalary: 30000, maxSalary: 100000 });
  });

  test('does not render when isOpen is false', () => {
    render(
      <SearchAndShortlistFilter 
        isOpen={false} 
        onClose={mockOnClose} 
        applyFilters={mockApplyFilters} 
      />
    );
    
    expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
  });

  test('renders correctly when isOpen is true', async () => {
    render(
      <SearchAndShortlistFilter 
        isOpen={true} 
        onClose={mockOnClose} 
        applyFilters={mockApplyFilters} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Titles')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
    expect(screen.getByText('Job Types')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
    expect(screen.getByText('Salary Range')).toBeInTheDocument();
    expect(screen.getByText('Deadlines')).toBeInTheDocument();
  });

  test('closes the filter when close button is clicked', async () => {
    render(
      <SearchAndShortlistFilter 
        isOpen={true} 
        onClose={mockOnClose} 
        applyFilters={mockApplyFilters} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('✕'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls applyFilters with correct data when Apply button is clicked', async () => {
    render(
      <SearchAndShortlistFilter 
        isOpen={true} 
        onClose={mockOnClose} 
        applyFilters={mockApplyFilters} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });
    
    // Wait for checkboxes to appear
    await waitFor(() => {
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });
    
    // Check some filters
    fireEvent.click(screen.getByText('Developer'));
    fireEvent.click(screen.getByText('London'));
    
    // Click Apply
    fireEvent.click(screen.getByText('Apply'));
    
    expect(mockApplyFilters).toHaveBeenCalledTimes(1);
    expect(mockApplyFilters).toHaveBeenCalledWith({
      titles: ['Developer'],
      locations: ['London'],
      jobTypes: expect.any(Array),
      companies: expect.any(Array),
      salaryRange: expect.any(Array),
      deadlineRange: expect.any(Number),
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('toggles selection when a checkbox is clicked', async () => {
    render(
      <SearchAndShortlistFilter 
        isOpen={true} 
        onClose={mockOnClose} 
        applyFilters={mockApplyFilters} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });
    
    const developerLabel = screen.getByText('Developer').closest('label');
    const developerCheckbox = developerLabel.querySelector('input');
    
    // Check the checkbox
    fireEvent.click(developerCheckbox);
    expect(developerCheckbox.checked).toBeTruthy();
    
    // Uncheck the checkbox
    fireEvent.click(developerCheckbox);
    expect(developerCheckbox.checked).toBeFalsy();
  });

  test('handles cancel button correctly', async () => {
    render(
      <SearchAndShortlistFilter 
        isOpen={true} 
        onClose={mockOnClose} 
        applyFilters={mockApplyFilters} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockApplyFilters).not.toHaveBeenCalled();
  });
});
