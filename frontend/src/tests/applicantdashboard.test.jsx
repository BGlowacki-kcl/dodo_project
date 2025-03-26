import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import ApplicantDashboard from "../pages/applicant/ApplicantDashboard";
import { authService } from "../services/auth.service";
import useLocalStorage from "../hooks/useLocalStorage";
import { vi } from "vitest";

// Mock hooks first
vi.mock("../hooks/useLocalStorage", () => ({
    default: vi.fn(() => ["activity", vi.fn()]),
}));

// Mock components
vi.mock("../components/Activity", () => ({
    default: () => <div data-testid="activity-component">Activity Component</div>,
}));

vi.mock("../components/Shortlist", () => ({
    default: () => <div data-testid="shortlist-component">Shortlist Component</div>,
}));

vi.mock("../components/Profile", () => ({
    default: () => <div data-testid="profile-component">Profile Component</div>,
}));

// Mock ModalMessages component
vi.mock("../components/ModalMessages", () => ({
    default: ({ show, message, onConfirm, onClose }) =>
        show && (
            <div data-testid="logout-modal">
                <p>{message}</p>
                <button onClick={onConfirm}>Confirm Logout</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        ),
}));

// Mock services
vi.mock("../services/auth.service", () => ({
    authService: {
        signOut: vi.fn(),
    },
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
    ...vi.importActual("react-router-dom"),
    useNavigate: vi.fn(),
}));

describe("ApplicantDashboard", () => {
    const mockNavigate = vi.fn();
    const mockSetActiveView = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Properly mock useLocalStorage
        useLocalStorage.mockImplementation(() => ["activity", mockSetActiveView]);

        // Mock useNavigate
        useNavigate.mockImplementation(() => mockNavigate);

        // Mock auth service
        authService.signOut.mockResolvedValue({});
    });

    it("renders the sidebar with navigation buttons", () => {
        render(<ApplicantDashboard />);
        expect(screen.getByText("Activity")).toBeInTheDocument();
        expect(screen.getByText("Job Shortlist")).toBeInTheDocument();
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("displays the Activity view by default", () => {
        render(<ApplicantDashboard />);
        expect(screen.getByTestId("activity-component")).toBeInTheDocument();
        expect(screen.queryByTestId("shortlist-component")).not.toBeInTheDocument();
        expect(screen.queryByTestId("profile-component")).not.toBeInTheDocument();
    });

    it("switches to Shortlist view when clicked", () => {
        render(<ApplicantDashboard />);
        fireEvent.click(screen.getByText("Job Shortlist"));
        expect(mockSetActiveView).toHaveBeenCalledWith("shortlist");
    });

    it("switches to Profile view when clicked", () => {
        render(<ApplicantDashboard />);
        fireEvent.click(screen.getByText("Profile"));
        expect(mockSetActiveView).toHaveBeenCalledWith("profile");
    });

    it("opens logout confirmation modal when logout is clicked", () => {
        render(<ApplicantDashboard />);
        fireEvent.click(screen.getByText("Logout"));
        expect(screen.getByTestId("logout-modal")).toBeInTheDocument();
        expect(screen.getByText("Are you sure you want to log out?")).toBeInTheDocument();
    });

    it("closes logout modal when cancel is clicked", () => {
        render(<ApplicantDashboard />);
        fireEvent.click(screen.getByText("Logout"));
        fireEvent.click(screen.getByText("Cancel"));
        expect(screen.queryByTestId("logout-modal")).not.toBeInTheDocument();
    });

    it("calls signOut and navigates to home when logout is confirmed", async () => {
        render(<ApplicantDashboard />);
        fireEvent.click(screen.getByText("Logout"));
        fireEvent.click(screen.getByText("Confirm Logout"));
        await waitFor(() => {
            expect(authService.signOut).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    it("highlights the active view in the sidebar", () => {
        useLocalStorage.mockImplementation(() => ["activity", mockSetActiveView]);
        const { rerender } = render(<ApplicantDashboard />);

        // Check the button element directly for the class
        expect(screen.getByText("Activity").closest('button')).toHaveClass("bg-[#324A5F]");

        useLocalStorage.mockImplementation(() => ["shortlist", mockSetActiveView]);
        rerender(<ApplicantDashboard />);
        expect(screen.getByText("Job Shortlist").closest('button')).toHaveClass("bg-[#324A5F]");
    });

    it("displays Shortlist component when activeView is shortlist", () => {
        useLocalStorage.mockImplementation(() => ["shortlist", mockSetActiveView]);
        render(<ApplicantDashboard />);
        expect(screen.getByTestId("shortlist-component")).toBeInTheDocument();
        expect(screen.queryByTestId("activity-component")).not.toBeInTheDocument();
    });

    it("displays Profile component when activeView is profile", () => {
        useLocalStorage.mockImplementation(() => ["profile", mockSetActiveView]);
        render(<ApplicantDashboard />);
        expect(screen.getByTestId("profile-component")).toBeInTheDocument();
        expect(screen.queryByTestId("activity-component")).not.toBeInTheDocument();
    });
});