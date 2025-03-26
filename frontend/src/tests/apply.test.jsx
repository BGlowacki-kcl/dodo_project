import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import Apply from '../pages/applicant/Apply';
import {
    saveApplication,
    getApplicationById,
    getAllUserApplications,
    submitApplication,
    withdrawApplication
} from '../services/application.service';
import { getJobQuestionsById } from '../services/job.service';
import { useNotification } from '../context/notification.context';
import { vi } from 'vitest';

const mockShowNotification = vi.fn();
vi.mock("../context/notification.context", () => ({
    useNotification: () => mockShowNotification,
}));

vi.mock("../services/application.service", () => ({
    saveApplication: vi.fn(),
    getApplicationById: vi.fn(),
    getAllUserApplications: vi.fn(),
    submitApplication: vi.fn(),
    withdrawApplication: vi.fn(),
}));

vi.mock("../services/job.service", () => ({
    getJobQuestionsById: vi.fn(),
}));

vi.mock("../components/WhiteBox", () => ({
    default: ({ children }) => <div>{children}</div>
}));

vi.mock("../components/ModalMessages", () => ({
    default: ({ show, message, onConfirm, onClose }) =>
        show && (
            <div data-testid="withdraw-modal">
                <p>{message}</p>
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        )
}));

vi.mock("react-icons/fa", () => ({
    FaFileAlt: () => <span data-testid="file-icon" />,
    FaQuestionCircle: () => <span data-testid="question-icon" />,
}));

vi.mock("react-router-dom", () => ({
    ...vi.importActual("react-router-dom"),
    useParams: vi.fn(),
    useNavigate: vi.fn(),
}));

describe('Apply Component', () => {
    const mockJobId = 'job123';
    const mockApplicationId = 'app456';
    const mockQuestions = [
        { _id: 'q1', questionText: 'Question 1' },
        { _id: 'q2', questionText: 'Question 2' }
    ];
    const mockExistingApplication = {
        _id: mockApplicationId,
        job: { _id: mockJobId },
        status: 'Applying',
        coverLetter: 'Existing cover letter',
        answers: [
            { questionId: 'q1', answerText: 'Existing answer 1' },
            { questionId: 'q2', answerText: 'Existing answer 2' }
        ]
    };

    let mockNavigate;

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate = vi.fn();

        useParams.mockReturnValue({ jobId: mockJobId });
        useNavigate.mockReturnValue(mockNavigate);
        // Our useNotification mock returns mockShowNotification

        getJobQuestionsById.mockResolvedValue(mockQuestions);
        getAllUserApplications.mockResolvedValue([mockExistingApplication]);
        getApplicationById.mockResolvedValue(mockExistingApplication);
        saveApplication.mockResolvedValue({});
        submitApplication.mockResolvedValue({});
        withdrawApplication.mockResolvedValue({});
    });

    it('shows loading state initially', () => {
        getJobQuestionsById.mockReturnValue(new Promise(() => {}));
        render(<Apply />);
        expect(screen.getByText('Loading application details...')).toBeInTheDocument();
    });

    it('displays application form after loading', async () => {
        render(<Apply />);
        await waitFor(() => {
            expect(screen.getByText('Apply for the Job')).toBeInTheDocument();
            expect(screen.getByText('Cover Letter')).toBeInTheDocument();
            expect(screen.getByText('Questions')).toBeInTheDocument();
            expect(screen.getByText('Question 1')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Existing cover letter')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Existing answer 1')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Withdraw Application' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Submit Application' })).toBeInTheDocument();
        });
    });

    it('handles cover letter input change', async () => {
        render(<Apply />);
        await waitFor(() => {
            const coverLetterTextarea = screen.getByPlaceholderText('Type your cover letter...');
            fireEvent.change(coverLetterTextarea, { target: { value: 'New cover letter' } });
            expect(coverLetterTextarea.value).toBe('New cover letter');
        });
    });

    it('handles answer input change', async () => {
        render(<Apply />);
        await waitFor(() => {
            const answerTextarea = screen.getByPlaceholderText('Type your answer...');
            fireEvent.change(answerTextarea, { target: { value: 'New answer' } });
            expect(answerTextarea.value).toBe('New answer');
        });
    });

    it('navigates between questions', async () => {
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

    it('handles save application', async () => {
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
                    expect.objectContaining({ questionId: 'q2', answerText: 'Existing answer 2' })
                ]),
            });
            expect(mockShowNotification).toHaveBeenCalledWith('Application saved successfully!', 'success');
        });
    });

    it('handles submit application', async () => {
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

    it('shows error when submitting with unanswered questions', async () => {
        getApplicationById.mockResolvedValue({
            ...mockExistingApplication,
            answers: []
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

    it('handles withdraw application', async () => {
        render(<Apply />);
        await waitFor(() => {
            const withdrawButton = screen.getByRole('button', { name: 'Withdraw Application' });
            fireEvent.click(withdrawButton);
            expect(screen.getByTestId('withdraw-modal')).toBeInTheDocument();
            const confirmButton = screen.getByText('Confirm');
            fireEvent.click(confirmButton);
            expect(withdrawApplication).toHaveBeenCalledWith(mockApplicationId);
            expect(mockNavigate).toHaveBeenCalledWith(`/user/jobs/details/${mockJobId}`);
            expect(mockShowNotification).toHaveBeenCalledWith('Application withdrawn successfully!', 'success');
        });
    });

    it('displays "No questions" when job has no questions', async () => {
        getJobQuestionsById.mockResolvedValue([]);
        render(<Apply />);
        await waitFor(() => {
            expect(screen.getByText('No questions for this job.')).toBeInTheDocument();
        });
    });

    it('disables previous button on first question', async () => {
        render(<Apply />);
        await waitFor(() => {
            const prevButton = screen.getByRole('button', { name: 'Previous' });
            expect(prevButton).toBeDisabled();
        });
    });

    it('disables next button on last question', async () => {
        render(<Apply />);
        await waitFor(() => {
            const nextButton = screen.getByRole('button', { name: 'Next' });
            fireEvent.click(nextButton);
            expect(nextButton).toBeDisabled();
        });
    });
});
