import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import EmployerDashboard from '../pages/employer/EmployerDashboard';
import { getApplicationsData } from '../services/application.service';


// Mock services
vi.mock('../services/application.service', () => ({
  getApplicationsData: vi.fn(),
}));

// Mock components
vi.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

vi.mock('../components/WhiteBox', () => ({
  default: ({ children }) => <div data-testid="white-box">{children}</div>,
}));

vi.mock('../components/StatBox', () => ({
  default: ({ title, value }) => (
    <div data-testid="stat-box">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  ),
}));

describe('EmployerDashboard', () => {
  const mockDashboardData = {
    totalJobs: 5,
    totalStatus: [
      { _id: 'Accepted', count: 10 },
      { _id: 'Rejected', count: 5 },
      { _id: 'Submitted', count: 15 },
    ],
    companyName: 'TechCorp',
    jobs: [
      { _id: '1', title: 'Software Engineer' },
      { _id: '2', title: 'UX Designer' },
    ],
    lineGraphData: [
      { jobId: '1', date: '2025-03-01', count: 5 },
      { jobId: '1', date: '2025-03-02', count: 10 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getApplicationsData.mockResolvedValue(mockDashboardData);
  });

  test('renders the EmployerDashboard with fetched data', async () => {
    render(<EmployerDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Welcome back, TechCorp!')).toBeInTheDocument();
    });

    // Verify statistics
    expect(screen.getByText('Acceptance Percentage')).toBeInTheDocument();
    expect(screen.getByText('Pending Applications')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Pending applications
    expect(screen.getByText('Engagement Percentage')).toBeInTheDocument();
    expect(screen.getByText('6.00%')).toBeInTheDocument(); // Engagement percentage
    expect(screen.getByText('Total Job Posts')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Total job posts

    // Verify charts
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  

  test('displays an error message when data fetching fails', async () => {
    // Mock the service to reject with an error
    getApplicationsData.mockRejectedValue(new Error('Failed to fetch dashboard data'));
  
    render(<EmployerDashboard />);
  
    // Wait for the error message to appear in the DOM
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch dashboard data')).toBeInTheDocument();
    });
  
    // Retrieve all elements with the `data-testid="white-box"`
    const errorBoxes = screen.getAllByTestId('white-box');
  
    // Find the one containing the error message
    const errorBox = errorBoxes.find((box) =>
      within(box).queryByText('Failed to fetch dashboard data')
    );
  
    // Verify that the error message is displayed inside the correct white box
    expect(errorBox).toBeInTheDocument();
    expect(errorBox).toHaveTextContent('Failed to fetch dashboard data');
  });

  test('renders statistics correctly', async () => {
    render(<EmployerDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Welcome back, TechCorp!')).toBeInTheDocument();
    });

    // Verify statistics
    expect(screen.getByText('Acceptance Percentage')).toBeInTheDocument();
    expect(screen.getByText('33.33%')).toBeInTheDocument(); // Acceptance percentage
    expect(screen.getByText('Pending Applications')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Pending applications
    expect(screen.getByText('Engagement Percentage')).toBeInTheDocument();
    expect(screen.getByText('6.00%')).toBeInTheDocument(); // Engagement percentage
    expect(screen.getByText('Total Job Posts')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Total job posts
  });
});