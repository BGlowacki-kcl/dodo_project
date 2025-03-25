import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import Apply from '../pages/Apply'; // Adjust path as needed
import { useNotification } from '../../context/notification.context';

// Mock services
vi.mock('../../services/application.service.js', () => ({
    saveApplication: vi.fn(),
    getApplicationById: vi.fn(),
    getAllUserApplications: vi.fn(),
    submitApplication: vi.fn(),
    withdrawApplication: vi.fn(),
}));

vi.mock('../../services/job.service.js', () => ({
    getJobQuestionsById: vi.fn(),
}));

// Mock context and components
vi.mock('../../context/notification.context', () => ({
    useNotification: vi.fn(),
}));

vi.mock('../../components/WhiteBox', () => ({
    default: ({ children }) => <div data-testid="white-box">{children}</div>,
}));

vi.mock('../../components/ModalMessages', () => ({
    default: ({ show, message, onConfirm, onClose }) => (
        show && (
            <div data-testid="modal">
                <p>{message}</p>
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        )
    ),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useParams: vi.fn(),
    useNavigate: vi.fn(),
}));

// Mock react-icons
vi.mock('react-icons/fa', () => ({
    FaFileAlt: () => <span data-testid="file-icon" />,
    FaQuestionCircle: () => <span data-testid="question-icon" />,
}));

describe('Apply Component', () => {
    const mockJobId = 'job123';
    const mockApplicationId = 'app456';
    const mockQuestions = [
        { _id: 'q1', questionText: 'Question 1' },
        { _id: 'q2', questionText: 'Question 2' },
    ];
    const mockExistingApplication = {
        _id: mockApplicationId,
        job: { _id: mockJobId },
        status: 'Applying',
        coverLetter: 'Existing cover letter',
        answers: [
            { questionId: 'q1', answerText: 'Existing answer 1' },
            { questionId: 'q2', answerText: 'Existing answer 2' },
        ],
    };
    const mockUserApplications = [mockExistingApplication];

    let mockNavigate;
    let mockShowNotification;
    let getJobQuestionsById;
    let getAllUserApplications;
    let getApplicationById;
    let saveApplication;
    let submitApplication;
    let withdrawApplication;

    beforeEach(() => {
        vi.clearAllMocks();

        mockNavigate = vi.fn();
        mockShowNotification = vi.fn();

        useParams.mockReturnValue({ jobId: mockJobId });
        useNavigate.mockReturnValue(mockNavigate);
        useNotification.mockReturnValue(mockShowNotification);

        // Import mocks after clearing
        getJobQuestionsById = require('../../services/job.service.js').getJobQuestionsById;
        getAllUserApplications = require('../../services/application.service.js').getAllUserApplications;
        getApplicationById = require('../../services/application.service.js').getApplicationById;
        saveApplication = require('../../services/application.service.js').saveApplication;
        submitApplication = require('../../services/application.service.js').submitApplication;
        withdrawApplication = require('../../services/application.service.js').withdrawApplication;

        // Default mock implementations
        getJobQuestionsById.mockResolvedValue(mockQuestions);
        getAllUserApplications.mockResolvedValue(mockUserApplications);
        getApplicationById.mockResolvedValue(mockExistingApplication);
        saveApplication.mockResolvedValue({});
        submitApplication.mockResolvedValue({});
        withdrawApplication.mockResolvedValue({});
    });

    test('renders loading state initially', () => {
        getJobQuestionsById.mockImplementation(() => new Promise(() => {})); // Never resolves

        render(<Apply />);

        expect(screen.getByText('Loading application details...')).toBeInTheDocument();
    });

    test('displays application form after loading', async () => {
        render(<Apply />);

        await waitFor(() => {
            expect(screen.getByText('Apply for the Job')).toBeInTheDocument();
            expect(screen.getByText('Cover Letter')).toBeInTheDocument();
            expect(screen.getByText('Questions')).toBeInTheDocument();
            expect(screen.getByText('Question 1')).toBeInTheDocument();
            expect(screen.getByText('Existing cover letter')).toBeInTheDocument();
            expect(screen.getByText('Existing answer 1')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Withdraw Application' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Submit Application' })).toBeInTheDocument();
        });
    });

    test('handles cover letter input change', async () => {
        render(<Apply />);

        await waitFor(() => {
            const coverLetterTextarea = screen.getByPlaceholderText('Type your cover letter...');
            fireEvent.change(coverLetterTextarea, { target: { value: 'New cover letter' } });

            expect(coverLetterTextarea.value).toBe('New cover letter');
        });
    });

    test('handles answer input change', async () => {
        render(<Apply />);

        await waitFor(() => {
            const answerTextarea = screen.getByPlaceholderText('Type your answer...');
            fireEvent.change(answerTextarea, { target: { value: 'New answer' } });

            expect(answerTextarea.value).toBe('New answer');
        });
    });

    test('navigates between questions', async () => {
        render(<Apply />);

        await waitFor(() => {
            expect(screen.getByText('Question 1')).toBeInTheDocument();

            const nextButton = screen.getByRole('button', { name: 'Next' });
            fireEvent.click(nextButton);

            expect(screen.getByText('Question 2')).toBeInTheDocument();

            const prevButton = screen.getByRole('button', { name: 'Previous' });
            fireEvent.click(prevButton);

            expect(screen.getByText('Question 1')).toBeInTheDocument();
        });
    });

    test('handles save application', async () => {
        render(<Apply />);

        await waitFor(() => {
            const saveButton = screen.getByRole('button', { name: 'Save' });
            fireEvent.click(saveButton);

            expect(saveApplication).toHaveBeenCalledWith({
                applicationId: mockApplicationId,
                jobId: mockJobId,
                coverLetter: 'Existing cover letter',
                answers: expect.arrayContaining([
                    expect.objectContaining({ questionId: 'q1', answerText: 'Existing answer 1' }),
                    expect.objectContaining({ questionId: 'q2', answerText: 'Existing answer 2' }),
                ]),
            });
            expect(mockShowNotification).toHaveBeenCalledWith('Application saved successfully!', 'success');
        });
    });

    test('handles submit application', async () => {
        render(<Apply />);

        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: 'Submit Application' });
            fireEvent.click(submitButton);

            expect(saveApplication).toHaveBeenCalled();
            expect(submitApplication).toHaveBeenCalledWith(mockApplicationId);
            expect(mockNavigate).toHaveBeenCalledWith(`/user/jobs/details/${mockJobId}`);
            expect(mockShowNotification).toHaveBeenCalledWith('Application submitted successfully!', 'success');
        });
    });

    test('shows error when submitting with unanswered questions', async () => {
        getApplicationById.mockResolvedValue({
            ...mockExistingApplication,
            answers: [],
        });

        render(<Apply />);

        await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: 'Submit Application' });
            fireEvent.click(submitButton);

            expect(mockShowNotification).toHaveBeenCalledWith(
                'Please answer all the questions before submitting.',
                'error'
            );
            expect(submitApplication).not.toHaveBeenCalled();
        });
    });

    test('handles withdraw application', async () => {
        render(<Apply />);

        await waitFor(() => {
            // Open modal
            const withdrawButton = screen.getByRole('button', { name: 'Withdraw Application' });
            fireEvent.click(withdrawButton);

            expect(screen.getByTestId('modal')).toBeInTheDocument();

            // Confirm withdrawal
            const confirmButton = screen.getByRole('button', { name: 'Confirm' });
            fireEvent.click(confirmButton);

            expect(withdrawApplication).toHaveBeenCalledWith(mockApplicationId);
            expect(mockNavigate).toHaveBeenCalledWith(`/user/jobs/details/${mockJobId}`);
            expect(mockShowNotification).toHaveBeenCalledWith('Application withdrawn successfully!', 'success');
        });
    });

    test('handles fetch errors', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        getJobQuestionsById.mockRejectedValue(new Error('Fetch failed'));

        render(<Apply />);

        await waitFor(() => {
            expect(mockShowNotification).toHaveBeenCalledWith(
                'Failed to fetch application details. Please try again.',
                'error'
            );
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    test('displays "No questions" when job has no questions', async () => {
        getJobQuestionsById.mockResolvedValue([]);

        render(<Apply />);

        await waitFor(() => {
            expect(screen.getByText('No questions for this job.')).toBeInTheDocument();
        });
    });

    test('handles new application creation', async () => {
        getAllUserApplications.mockResolvedValue([]); // No existing application

        render(<Apply />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Type your cover letter...').value).toBe('');
            expect(screen.getByPlaceholderText('Type your answer...').value).toBe('');
        });
    });

    test('disables previous button on first question', async () => {
        render(<Apply />);

        await waitFor(() => {
            const prevButton = screen.getByRole('button', { name: 'Previous' });
            expect(prevButton).toBeDisabled();
        });
    });

    test('disables next button on last question', async () => {
        render(<Apply />);

        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: 'Next' });
            fireEvent.click(nextButton); // Go to last question

            expect(nextButton).toBeDisabled();
        });
    });
});