import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import JobDetailsPage from '../pages/user/JobDetailsPage';
import { getJobById } from '../services/job.service';
import { getAllUserApplications, applyToJob } from '../services/application.service';
import { getShortlist, addJobToShortlist, removeJobFromShortlist } from '../services/shortlist.service';
import { vi } from 'vitest';

vi.mock('../services/job.service', () => ({
    getJobById: vi.fn()
}));

vi.mock('../services/application.service', () => ({
    getAllUserApplications: vi.fn(),
    applyToJob: vi.fn()
}));

vi.mock('../services/shortlist.service', () => ({
    getShortlist: vi.fn(),
    addJobToShortlist: vi.fn(),
    removeJobFromShortlist: vi.fn()
}));

vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useParams: vi.fn(),
    useNavigate: vi.fn()
}));

vi.mock('../components/JobDetailsContent', () => ({
    default: ({ job }) => <div data-testid="job-details-content">{job.title}</div>
}));

vi.mock('../components/DeadlineBadge', () => ({
    default: ({ deadline }) => <div data-testid="deadline-badge">{deadline}</div>
}));

describe('JobDetailsPage', () => {
    const mockJobId = 'job123';
    const mockJob = {
        _id: mockJobId,
        title: 'Software Engineer',
        deadline: '2025-04-01',
    };

    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock sessionStorage.getItem to return a fake token
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: vi.fn((key) => key === 'token' ? 'fake-token' : null),
                setItem: vi.fn(),
                removeItem: vi.fn()
            },
            writable: true
        });
        
        useParams.mockReturnValue({ jobId: mockJobId });
        useNavigate.mockReturnValue(mockNavigate);
        getJobById.mockResolvedValue(mockJob);
        getAllUserApplications.mockResolvedValue([]);
        getShortlist.mockResolvedValue({ jobs: [] });
    });

    it('shows loading state initially', () => {
        getJobById.mockReturnValue(new Promise(() => {}));
        render(<JobDetailsPage />);

        expect(screen.getByText('Loading job details...')).toBeInTheDocument();
    });

    it('displays job details after loading', async () => {
        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('Job Details')).toBeInTheDocument();
            expect(screen.getByTestId('job-details-content')).toHaveTextContent(mockJob.title);
            expect(screen.getByTestId('deadline-badge')).toHaveTextContent(mockJob.deadline);
        });
    });

    it('handles error when fetching job details fails', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        getJobById.mockRejectedValue(new Error('Failed to fetch job'));

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching data:', expect.any(Error));
        });

        consoleErrorSpy.mockRestore();
    });

    it('displays "Apply Now" button when user has not applied', async () => {
        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('Apply Now')).toBeInTheDocument();
        });
    });

    it('displays "Continue Application" button when application is in progress', async () => {
        getAllUserApplications.mockResolvedValue([{
            job: { _id: mockJobId },
            status: 'Applying'
        }]);

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('Continue Application')).toBeInTheDocument();
        });
    });

    it('displays "Application Submitted" when application is complete', async () => {
        getAllUserApplications.mockResolvedValue([{
            job: { _id: mockJobId },
            status: 'Submitted'
        }]);

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('Application Submitted')).toBeInTheDocument();
        });
    });

    it('displays "Add to Shortlist" button when job is not shortlisted', async () => {
        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('Add to Shortlist')).toBeInTheDocument();
        });
    });

    it('displays "Remove from Shortlist" button when job is shortlisted', async () => {
        getShortlist.mockResolvedValue({ jobs: [{ _id: mockJobId }] });

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('Remove from Shortlist')).toBeInTheDocument();
        });
    });

    it('calls applyToJob and navigates when "Apply Now" is clicked', async () => {
        render(<JobDetailsPage />);

        await waitFor(() => {
            fireEvent.click(screen.getByText('Apply Now'));
        });

        expect(applyToJob).toHaveBeenCalledWith({
            jobId: mockJobId,
            coverLetter: "",
            answers: []
        });
        expect(mockNavigate).toHaveBeenCalledWith(`/apply/${mockJobId}`);
    });

    it('navigates to application page when "Continue Application" is clicked', async () => {
        // Set up application state for this test
        getAllUserApplications.mockResolvedValue([{
            job: { _id: mockJobId },
            status: 'Applying'
        }]);

        render(<JobDetailsPage />);

        // Wait for component to render and use a more flexible approach to find the button
        await waitFor(() => {
            const continueButton = screen.getByRole('button', { 
                name: /continue application/i 
            });
            fireEvent.click(continueButton);
        });

        expect(mockNavigate).toHaveBeenCalledWith(`/apply/${mockJobId}`);
    });

    it('adds job to shortlist when "Add to Shortlist" is clicked', async () => {
        render(<JobDetailsPage />);

        await waitFor(() => {
            const shortlistButton = screen.getByRole('button', { 
                name: /add to shortlist/i 
            });
            fireEvent.click(shortlistButton);
        });

        expect(addJobToShortlist).toHaveBeenCalledWith(mockJobId);
    });

    it('removes job from shortlist when "Remove from Shortlist" is clicked', async () => {
        // Setup shortlisted state
        getShortlist.mockResolvedValue({ jobs: [{ _id: mockJobId }] });

        render(<JobDetailsPage />);

        await waitFor(() => {
            const removeButton = screen.getByRole('button', { 
                name: /remove from shortlist/i 
            });
            fireEvent.click(removeButton);
        });

        expect(removeJobFromShortlist).toHaveBeenCalledWith(mockJobId);
    });

    it('handles errors when shortlist toggle fails', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        addJobToShortlist.mockRejectedValue(new Error('Shortlist error'));

        render(<JobDetailsPage />);

        await waitFor(() => {
            const shortlistButton = screen.getByRole('button', { 
                name: /add to shortlist/i 
            });
            fireEvent.click(shortlistButton);
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating shortlist:', expect.any(Error));
        consoleErrorSpy.mockRestore();
    });

    it('handles errors when applying fails', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        applyToJob.mockRejectedValue(new Error('Application error'));

        render(<JobDetailsPage />);

        await waitFor(() => {
            const applyButton = screen.getByRole('button', { 
                name: /apply now/i 
            });
            fireEvent.click(applyButton);
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error applying to job:', expect.any(Error));
        consoleErrorSpy.mockRestore();
    });
});