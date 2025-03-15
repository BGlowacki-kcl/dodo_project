import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Swiping from "../pages/applicant/Swiping.jsx";
import { getRecommendedJobs } from "../services/matcher.service";
import { addJobToShortlist } from "../services/shortlist.service";
import { vi } from "vitest";

// Mock external service calls
vi.mock("../services/matcher.service", () => ({
    getRecommendedJobs: vi.fn(),
}));

vi.mock("../services/shortlist.service", () => ({
    addJobToShortlist: vi.fn(),
}));

describe("Swiping Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows a loading message until job recommendations are fetched", () => {
        // Return a pending promise to simulate loading
        getRecommendedJobs.mockReturnValue(new Promise(() => {}));
        render(<Swiping />);
        expect(
            screen.getByText(/Loading job recommendations/i)
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
        getRecommendedJobs.mockResolvedValue(mockJobs);
        render(<Swiping />);
        await waitFor(() => {
            expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
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
        getRecommendedJobs.mockResolvedValue(mockJobs);
        addJobToShortlist.mockResolvedValue({}); // dummy response

        render(<Swiping />);
        await waitFor(() => {
            expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
        });

        const shortlistButton = screen.getByRole("button", {
            name: /✅ Shortlist/i,
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
        getRecommendedJobs.mockResolvedValue(mockJobs);
        render(<Swiping />);

        // Verify the first job is rendered
        await waitFor(() => {
            expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
        });

        // Trigger a swipe (Skip)
        const skipButton = screen.getByRole("button", { name: /❌ Skip/i });
        fireEvent.click(skipButton);

        // After swipe, the next job should be displayed
        await waitFor(() => {
            expect(screen.getByText(/Data Scientist/i)).toBeInTheDocument();
        });
    });
});
