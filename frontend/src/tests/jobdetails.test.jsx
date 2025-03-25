import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import JobDetailsPage from '../pages/JobDetailsPage'; // Adjust path as needed

vi.mock('../../services/job.service.js', () => ({
    getJobById: vi.fn(),
}));

vi.mock('../../services/application.service.js', () => ({
    getAllUserApplications: vi.fn(),
    applyToJob: vi.fn(),
}));

vi.mock('../../services/shortlist.service.js', () => ({
    getShortlist: vi.fn(),
    addJobToShortlist: vi.fn(),
    removeJobFromShortlist: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useParams: vi.fn(),
    useNavigate: vi.fn(),
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
    FaBuilding: () => <span data-testid="building-icon" />,
    FaMapMarkerAlt: () => <span data-testid="location-icon" />,
    FaMoneyBillWave: () => <span data-testid="salary-icon" />,
    FaBriefcase: () => <span data-testid="employment-icon" />,
    FaUserTie: () => <span data-testid="experience-icon" />,
    FaFileAlt: () => <span data-testid="job-title-icon" />,
    FaListAlt: () => <span data-testid="description-icon" />,
    FaClipboardList: () => <span data-testid="requirements-icon" />,
    FaQuestionCircle: () => <span data-testid="questions-icon" />,
    FaCode: () => <span data-testid="assessment-icon" />,
}));

// Mock WhiteBox component
vi.mock('../../components/WhiteBox', () => ({
    default: ({ children, className }) => (
        <div className={`white-box ${className || ''}`} data-testid="white-box">
            {children}
        </div>
    ),
}));

describe('JobDetailsPage', () => {
    const mockJob = {
        _id: 'job1',
        title: 'Senior Developer',
        company: 'Tech Corp',
        location: 'Remote',
        salaryRange: { min: 60000, max: 90000 },
        employmentType: 'Full-time',
        experienceLevel: 'Senior',
        description: 'Job description text',
        requirements: ['JavaScript', 'React', 'Node.js'],
        deadline: '2023-12-31',
        questions: [],
        assessments: ['Technical test'],
    };

    const mockApplications = [
        { _id: 'app1', job: { _id: 'job1' }, status: 'Applying' },
    ];

    const mockShortlist = {
        jobs: [{ _id: 'job2' }], // Current job not shortlisted initially
    };

    let mockNavigate;
    let mockUseParams;
    let getJobById;
    let getAllUserApplications;
    let applyToJob;
    let getShortlist;
    let addJobToShortlist;
    let removeJobFromShortlist;

    beforeEach(() => {
        vi.clearAllMocks();

        mockNavigate = vi.fn();
        mockUseParams = vi.fn().mockReturnValue({ jobId: 'job1' });

        useNavigate.mockReturnValue(mockNavigate);
        useParams.mockImplementation(mockUseParams);

        // Import mocks after clearing
        getJobById = require('../../services/job.service.js').getJobById;
        getAllUserApplications = require('../../services/application.service.js').getAllUserApplications;
        applyToJob = require('../../services/application.service.js').applyToJob;
        getShortlist = require('../../services/shortlist.service.js').getShortlist;
        addJobToShortlist = require('../../services/shortlist.service.js').addJobToShortlist;
        removeJobFromShortlist = require('../../services/shortlist.service.js').removeJobFromShortlist;

        // Default mock implementations
        getJobById.mockResolvedValue(mockJob);
        getAllUserApplications.mockResolvedValue(mockApplications);
        getShortlist.mockResolvedValue(mockShortlist);
        applyToJob.mockResolvedValue({});
        addJobToShortlist.mockResolvedValue({});
        removeJobFromShortlist.mockResolvedValue({});
    });

    test('renders loading state initially', () => {
        getJobById.mockImplementation(() => new Promise(() => {})); // Never resolves

        render(<JobDetailsPage />);

        expect(screen.getByText('Loading job details...')).toBeInTheDocument();
        expect(screen.queryByText('Job Details')).not.toBeInTheDocument();
    });

    test('displays job details after loading', async () => {
        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('Job Details')).toBeInTheDocument();
            expect(screen.getByText('Senior Developer')).toBeInTheDocument();
            expect(screen.getByText('Tech Corp')).toBeInTheDocument();
            expect(screen.getByText('Remote')).toBeInTheDocument();
            expect(screen.getByText('£60000 - £90000')).toBeInTheDocument();
            expect(screen.getByText('Full-time')).toBeInTheDocument();
            expect(screen.getByText('Senior')).toBeInTheDocument();
            expect(screen.getByText('Job description text')).toBeInTheDocument();
            expect(screen.getByText('JavaScript')).toBeInTheDocument();
            expect(screen.getByText('React')).toBeInTheDocument();
            expect(screen.getByText('Node.js')).toBeInTheDocument();
            expect(screen.getByText('31/12/2023')).toBeInTheDocument();
        });
    });

    test('handles job fetch error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        getJobById.mockRejectedValue(new Error('Fetch failed'));

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching job details:', expect.any(Error));
            expect(screen.getByText('Loading job details...')).toBeInTheDocument();
        });

        consoleSpy.mockRestore();
    });

    test('shows "Apply Now" button when not applied', async () => {
        getAllUserApplications.mockResolvedValue([]); // No applications

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Apply Now' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Continue Application' })).not.toBeInTheDocument();
            expect(screen.queryByText('Application Submitted')).not.toBeInTheDocument();
        });
    });

    test('shows "Continue Application" button when application is in progress', async () => {
        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Continue Application' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Apply Now' })).not.toBeInTheDocument();
        });
    });

    test('shows "Application Submitted" when application is completed', async () => {
        getAllUserApplications.mockResolvedValue([
            { _id: 'app1', job: { _id: 'job1' }, status: 'Submitted' }
        ]);

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('Application Submitted')).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Apply Now' })).not.toBeInTheDocument();
        });
    });

    test('handles apply button click', async () => {
        getAllUserApplications.mockResolvedValue([]);

        render(<JobDetailsPage />);

        await waitFor(() => {
            const applyButton = screen.getByRole('button', { name: 'Apply Now' });
            fireEvent.click(applyButton);

            expect(applyToJob).toHaveBeenCalledWith({
                jobId: 'job1',
                coverLetter: '',
                answers: []
            });
            expect(mockNavigate).toHaveBeenCalledWith('/apply/job1');
        });
    });

    test('shows "Add to Shortlist" when job is not shortlisted', async () => {
        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Add to Shortlist' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Remove from Shortlist' })).not.toBeInTheDocument();
        });
    });

    test('shows "Remove from Shortlist" when job is shortlisted', async () => {
        getShortlist.mockResolvedValue({
            jobs: [{ _id: 'job1' }] // Current job is shortlisted
        });

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Remove from Shortlist' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Add to Shortlist' })).not.toBeInTheDocument();
        });
    });

    test('handles shortlist toggle - add to shortlist', async () => {
        render(<JobDetailsPage />);

        await waitFor(async () => {
            const shortlistButton = screen.getByRole('button', { name: 'Add to Shortlist' });
            fireEvent.click(shortlistButton);

            expect(addJobToShortlist).toHaveBeenCalledWith('job1');
            expect(removeJobFromShortlist).not.toHaveBeenCalled();
        });
    });

    test('handles shortlist toggle - remove from shortlist', async () => {
        getShortlist.mockResolvedValue({
            jobs: [{ _id: 'job1' }] // Current job is shortlisted
        });

        render(<JobDetailsPage />);

        await waitFor(async () => {
            const shortlistButton = screen.getByRole('button', { name: 'Remove from Shortlist' });
            fireEvent.click(shortlistButton);

            expect(removeJobFromShortlist).toHaveBeenCalledWith('job1');
            expect(addJobToShortlist).not.toHaveBeenCalled();
        });
    });

    test('handles shortlist error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        addJobToShortlist.mockRejectedValue(new Error('Shortlist error'));

        render(<JobDetailsPage />);

        await waitFor(async () => {
            const shortlistButton = screen.getByRole('button', { name: 'Add to Shortlist' });
            fireEvent.click(shortlistButton);

            expect(consoleSpy).toHaveBeenCalledWith('Error updating shortlist:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    test('displays "No deadline" when deadline is not set', async () => {
        getJobById.mockResolvedValue({
            ...mockJob,
            deadline: null
        });

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('No deadline')).toBeInTheDocument();
        });
    });

    test('displays correct icons for sections', async () => {
        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByTestId('job-title-icon')).toBeInTheDocument();
            expect(screen.getByTestId('building-icon')).toBeInTheDocument();
            expect(screen.getByTestId('location-icon')).toBeInTheDocument();
            expect(screen.getByTestId('salary-icon')).toBeInTheDocument();
            expect(screen.getByTestId('employment-icon')).toBeInTheDocument();
            expect(screen.getByTestId('experience-icon')).toBeInTheDocument();
            expect(screen.getByTestId('description-icon')).toBeInTheDocument();
            expect(screen.getByTestId('requirements-icon')).toBeInTheDocument();
            expect(screen.getByTestId('questions-icon')).toBeInTheDocument();
            expect(screen.getByTestId('assessment-icon')).toBeInTheDocument();
        });
    });

    test('displays "No requirements needed" when requirements are empty', async () => {
        getJobById.mockResolvedValue({
            ...mockJob,
            requirements: []
        });

        render(<JobDetailsPage />);

        await waitFor(() => {
            expect(screen.getByText('No requirements needed')).toBeInTheDocument();
        });
    });

    test('updates when jobId parameter changes', async () => {
        const { rerender } = render(<JobDetailsPage />);

        await waitFor(() => {
            expect(getJobById).toHaveBeenCalledWith('job1');
        });

        // Change the jobId parameter
        mockUseParams.mockReturnValue({ jobId: 'job2' });
        rerender(<JobDetailsPage />);

        await waitFor(() => {
            expect(getJobById).toHaveBeenCalledWith('job2');
        });
    });
});