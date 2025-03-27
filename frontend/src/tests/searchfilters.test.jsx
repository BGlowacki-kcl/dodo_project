import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SearchFilters from '../components/SearchFilters';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    search: '?jobType=Full-time&role=Developer&location=London',
  }),
}));

vi.mock('../services/job.service.js', () => ({
  getAllJobRoles: vi.fn().mockResolvedValue(['Developer', 'Designer', 'Manager']),
  getAllJobLocations: vi.fn().mockResolvedValue(['London', 'New York', 'Remote']),
  getAllJobTypes: vi.fn().mockResolvedValue(['Full-time', 'Part-time', 'Contract']),
  getAllCompanies: vi.fn().mockResolvedValue(['TechCo', 'DesignStudio', 'Startup Inc']),
}));

describe('SearchFilters Component', () => {
  const mockApplyFilters = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filter sections', async () => {
    render(<SearchFilters applyFilters={mockApplyFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('Job Type')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });
  });

  it('does not render company filter when hideCompanyFilter is true', async () => {
    render(<SearchFilters applyFilters={mockApplyFilters} hideCompanyFilter={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Job Type')).toBeInTheDocument();
      expect(screen.queryByText('Company')).not.toBeInTheDocument();
    });
  });

  it('opens dropdown when title is clicked', async () => {
    render(<SearchFilters applyFilters={mockApplyFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('Job Type')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Job Type'));
    
    expect(screen.getByPlaceholderText('Search job type...')).toBeInTheDocument();
  });

  it('filters dropdown options when searching', async () => {
    render(<SearchFilters applyFilters={mockApplyFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('Job Type')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Job Type'));
    
    const searchInput = screen.getByPlaceholderText('Search job type...');
    fireEvent.change(searchInput, { target: { value: 'Full' } });
    
    await waitFor(() => {
      // Only Full-time should be visible, Part-time should be filtered out
      const labels = screen.getAllByRole('checkbox');
      expect(labels.length).toBe(1);
    });
  });

  it('calls applyFilters with selected options when button is clicked', async () => {
    render(<SearchFilters applyFilters={mockApplyFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Apply Filters'));
    
    expect(mockApplyFilters).toHaveBeenCalledWith(
      ['Full-time'], // From URL params
      ['Developer'], // From URL params
      ['London'],    // From URL params
      []             // No company param in URL
    );
  });

  it('toggles checkbox selection', async () => {
    render(<SearchFilters applyFilters={mockApplyFilters} />);
    
    await waitFor(() => {
      expect(screen.getByText('Job Type')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Job Type'));
    
    // Find checkboxes and toggle
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Select Part-time
    
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Should include both Full-time (from URL) and Part-time (newly selected)
    expect(mockApplyFilters).toHaveBeenCalledWith(
      expect.arrayContaining(['Full-time', 'Part-time']),
      ['Developer'],
      ['London'],
      []
    );
  });
});
