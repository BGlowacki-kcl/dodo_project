import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Swiping from "../pages/applicant/Swiping.jsx";
import { getRecommendedJobs } from "../services/matcher.service";
import { addJobToShortlist } from "../services/shortlist.service";
import { vi } from "vitest";

// Mock auth.service so that helper.js can import it successfully.
vi.mock("../services/auth.service", () => ({
    checkTokenExpiration: vi.fn(),
}));

// Partial mock for firebase/auth to supply onAuthStateChanged and getAuth
vi.mock("firebase/auth", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        onAuthStateChanged: vi.fn((auth, callback) => {
            // Immediately simulate a logged-in user
            callback({ uid: "testUser" });
            return () => {};
        }),
        getAuth: vi.fn(() => ({})),
    };
});

// Mock firebase/app
vi.mock("firebase/app", () => ({
    initializeApp: vi.fn(),
    getApps: () => [],
    getApp: () => ({}),
}));

// Mock external service calls
vi.mock("../services/matcher.service", () => ({
    getRecommendedJobs: vi.fn(),
}));

vi.mock("../services/shortlist.service", () => ({
    getShortlist: vi.fn(), // provide dummy function for getShortlist
    addJobToShortlist: vi.fn(),
}));

// Mock the SwipeBox component for isolation
vi.mock("../../components/SwipeBox", () => ({
    default: ({ title, onSwipe, onShortlist, onSkip, jobId }) => (
        <div data-testid="swipebox">
            <p>{title}</p>
            <button onClick={onSwipe}>Swipe</button>
            <button onClick={() => onShortlist(jobId)}>Shortlist</button>
            <button onClick={() => onSkip(jobId)}>Skip</button>
        </div>
    ),
}));

describe("Swiping Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows a loading message until job recommendations are fetched", () => {
        // Simulate a pending promise so that recommendations remain unresolved
        getRecommendedJobs.mockReturnValue(new Promise(() => {}));
        render(<Swiping />);
        // Expect the loading text exactly as rendered in Swiping.jsx
        expect(
            screen.getByText(/Loading job recommendations\.\.\./i)
        ).toBeInTheDocument();
    });

    it("displays a recommended job after fetching", async () => {
        const mockJobs = [
            {
                _id: "job1",
                title: "Software Engineer",
                company: "Tech Corp",
                location: "Remote",
                description: "Develop cutting edge software",
                salaryRange: { min: 60000, max: 90000 },
                employmentType: "Full-Time",
            },
            {
                _id: "job2",
                title: "Data Scientist",
                company: "Data Inc",
                location: "New York",
                description: "Analyze large datasets",
                salaryRange: { min: 70000, max: 100000 },
                employmentType: "Full-Time",
            },
        ];
        // Simulate getShortlist returning an empty array
        const { getShortlist } = require("../services/shortlist.service");
        getShortlist.mockResolvedValue({ jobs: [] });
        getRecommendedJobs.mockResolvedValue(mockJobs);
        render(<Swiping />);
        await waitFor(() => {
            expect(
                screen.getByText((content) => content.includes("Software Engineer"))
            ).toBeInTheDocument();
        });
    });

    it("calls addJobToShortlist when 'Shortlist' button is clicked", async () => {
        const mockJobs = [
            {
                _id: "job1",
                title: "Software Engineer",
                company: "Tech Corp",
                location: "Remote",
                description: "Develop cutting edge software",
                salaryRange: { min: 60000, max: 90000 },
                employmentType: "Full-Time",
            },
        ];
        const { getShortlist } = require("../services/shortlist.service");
        getShortlist.mockResolvedValue({ jobs: [] });
        addJobToShortlist.mockResolvedValue({});
        getRecommendedJobs.mockResolvedValue(mockJobs);
        render(<Swiping />);
        await waitFor(() => {
            expect(
                screen.getByText((content) => content.includes("Software Engineer"))
            ).toBeInTheDocument();
        });
        const shortlistButton = screen.getByRole("button", {
            name: /Shortlist/i,
        });
        fireEvent.click(shortlistButton);
        await waitFor(() => {
            expect(addJobToShortlist).toHaveBeenCalledWith("job1");
        });
    });

    it("advances to the next job after a swipe action", async () => {
        const mockJobs = [
            {
                _id: "job1",
                title: "Software Engineer",
                company: "Tech Corp",
                location: "Remote",
                description: "Develop cutting edge software",
                salaryRange: { min: 60000, max: 90000 },
                employmentType: "Full-Time",
            },
            {
                _id: "job2",
                title: "Data Scientist",
                company: "Data Inc",
                location: "New York",
                description: "Analyze large datasets",
                salaryRange: { min: 70000, max: 100000 },
                employmentType: "Full-Time",
            },
        ];
        const { getShortlist } = require("../services/shortlist.service");
        getShortlist.mockResolvedValue({ jobs: [] });
        getRecommendedJobs.mockResolvedValue(mockJobs);
        render(<Swiping />);
        await waitFor(() => {
            expect(
                screen.getByText((content) => content.includes("Software Engineer"))
            ).toBeInTheDocument();
        });
        // Simulate a swipe action by clicking the "Swipe" button provided by the mock SwipeBox
        const swipeButton = screen.getByRole("button", { name: "Swipe" });
        fireEvent.click(swipeButton);
        await waitFor(() => {
            expect(
                screen.getByText((content) => content.includes("Data Scientist"))
            ).toBeInTheDocument();
        });
    });
});
