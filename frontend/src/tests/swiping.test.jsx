import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Swiping from "../pages/applicant/Swiping.jsx";
import { getRecommendedJobs } from "../services/matcher.service";
import { addJobToShortlist, getShortlist } from "../services/shortlist.service";
import { vi } from "vitest";

// Mock dependencies
vi.mock("../services/auth.service", () => ({
    checkTokenExpiration: vi.fn(),
}));

vi.mock("../services/helper.js", () => ({
    checkAuth: vi.fn().mockResolvedValue(true),
}));

vi.mock("firebase/auth", async () => ({
    ...(await vi.importActual("firebase/auth")),
    onAuthStateChanged: vi.fn((auth, callback) => {
        callback({ uid: "testUser" });
        return () => {};
    }),
    getAuth: vi.fn(() => ({})),
}));

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

// Update the SwipeBox mock to match actual component
vi.mock("../../components/SwipeBox", () => ({
    default: ({ title, onSwipe, onShortlist, jobId }) => (
        <div data-testid="swipebox">
            <h3>{title}</h3>
            <button
                className="skip-btn"
                onClick={() => onSwipe()} // Changed to match actual usage
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
    beforeEach(() => {
        vi.clearAllMocks();
        getShortlist.mockResolvedValue({ jobs: [] });
    });

    // ... keep other tests the same ...

    it("calls addJobToShortlist when 'Shortlist' button is clicked", async () => {
        const mockJobs = [{
            _id: "job1",
            title: "Software Engineer",
        }];
        getRecommendedJobs.mockResolvedValue(mockJobs);
        render(<Swiping />);

        await waitFor(() => {
            expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        });

        // Updated to match the actual button text
        fireEvent.click(screen.getByText("✅ Shortlist"));
        await waitFor(() => {
            expect(addJobToShortlist).toHaveBeenCalledWith("job1");
        });
    });

    it("advances to the next job after a swipe action", async () => {
        const mockJobs = [
            { _id: "job1", title: "Software Engineer" },
            { _id: "job2", title: "Data Scientist" },
        ];
        getRecommendedJobs.mockResolvedValue(mockJobs);
        render(<Swiping />);

        await waitFor(() => {
            expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        });

        // Updated to use the skip button for swiping
        fireEvent.click(screen.getByText("❌ Skip"));
        await waitFor(() => {
            expect(screen.getByText("Data Scientist")).toBeInTheDocument();
        });
    });
});