import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import ApplicantDashboard from '../pages/ApplicantDashboard';
import ApplicantActivity from '../../components/Activity';
import ApplicantShortlist from '../../components/Shortlist';
import ApplicantProfile from '../../components/Profile';
import ModalMessages from '../../components/ModalMessages';
import { authService } from '../../services/auth.service';
import useLocalStorage from '../../hooks/useLocalStorage';

vi.mock('../../components/Activity', () => ({
    default: () => <div data-testid="activity-component">Activity Component</div>,
}));

vi.mock('../../components/Shortlist', () => ({
    default: () => <div data-testid="shortlist-component">Shortlist Component</div>,
}));

vi.mock('../../components/Profile', () => ({
    default: () => <div data-testid="profile-component">Profile Component</div>,
}));

// Mock ModalMessages
vi.mock('../../components/ModalMessages', () => ({
    default: ({ show, message, onConfirm, onClose }) =>
        show && (
            <div data-testid="modal">
                <p>{message}</p>
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        ),
}));

// Mock services and hooks
vi.mock('../../services/auth.service', () => ({
    authService: {
        signOut: vi.fn(),
    },
}));

vi.mock('../../hooks/useLocalStorage', () => ({
    default: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: vi.fn(),
}));

describe('ApplicantDashboard', () => {
    const mockNavigate = vi.fn();
    const mockSetActiveView = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useLocalStorage.mockReturnValue(['activity', mockSetActiveView]);
        authService.signOut.mockResolvedValue({});
    });

    test('renders sidebar with navigation buttons', () => {
        render(<ApplicantDashboard />);

        expect(screen.getByText('Activity')).toBeInTheDocument();
        expect(screen.getByText('Job Shortlist')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('highlights active view in sidebar', () => {
        useLocalStorage.mockReturnValue(['activity', mockSetActiveView]);
        render(<ApplicantDashboard />);

        const activityButton = screen.getByText('Activity');
        expect(activityButton).toHaveClass('bg-[#324A5F]');
        expect(activityButton).toHaveClass('text-white');
    });

    test('renders Activity component by default', () => {
        useLocalStorage.mockReturnValue(['activity', mockSetActiveView]);
        render(<ApplicantDashboard />);

        expect(screen.getByTestId('activity-component')).toBeInTheDocument();
        expect(screen.queryByTestId('shortlist-component')).not.toBeInTheDocument();
        expect(screen.queryByTestId('profile-component')).not.toBeInTheDocument();
    });

    test('switches to Shortlist view when button clicked', () => {
        render(<ApplicantDashboard />);

        const shortlistButton = screen.getByText('Job Shortlist');
        fireEvent.click(shortlistButton);

        expect(mockSetActiveView).toHaveBeenCalledWith('shortlist');
    });

    test('switches to Profile view when button clicked', () => {
        render(<ApplicantDashboard />);

        const profileButton = screen.getByText('Profile');
        fireEvent.click(profileButton);

        expect(mockSetActiveView).toHaveBeenCalledWith('profile');
    });

    test('opens logout confirmation modal', () => {
        render(<ApplicantDashboard />);

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to log out?')).toBeInTheDocument();
    });

    test('closes modal when cancel is clicked', () => {
        render(<ApplicantDashboard />);

        // Open modal
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        // Close modal
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    test('handles logout confirmation', async () => {
        render(<ApplicantDashboard />);

        // Open modal
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        // Confirm logout
        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        expect(authService.signOut).toHaveBeenCalled();
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('renders Shortlist component when activeView is shortlist', () => {
        useLocalStorage.mockReturnValue(['shortlist', mockSetActiveView]);
        render(<ApplicantDashboard />);

        expect(screen.getByTestId('shortlist-component')).toBeInTheDocument();
        expect(screen.queryByTestId('activity-component')).not.toBeInTheDocument();
    });

    test('renders Profile component when activeView is profile', () => {
        useLocalStorage.mockReturnValue(['profile', mockSetActiveView]);
        render(<ApplicantDashboard />);

        expect(screen.getByTestId('profile-component')).toBeInTheDocument();
        expect(screen.queryByTestId('activity-component')).not.toBeInTheDocument();
    });

    test('handles logout error gracefully', async () => {
        authService.signOut.mockRejectedValue(new Error('Logout failed'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(<ApplicantDashboard />);

        // Open modal
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        // Confirm logout
        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(authService.signOut).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        });

        consoleSpy.mockRestore();
    });
});