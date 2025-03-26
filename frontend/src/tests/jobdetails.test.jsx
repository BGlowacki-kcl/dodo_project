import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import JobDetailsPage from '../pages/user/JobDetailsPage.jsx'; // Removed .jsx extension
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

    // ... rest of the tests remain the same ...
});