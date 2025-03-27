import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import JobDetailsPage from "../pages/user/JobDetailsPage";

// Mocks
import * as jobService from "../services/job.service";
import * as applicationService from "../services/application.service";
import * as shortlistService from "../services/shortlist.service";
import * as notificationContext from "../context/notification.context";

// Mock components
vi.mock("../components/JobDetailsContent", () => ({
  default: ({ job }) => (
    <div data-testid="job-details-content">{job.title || "No job title"}</div>
  ),
}));

vi.mock("../components/DeadlineBadge", () => ({
  default: ({ deadline }) => (
    <span data-testid="deadline-badge">{deadline || "No deadline"}</span>
  ),
}));

// Mock hooks and functions
const mockNavigate = vi.fn();
const mockShowNotification = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../context/notification.context", () => ({
  useNotification: () => mockShowNotification,
}));

// Mock storage
const mockSessionStorage = (() => {
  let store = { token: "fake-token" };
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe("JobDetailsPage", () => {
  const mockJob = {
    _id: "job123",
    title: "Frontend Developer",
    company: "Tech Corp",
    location: "Remote",
    employmentType: "Full-time",
    experienceLevel: "Mid-Senior",
    salaryRange: { min: 80000, max: 120000 },
    requirements: ["React", "JavaScript", "TypeScript"],
    description: "A great job opportunity for frontend developers",
    deadline: "2025-05-01",
    questions: [
      { _id: "q1", questionText: "Tell us about yourself" },
      { _id: "q2", questionText: "Why do you want this job?" }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.spyOn(jobService, "getJobById").mockResolvedValue(mockJob);
    vi.spyOn(applicationService, "getAllUserApplications").mockResolvedValue([]);
    vi.spyOn(shortlistService, "getShortlist").mockResolvedValue({ jobs: [] });
    vi.spyOn(shortlistService, "addJobToShortlist").mockResolvedValue({ success: true });
    vi.spyOn(shortlistService, "removeJobFromShortlist").mockResolvedValue({ success: true });
    vi.spyOn(applicationService, "applyToJob").mockResolvedValue({ _id: "app123" });
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/user/jobs/details/job123"]}>
        <Routes>
          <Route path="/user/jobs/details/:jobId" element={<JobDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

  test("shows loading state initially", async () => {
    renderPage();
    expect(screen.getByText("Loading job details...")).toBeInTheDocument();
    await waitFor(() => screen.getByTestId("job-details-content"));
  });

  test("renders job details correctly when data is loaded", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Job Details")).toBeInTheDocument();
      expect(screen.getByTestId("job-details-content")).toBeInTheDocument();
      expect(screen.getByTestId("deadline-badge")).toBeInTheDocument();
    });
  });

  test("renders Apply Now button when user is not applied", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Apply Now")).toBeInTheDocument();
      expect(screen.getByText("Add to Shortlist")).toBeInTheDocument();
    });
  });

  test("navigates to application page when Apply Now is clicked", async () => {
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

  test("shows Continue Application button when application is in progress", async () => {
    applicationService.getAllUserApplications.mockResolvedValue([
      { job: { _id: "job123" }, status: "Applying" },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Continue Application")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Continue Application"));
    expect(mockNavigate).toHaveBeenCalledWith("/apply/job123");
  });

  test("shows Application Submitted status when application is complete", async () => {
    applicationService.getAllUserApplications.mockResolvedValue([
      { job: { _id: "job123" }, status: "Applied" },
    ]);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Application Submitted")).toBeInTheDocument();
      // Verify this is not a button
      expect(screen.queryByText("Apply Now")).not.toBeInTheDocument();
    });
  });

  test("adds job to shortlist when Add to Shortlist button is clicked", async () => {
    renderPage();
    
    await waitFor(() => screen.getByText("Add to Shortlist"));
    
    const button = screen.getByText("Add to Shortlist");
    expect(button).toHaveClass("bg-gray-200", "text-gray-800");
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(shortlistService.addJobToShortlist).toHaveBeenCalledWith("job123");
      expect(screen.getByText("Remove from Shortlist")).toBeInTheDocument();
      expect(screen.getByText("Remove from Shortlist")).toHaveClass("bg-green-500", "text-white");
    });
  });

  test("removes job from shortlist when Remove from Shortlist button is clicked", async () => {
    // Start with job in shortlist
    shortlistService.getShortlist.mockResolvedValue({
      jobs: [{ _id: "job123" }],
    });

    renderPage();
    
    await waitFor(() => screen.getByText("Remove from Shortlist"));
    
    const button = screen.getByText("Remove from Shortlist");
    expect(button).toHaveClass("bg-green-500", "text-white");
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(shortlistService.removeJobFromShortlist).toHaveBeenCalledWith("job123");
      expect(screen.getByText("Add to Shortlist")).toBeInTheDocument();
      expect(screen.getByText("Add to Shortlist")).toHaveClass("bg-gray-200", "text-gray-800");
    });
  });

  test("handles error when job data fetch fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    jobService.getJobById.mockRejectedValue(new Error("Failed to fetch job"));
    
    renderPage();
    
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Error fetching data:", expect.any(Error));
    });
    
    errorSpy.mockRestore();
  });

  test("handles error when shortlist update fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    shortlistService.addJobToShortlist.mockRejectedValue(new Error("Shortlist update failed"));
    
    renderPage();
    
    await waitFor(() => screen.getByText("Add to Shortlist"));
    fireEvent.click(screen.getByText("Add to Shortlist"));
    
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Error updating shortlist:", expect.any(Error));
    });
    
    errorSpy.mockRestore();
  });

  test("handles error when application creation fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    applicationService.applyToJob.mockRejectedValue(new Error("Application failed"));
    
    renderPage();
    
    await waitFor(() => screen.getByText("Apply Now"));
    fireEvent.click(screen.getByText("Apply Now"));
    
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Error applying to job:", expect.any(Error));
    });
    
    errorSpy.mockRestore();
  });

  test("does not show Apply or Shortlist buttons when user is not logged in", async () => {
    // Mock user not logged in
    mockSessionStorage.getItem.mockReturnValueOnce(null);
    
    renderPage();
    
    await waitFor(() => {
      expect(screen.queryByText("Apply Now")).not.toBeInTheDocument();
      expect(screen.queryByText("Add to Shortlist")).not.toBeInTheDocument();
    });
  });

  test("renders job details even when user is not logged in", async () => {
    // Mock user not logged in
    mockSessionStorage.getItem.mockReturnValueOnce(null);
    
    renderPage();
    
    await waitFor(() => {
      expect(screen.getByTestId("job-details-content")).toHaveTextContent("Frontend Developer");
      expect(screen.getByTestId("deadline-badge")).toBeInTheDocument();
    });
  });
});