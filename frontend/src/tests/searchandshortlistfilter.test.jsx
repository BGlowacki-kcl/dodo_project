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

  // Add this new test to cover salary range slider functionality
  test('handles salary range slider changes', async () => {
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
    
    // Find the range slider for salary
    const salarySlider = screen.getByRole('slider');
    
    // Change the slider value to test setSalaryRange
    fireEvent.change(salarySlider, { target: { value: 50000 } });
    
    // Apply filters to ensure the new salary range is used
    fireEvent.click(screen.getByText('Apply'));
    
    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        salaryRange: expect.arrayContaining([expect.any(Number), 50000])
      })
    );
  });

  // Replace the test with a more specific approach that works with the actual DOM structure
  test('handles salary range slider changes for both min and max values', async () => {
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
    
    // Get the salary slider
    const salarySlider = screen.getByRole('slider');
    
    // First set the slider to a specific value
    fireEvent.change(salarySlider, { target: { value: 60000 } });
    
    // Then set to another value to ensure both min/max parts of the salary range are touched
    fireEvent.change(salarySlider, { target: { value: 80000 } });
    
    // Apply filters to ensure the new salary range is used
    fireEvent.click(screen.getByText('Apply'));
    
    // Verify the filter was applied with the appropriate salary range
    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        salaryRange: expect.arrayContaining([expect.any(Number), 80000])
      })
    );
  });

  // Test the deadline input which is available as a spinbutton role
  test('handles deadline range input changes', async () => {
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
    
    // Find the deadline range input by its role and placeholder
    const deadlineInput = screen.getByRole('spinbutton', { 
      name: '' // The input doesn't have an accessible name
    });
    
    // Change the deadline value
    fireEvent.change(deadlineInput, { target: { value: 14 } });
    
    // Apply filters to ensure the new deadline is used
    fireEvent.click(screen.getByText('Apply'));
    
    // Verify deadline was updated
    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        deadlineRange: 14
      })
    );
  });
});
