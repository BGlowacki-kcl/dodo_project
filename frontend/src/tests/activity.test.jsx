import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ApplicantActivity from '../components/activity'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';

// Mock the application service module without external top-level variables
vi.mock('../services/applicationService', () => {
  const getAllUserApplications = vi.fn();
  return {
    getAllUserApplications,
  };
});

// Mock navigation utilities from react-router-dom
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: vi.fn(),
}));

// Mock the ApplicationCards component to match its real implementation
vi.mock('../components/ApplicationCards', () => ({
  default: ({ applications }) => {
    const navigate = useNavigate();
    const handleCardClick = (app) => {
      if (app.status === 'Applying') {
        navigate(`/apply/${app.job._id}`);
      } else {
        navigate(`/user/applications/${app._id}`);
      }
    };
    return (
      <div data-testid="application-cards">
        {applications && applications.length > 0 ? (
          applications.map((app) => (
            <div
              key={app._id}
              data-testid={`application-${app.job._id}`}
              onClick={() => handleCardClick(app)}
            >
              {app.job._id} - {app.status}
            </div>
          ))
        ) : (
          <div>No applications</div>
        )}
      </div>
    );
  },
}));

// Mock the Pagination component
vi.mock('../components/Pagination', () => ({
  default: ({ pageCount, onPageChange }) => (
    <div data-testid="pagination">
      {pageCount > 1 && (
        <>
          <button onClick={() => onPageChange({ selected: 0 })}>Page 1</button>
          <button onClick={() => onPageChange({ selected: 1 })}>Page 2</button>
          <button onClick={() => onPageChange({ selected: 0 })}>Prev</button>
          <button onClick={() => onPageChange({ selected: 1 })}>Next</button>
        </>
      )}
    </div>
  ),
}));

// Mock the folder icon from react-icons
vi.mock('react-icons/fa', () => ({
  FaFolderOpen: () => <span data-testid="folder-icon" />,
}));

// Mock WhiteBox with className merging
vi.mock('../components/WhiteBox', () => ({
  default: ({ children, className }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${className || ''}`}>{children}</div>
  ),
}));

describe('ApplicantActivity Component', () => {
  const mockUserId = '123';
  const mockApplications = [
    { _id: 'app1', job: { _id: 'job1' }, status: 'Applying' },
    { _id: 'app2', job: { _id: 'job2' }, status: 'Rejected' },
    { _id: 'app3', job: { _id: 'job3' }, status: 'Accepted' },
    { _id: 'app4', job: { _id: 'job4' }, status: 'Rejected' },
    { _id: 'app5', job: { _id: 'job5' }, status: 'Applying' },
    { _id: 'app6', job: { _id: 'job6' }, status: 'Accepted' },
  ];

  let mockNavigate;
  let getAllUserApplications;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    const module = await import('../services/applicationService');
    getAllUserApplications = module.getAllUserApplications;
  });

  test('renders component and fetches applications', async () => {
    getAllUserApplications.mockResolvedValue(mockApplications);

    render(<ApplicantActivity userId={mockUserId} />);

    expect(screen.getByText('Activity')).toBeInTheDocument();

    await waitFor(() => {
      const applicationsSentSection = screen.getByText('Applications Sent').closest('div');
      const rejectionsSection = screen.getByText('Rejections').closest('div');
      const acceptancesSection = screen.getByText('Acceptances').closest('div');

      expect(applicationsSentSection.querySelector('p').textContent).toBe('6');
      expect(rejectionsSection.querySelector('p').textContent).toBe('2');
      expect(acceptancesSection.querySelector('p').textContent).toBe('2');
      expect(screen.getByText('My Applications')).toBeInTheDocument();
      expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
      expect(screen.getByTestId('application-cards')).toBeInTheDocument();
    }, { timeout: 2000 });

    const applicationCards = screen.getByTestId('application-cards');
    expect(applicationCards.children).toHaveLength(5); // itemsPerPage = 5
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getAllUserApplications.mockRejectedValue(new Error('API Error'));

    render(<ApplicantActivity userId={mockUserId} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching applications:', expect.any(Error));
      const applicationsSentSection = screen.getByText('Applications Sent').closest('div');
      const rejectionsSection = screen.getByText('Rejections').closest('div');
      const acceptancesSection = screen.getByText('Acceptances').closest('div');

      expect(applicationsSentSection.querySelector('p').textContent).toBe('0');
      expect(rejectionsSection.querySelector('p').textContent).toBe('0');
      expect(acceptancesSection.querySelector('p').textContent).toBe('0');
      expect(screen.getByText('My Applications')).toBeInTheDocument();
      expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('displays pagination and navigates pages', async () => {
    getAllUserApplications.mockResolvedValue(mockApplications);

    render(<ApplicantActivity userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByTestId('application-job1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /page 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /page 2/i })).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByTestId('application-job1')).toBeInTheDocument();
    expect(screen.queryByTestId('application-job6')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByTestId('application-job6')).toBeInTheDocument();
      expect(screen.queryByTestId('application-job1')).not.toBeInTheDocument();
    });
  });

  test('does not display pagination with 5 or fewer applications', async () => {
    const fewerApplications = mockApplications.slice(0, 5);
    getAllUserApplications.mockResolvedValue(fewerApplications);

    render(<ApplicantActivity userId={mockUserId} />);

    await waitFor(() => {
      const applicationsSentSection = screen.getByText('Applications Sent').closest('div');
      expect(applicationsSentSection.querySelector('p').textContent).toBe('5');

      const applicationCards = screen.getByTestId('application-cards');
      expect(applicationCards.children).toHaveLength(5);

      expect(screen.queryByRole('button', { name: /prev/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /page 1/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /page 2/i })).not.toBeInTheDocument();
    });
  });

  test('navigates to job apply page for "Applying" status', async () => {
    getAllUserApplications.mockResolvedValue(mockApplications);

    render(<ApplicantActivity userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByTestId('application-job1')).toBeInTheDocument();
      expect(screen.getByTestId('application-job2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('application-job1'));
    expect(mockNavigate).toHaveBeenCalledWith('/apply/job1');

    fireEvent.click(screen.getByTestId('application-job2'));
    expect(mockNavigate).toHaveBeenCalledWith('/user/applications/app2');
    expect(mockNavigate).toHaveBeenCalledTimes(2);
  });

  test('re-fetches applications when userId changes', async () => {
    getAllUserApplications.mockResolvedValue(mockApplications);

    const { rerender } = render(<ApplicantActivity userId={mockUserId} />);

    await waitFor(() => {
      expect(getAllUserApplications).toHaveBeenCalledWith(mockUserId);
      expect(getAllUserApplications).toHaveBeenCalledTimes(1);
    });

    const newUserId = '456';
    rerender(<ApplicantActivity userId={newUserId} />);

    await waitFor(() => {
      expect(getAllUserApplications).toHaveBeenCalledWith(newUserId);
      expect(getAllUserApplications).toHaveBeenCalledTimes(2);
    });
  });

  test('handles empty application list correctly', async () => {
    getAllUserApplications.mockResolvedValue([]);

    render(<ApplicantActivity userId={mockUserId} />);

    await waitFor(() => {
      const applicationsSentSection = screen.getByText('Applications Sent').closest('div');
      const rejectionsSection = screen.getByText('Rejections').closest('div');
      const acceptancesSection = screen.getByText('Acceptances').closest('div');

      expect(applicationsSentSection.querySelector('p').textContent).toBe('0');
      expect(rejectionsSection.querySelector('p').textContent).toBe('0');
      expect(acceptancesSection.querySelector('p').textContent).toBe('0');

      expect(screen.queryByRole('button', { name: /prev/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();

      const applicationCards = screen.getByTestId('application-cards');
      expect(applicationCards.children).toHaveLength(1);
      expect(screen.getByText('No applications')).toBeInTheDocument();
    });
  });

  test('renders single application correctly', async () => {
    const singleApplication = [{ _id: 'app1', job: { _id: 'job1' }, status: 'Applying' }];
    getAllUserApplications.mockResolvedValue(singleApplication);

    render(<ApplicantActivity userId={mockUserId} />);

    await waitFor(() => {
      const applicationsSentSection = screen.getByText('Applications Sent').closest('div');
      const rejectionsSection = screen.getByText('Rejections').closest('div');
      const acceptancesSection = screen.getByText('Acceptances').closest('div');

      expect(applicationsSentSection.querySelector('p').textContent).toBe('1');
      expect(rejectionsSection.querySelector('p').textContent).toBe('0');
      expect(acceptancesSection.querySelector('p').textContent).toBe('0');

      const applicationCards = screen.getByTestId('application-cards');
      expect(applicationCards.children).toHaveLength(1);
      expect(screen.getByTestId('application-job1')).toBeInTheDocument();
    });
  });

  test('handles exactly 5 applications without pagination', async () => {
    const exactApplications = mockApplications.slice(0, 5);
    getAllUserApplications.mockResolvedValue(exactApplications);

    render(<ApplicantActivity userId={mockUserId} />);

    await waitFor(() => {
      const applicationsSentSection = screen.getByText('Applications Sent').closest('div');
      expect(applicationsSentSection.querySelector('p').textContent).toBe('5');

      expect(screen.queryByRole('button', { name: /prev/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();

      const applicationCards = screen.getByTestId('application-cards');
      expect(applicationCards.children).toHaveLength(5);
    });
  });

  test('verifies UI class names are applied correctly', async () => {
    getAllUserApplications.mockResolvedValue(mockApplications);

    render(<ApplicantActivity userId={mockUserId} />);

    await waitFor(() => {
      expect(screen.getByText('Activity').className).toBe('text-4xl font-bold mb-8 text-left text-black');
      expect(screen.getByText('Applications Sent').closest('div').className).toBe(
        'bg-blue-100 p-6 shadow rounded flex flex-col items-center justify-center'
      );
      expect(screen.getByText('Rejections').closest('div').className).toBe(
        'bg-red-100 p-6 shadow rounded flex flex-col items-center justify-center'
      );
      expect(screen.getByText('Acceptances').closest('div').className).toBe(
        'bg-green-100 p-6 shadow rounded flex flex-col items-center justify-center'
      );
      expect(screen.getByText('My Applications').closest('div').className).toBe(
        'bg-white p-6 rounded-xl shadow-sm mt-8'
      );
    });
  });
});