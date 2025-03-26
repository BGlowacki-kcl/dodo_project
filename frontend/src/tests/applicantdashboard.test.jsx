import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import ApplicantDashboard from "../pages/applicant/ApplicantDashboard";
import { authService } from "../services/auth.service";
import { vi } from "vitest";

// Inline the useLocalStorage mock factory to avoid referencing a variable
vi.mock("../hooks/useLocalStorage", () => ({
    default: vi.fn(() => ["activity", vi.fn()]),
}));

// Mock child components
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

// Adjust mocks for services
vi.mock("../services/auth.service", () => ({
    authService: {
        signOut: vi.fn(),
    },
}));

// Mock react-router-dom hooks
vi.mock("react-router-dom", () => ({
    ...vi.importActual("react-router-dom"),
    useNavigate: vi.fn(),
}));

describe("ApplicantDashboard", () => {
    const mockNavigate = vi.fn();
    const mockSetActiveView = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Ensure our useLocalStorage returns "activity" and the setter we can spy on.
        // The imported useLocalStorage is our mocked function.
        const { default: useLocalStorage } = require("../hooks/useLocalStorage");
        useLocalStorage.mockReturnValue(["activity", mockSetActiveView]);

        const { useNavigate } = require("react-router-dom");
        useNavigate.mockReturnValue(mockNavigate);
        authService.signOut.mockResolvedValue({});
    });

    it("renders the sidebar with navigation buttons", () => {
        render(<ApplicantDashboard />);
        expect(screen.getByText("Activity")).toBeInTheDocument();
        expect(screen.getByText("Job Shortlist")).toBeInTheDocument();
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("displays the Activity view by default", async () => {
        render(<ApplicantDashboard />);
        await waitFor(() => {
            // Since our useLocalStorage mock returns "activity", we expect ApplicantActivity to render.
            expect(screen.getByTestId("activity-component")).toBeInTheDocument();
        });
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
        // Open modal
        fireEvent.click(screen.getByText("Logout"));
        // Close modal
        fireEvent.click(screen.getByText("Cancel"));
        expect(screen.queryByTestId("logout-modal")).not.toBeInTheDocument();
    });

    it("calls signOut and navigates to home when logout is confirmed", async () => {
        render(<ApplicantDashboard />);
        // Open modal
        fireEvent.click(screen.getByText("Logout"));
        // Confirm logout
        fireEvent.click(screen.getByText("Confirm Logout"));
        await waitFor(() => {
            expect(authService.signOut).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    it("highlights the active view in the sidebar", () => {
        const { default: useLocalStorage } = require("../hooks/useLocalStorage");
        useLocalStorage.mockReturnValue(["activity", mockSetActiveView]);
        const { rerender } = render(<ApplicantDashboard />);
        expect(screen.getByText("Activity").parentElement).toHaveClass("bg-[#324A5F]");
        useLocalStorage.mockReturnValue(["shortlist", mockSetActiveView]);
        rerender(<ApplicantDashboard />);
        expect(screen.getByText("Job Shortlist").parentElement).toHaveClass("bg-[#324A5F]");
    });

    it("displays Shortlist component when activeView is shortlist", () => {
        const { default: useLocalStorage } = require("../hooks/useLocalStorage");
        useLocalStorage.mockReturnValue(["shortlist", mockSetActiveView]);
        render(<ApplicantDashboard />);
        expect(screen.getByTestId("shortlist-component")).toBeInTheDocument();
        expect(screen.queryByTestId("activity-component")).not.toBeInTheDocument();
    });

    it("displays Profile component when activeView is profile", () => {
        const { default: useLocalStorage } = require("../hooks/useLocalStorage");
        useLocalStorage.mockReturnValue(["profile", mockSetActiveView]);
        render(<ApplicantDashboard />);
        expect(screen.getByTestId("profile-component")).toBeInTheDocument();
        expect(screen.queryByTestId("activity-component")).not.toBeInTheDocument();
    });
});
