import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import JobDetailsPage from "../pages/user/JobDetailsPage";

// Mocks
import * as jobService from "../services/job.service";
import * as applicationService from "../services/application.service";
import * as shortlistService from "../services/shortlist.service";

// Components
vi.mock("../components/JobDetailsContent", () => ({
  default: ({ job }) => <div data-testid="job-details-content">{job.title}</div>,
}));
vi.mock("../components/DeadlineBadge", () => ({
  default: () => <span data-testid="deadline-badge">Deadline Badge</span>,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("JobDetailsPage", () => {
  const mockJob = {
    _id: "job123",
    title: "Frontend Developer",
    deadline: "2025-05-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(jobService, "getJobById").mockResolvedValue(mockJob);
    vi.spyOn(applicationService, "getAllUserApplications").mockResolvedValue([]);
    vi.spyOn(shortlistService, "getShortlist").mockResolvedValue({ jobs: [] });
    vi.spyOn(shortlistService, "addJobToShortlist").mockResolvedValue({});
    vi.spyOn(shortlistService, "removeJobFromShortlist").mockResolvedValue({});
    vi.spyOn(applicationService, "applyToJob").mockResolvedValue({});
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/user/jobs/details/job123"]}>
        <Routes>
          <Route path="/user/jobs/details/:jobId" element={<JobDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

  test("shows loading initially", async () => {
    renderPage();
    expect(screen.getByText("Loading job details...")).toBeInTheDocument();
    await waitFor(() => screen.getByTestId("job-details-content"));
  });

  test("renders job details and Apply button", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Job Details")).toBeInTheDocument();
      expect(screen.getByText("Apply Now")).toBeInTheDocument();
      expect(screen.getByText("Add to Shortlist")).toBeInTheDocument();
    });
  });

  test("calls applyToJob and navigates when Apply Now clicked", async () => {
    renderPage();
    await waitFor(() => screen.getByText("Apply Now"));

    fireEvent.click(screen.getByText("Apply Now"));

    await waitFor(() => {
      expect(applicationService.applyToJob).toHaveBeenCalledWith({
        jobId: "job123",
        coverLetter: "",
        answers: [],
      });
      expect(mockNavigate).toHaveBeenCalledWith("/apply/job123");
    });
  });

  test("shows Continue Application button if status is 'Applying'", async () => {
    applicationService.getAllUserApplications.mockResolvedValueOnce([
      { job: { _id: "job123" }, status: "Applying" },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Continue Application")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Continue Application"));
    expect(mockNavigate).toHaveBeenCalledWith("/apply/job123");
  });

  test("shows submitted status if application already submitted", async () => {
    applicationService.getAllUserApplications.mockResolvedValueOnce([
      { job: { _id: "job123" }, status: "Submitted" },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Application Submitted")).toBeInTheDocument();
    });
  });

  test("handles error when fetching data fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    jobService.getJobById.mockRejectedValueOnce(new Error("Fetch error"));

    renderPage();

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Error fetching data:", expect.any(Error));
    });

    errorSpy.mockRestore();
  });

  test("handles error when applying fails", async () => {
    applicationService.applyToJob.mockRejectedValueOnce(new Error("Apply error"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderPage();
    await waitFor(() => screen.getByText("Apply Now"));

    fireEvent.click(screen.getByText("Apply Now"));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Error applying to job:", expect.any(Error));
    });

    errorSpy.mockRestore();
  });

  test("handles error when toggling shortlist fails", async () => {
    shortlistService.addJobToShortlist.mockRejectedValueOnce(new Error("Shortlist error"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderPage();
    await waitFor(() => screen.getByText("Add to Shortlist"));

    fireEvent.click(screen.getByText("Add to Shortlist"));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Error updating shortlist:", expect.any(Error));
    });

    errorSpy.mockRestore();
  });

  test("adds job to shortlist and updates button styling", async () => {
    render(
      <MemoryRouter initialEntries={["/user/jobs/details/job123"]}>
        <Routes>
          <Route path="/user/jobs/details/:jobId" element={<JobDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );
  
    await waitFor(() => screen.getByText("Add to Shortlist"));
  
    const button = screen.getByText("Add to Shortlist");
  
    expect(button).toHaveClass("bg-gray-200", "text-gray-800");
  
    fireEvent.click(button);
  
    await waitFor(() => {
      expect(shortlistService.addJobToShortlist).toHaveBeenCalledWith("job123");
    });
  
    const updatedButton = screen.getByText("Remove from Shortlist");
    expect(updatedButton).toHaveClass("bg-green-500", "text-white");
  });
  
  test("removes job from shortlist and updates button styling", async () => {
    // Mock job as initially shortlisted
    shortlistService.getShortlist.mockResolvedValueOnce({
      jobs: [{ _id: "job123" }],
    });
  
    render(
      <MemoryRouter initialEntries={["/user/jobs/details/job123"]}>
        <Routes>
          <Route path="/user/jobs/details/:jobId" element={<JobDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );
  
    await waitFor(() => screen.getByText("Remove from Shortlist"));
  
    const button = screen.getByText("Remove from Shortlist");
  
    expect(button).toHaveClass("bg-green-500", "text-white");
  
    fireEvent.click(button);
  
    await waitFor(() => {
      expect(shortlistService.removeJobFromShortlist).toHaveBeenCalledWith("job123");
    });
  
    const updatedButton = screen.getByText("Add to Shortlist");
    expect(updatedButton).toHaveClass("bg-gray-200", "text-gray-800");
  });  
});
