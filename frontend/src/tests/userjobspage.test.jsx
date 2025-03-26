import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import UserJobsPage from "../pages/user/UserJobsPage";
import { userService } from "../services/user.service";
//frontend\src\services\user.service.js
import { getAllJobs } from "../services/job.service.js";
import { getAllUserApplications } from "../services/application.service.js";
import { getShortlist } from "../services/shortlist.service";
import { vi } from 'vitest';


vi.mock("../services/user.service", () => ({
  userService: {
    getUserProfile: vi.fn(),
  },
}));
vi.mock("../services/jobService", () => ({
  getAllJobs: vi.fn(),
}));
vi.mock("../services/applicationService", () => ({
  getAllUserApplications: vi.fn(),
  applyToJob: vi.fn(), 
}));
vi.mock("../services/shortlist.service", () => ({
  addJobToShortlist: vi.fn(),
  getShortlist: vi.fn(),
}));

describe("UserJobsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders jobs and shows 'Applied' or 'Shortlisted' status if user already applied or shortlisted them", async () => {
    //Mock user profile
    userService.getUserProfile.mockResolvedValue({
      success: true,
      data: {
        _id: "fakeUserId",
        name: "Test User",
      },
    });

    //Mock user applications
    //user has already applied to job with _id "appliedJobId"
    getAllUserApplications.mockResolvedValue([
      {
        _id: "applicationId1",
        job: { _id: "appliedJobId" },
        status: "Applied",
      },
    ]);

    //Mock user shortlist
    //user has already shortlisted job with _id "shortlistedJobId"
    getShortlist.mockResolvedValue({
      user: "fakeUserId",
      jobs: [{ _id: "shortlistedJobId" }],
    });

    //mock all jobs from the backend
    getAllJobs.mockResolvedValue([
      {
        _id: "appliedJobId",
        title: "Frontend Engineer",
        description: "React dev",
        location: "Remote",
        requirements: ["React", "JS"],
        employmentType: "Full-Time",
      },
      {
        _id: "shortlistedJobId",
        title: "Backend Developer",
        description: "Node dev",
        location: "Onsite",
        requirements: ["Node.js", "MongoDB"],
        employmentType: "Internship",
      },
      {
        _id: "newJobId1", // user hasn't interacted with this job
        title: "Data Scientist",
        description: "Python dev",
        location: "Hybrid",
        requirements: ["Python", "ML"],
        employmentType: "Graduate",
      },
    ]);

    render(<UserJobsPage />);

    await waitFor(() => {
      expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
      expect(screen.getByText("Backend Developer")).toBeInTheDocument();
      expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    });

    //The job user already applied to should have "Applied" button disabled
    const appliedButton = screen.getByRole("button", { name: /Applied/i });
    expect(appliedButton).toBeDisabled();

    //The job user already shortlisted should have "Shortlisted" button disabled
    const shortlistedButton = screen.getByRole("button", { name: /Shortlisted/i });
    expect(shortlistedButton).toBeDisabled();

    //The new job should have an "Apply" button and a "Shortlist" button
    const applyButtons = screen.getAllByText("Apply");
    const shortlistButtons = screen.getAllByText("Shortlist");
    expect(applyButtons.length).toBeGreaterThan(0);
    expect(shortlistButtons.length).toBeGreaterThan(0);
  });

  it("shows a loading scenario if getUserProfile or getAllJobs is slow", async () => {
    userService.getUserProfile.mockResolvedValueOnce({
      success: true,
      data: { _id: "fakeUserId" },
    });
    getAllJobs.mockReturnValue(
      new Promise(() => {})
    );

    render(<UserJobsPage />);
    // need more tests for loading
  });
});
