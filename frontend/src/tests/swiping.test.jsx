import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Swiping from "../pages/applicant/Swiping.jsx";
import { getRecommendedJobs } from "../services/matcher.service";
import { addJobToShortlist, getShortlist } from "../services/shortlist.service";
import { vi } from "vitest";
import { onAuthStateChanged, getAuth } from "firebase/auth";

// Mock dependencies
vi.mock("../services/auth.service", () => ({
    checkTokenExpiration: vi.fn(),
}));

vi.mock("../services/helper.js", () => ({
    checkAuth: vi.fn().mockResolvedValue(true),
}));

vi.mock("firebase/auth", async () => {
    const actual = await vi.importActual("firebase/auth");
    return {
        ...actual,
        onAuthStateChanged: vi.fn(),
        getAuth: vi.fn(() => ({})),
    };
});

vi.mock("firebase/app", () => ({
    initializeApp: vi.fn(),
    getApps: () => [],
    getApp: () => ({}),
}));

vi.mock("../services/matcher.service", () => ({
    getRecommendedJobs: vi.fn(),
}));

vi.mock("../services/shortlist.service", () => ({
    getShortlist: vi.fn(),
    addJobToShortlist: vi.fn(),
}));

vi.mock("../../components/SwipeBox", () => ({
    default: ({ title, onSwipe, onShortlist, jobId }) => (
        <div data-testid="swipebox">
            <h3>{title}</h3>
            <button
                className="skip-btn"
                onClick={() => onSwipe()}
            >
                ❌ Skip
            </button>
            <button
                className="shortlist-btn"
                onClick={() => onShortlist(jobId)}
            >
                ✅ Shortlist
            </button>
        </div>
    ),
}));

describe("Swiping Page", () => {
    const mockJobs = [
        { _id: "job1", title: "Software Engineer" },
        { _id: "job2", title: "Data Scientist" },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        getShortlist.mockResolvedValue({ jobs: [] });
        getRecommendedJobs.mockResolvedValue(mockJobs);
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
            callback({ uid: "testUser" });
            return () => {};
        });
    });

    it("shows loading state initially", () => {
        getRecommendedJobs.mockReturnValue(new Promise(() => {}));
        render(<Swiping />);
        expect(screen.getByText("Loading job recommendations...")).toBeInTheDocument();
    });

    it("displays no jobs message when no recommendations are available", async () => {
        getRecommendedJobs.mockResolvedValue([]);
        render(<Swiping />);

        await waitFor(() => {
            expect(screen.getByText("No job recommendations available")).toBeInTheDocument();
            expect(screen.getByText("Check back later or adjust your preferences")).toBeInTheDocument();
        });
    });

    it("displays recommended jobs after loading", async () => {
        render(<Swiping />);

        await waitFor(() => {
            expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        });
    });

    it("filters out shortlisted jobs from recommendations", async () => {
        getShortlist.mockResolvedValue({ jobs: [{ _id: "job1" }] });

        render(<Swiping />);

        await waitFor(() => {
            expect(screen.queryByText("Software Engineer")).not.toBeInTheDocument();
            expect(screen.getByText("Data Scientist")).toBeInTheDocument();
        });
    });

    it("calls addJobToShortlist when 'Shortlist' button is clicked", async () => {
        render(<Swiping />);

        await waitFor(() => {
            expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("✅ Shortlist"));
        await waitFor(() => {
            expect(addJobToShortlist).toHaveBeenCalledWith("job1");
        });
    });

    it("advances to the next job after a swipe action", async () => {
        render(<Swiping />);

        await waitFor(() => {
            expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("❌ Skip"));
        await waitFor(() => {
            expect(screen.getByText("Data Scientist")).toBeInTheDocument();
        });
    });

    it("wraps around to first job when swiping past last job", async () => {
        render(<Swiping />);

        // First job
        await waitFor(() => {
            expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        });

        // Swipe to second job
        fireEvent.click(screen.getByText("❌ Skip"));
        await waitFor(() => {
            expect(screen.getByText("Data Scientist")).toBeInTheDocument();
        });

        // Swipe back to first job (wrap around)
        fireEvent.click(screen.getByText("❌ Skip"));
        await waitFor(() => {
            expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        });
    });

    it("handles error when fetching recommended jobs fails", async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        getRecommendedJobs.mockRejectedValue(new Error("Failed to fetch jobs"));

        render(<Swiping />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching jobs:", expect.any(Error));
        });

        consoleErrorSpy.mockRestore();
    });

    it("handles error when adding to shortlist fails", async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        addJobToShortlist.mockRejectedValue(new Error("Shortlist error"));

        render(<Swiping />);

        await waitFor(() => {
            fireEvent.click(screen.getByText("✅ Shortlist"));
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith("Error adding job to shortlist:", expect.any(Error));
        consoleErrorSpy.mockRestore();
    });

    it("shows loading state when user auth state is being checked", async () => {
        // Simulate delayed auth state resolution
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
            const timer = setTimeout(() => callback({ uid: "testUser" }), 1000);
            return () => clearTimeout(timer);
        });

        render(<Swiping />);
        expect(screen.getByText("Loading job recommendations...")).toBeInTheDocument();

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByText("Loading job recommendations...")).not.toBeInTheDocument();
        });
    });

    it("handles unauthenticated user state", async () => {
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
            callback(null);
            return () => {};
        });

        render(<Swiping />);

        await waitFor(() => {
            expect(screen.queryByText("Loading job recommendations...")).not.toBeInTheDocument();
            expect(screen.queryByTestId("swipebox")).not.toBeInTheDocument();
        });
    });
});