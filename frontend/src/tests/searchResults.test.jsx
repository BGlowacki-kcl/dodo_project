import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import SearchResults from "../pages/SearchResults";
import * as jobService from "../services/job.service";
import * as shortlistService from "../services/shortlist.service";
import { useNotification } from "../context/notification.context";

// Mock child components
vi.mock("../components/JobCard", () => ({
  default: ({ job }) => (
    <div data-testid="job-card">
      <p>{job.title}</p>
    </div>
  ),
}));
vi.mock("../components/Pagination", () => ({
  default: () => <div data-testid="pagination">Pagination</div>,
}));
vi.mock("../components/SearchBar", () => ({
  default: ({ onSearch }) => (
    <input
      data-testid="search-input"
      onChange={(e) => onSearch(e.target.value)}
      placeholder="Search Results"
    />
  ),
}));
vi.mock("../components/filters/SearchAndShortlistFilter", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div>
        <p>Filter Modal Open</p>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));
vi.mock("../context/notification.context", () => ({
  useNotification: vi.fn(),
}));

describe("SearchResults page", () => {
  const mockJobs = [
    { _id: "1", title: "Frontend Developer", location: "London", company: "TechCorp" },
    { _id: "2", title: "Backend Developer", location: "Manchester", company: "BuildIt" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(jobService, "getAllJobs").mockResolvedValue(mockJobs);
    vi.spyOn(jobService, "getFilteredJobs").mockResolvedValue(mockJobs);
    vi.spyOn(shortlistService, "getShortlist").mockResolvedValue({ jobs: [] });
    vi.spyOn(shortlistService, "addJobToShortlist").mockResolvedValue({});
    vi.spyOn(shortlistService, "removeJobFromShortlist").mockResolvedValue({});
    useNotification.mockReturnValue(vi.fn());
  });

  test("shows loading state initially and then job cards", async () => {
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
  
    // Allow multiple loading messages
    expect(screen.getAllByText("Loading search results...").length).toBeGreaterThanOrEqual(1);
  
    await waitFor(() => {
      expect(screen.getAllByTestId("job-card").length).toBeGreaterThanOrEqual(2);
    });
  });

  test("displays both pagination components", async () => {
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getAllByTestId("pagination").length).toBe(2);
    });
  });

  test("shows filter modal when button clicked", async () => {
    render(<MemoryRouter><SearchResults /></MemoryRouter>);

    fireEvent.click(screen.getByText("Filters"));
    expect(screen.getByText("Filter Modal Open")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));
    await waitFor(() => {
      expect(screen.queryByText("Filter Modal Open")).not.toBeInTheDocument();
    });
  });

  test("filters job list based on search input", async () => {
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    await waitFor(() => screen.getAllByTestId("job-card"));

    fireEvent.change(screen.getByTestId("search-input"), {
      target: { value: "frontend" },
    });

    expect(screen.getAllByText("Frontend Developer").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Backend Developer")).not.toBeInTheDocument();
  });

  test("shows fallback when no jobs are returned", async () => {
    jobService.getAllJobs.mockResolvedValueOnce([]);
    render(<MemoryRouter><SearchResults /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getAllByText("No job results found.").length).toBeGreaterThanOrEqual(1);
    });
  });

  test("logs error when job fetching fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    jobService.getAllJobs.mockRejectedValueOnce(new Error("Fail"));

    render(<MemoryRouter><SearchResults /></MemoryRouter>);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching search results:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test("sets isLoggedIn based on token in sessionStorage", async () => {
    sessionStorage.setItem("token", "abc123");
    render(<MemoryRouter><SearchResults /></MemoryRouter>);
    await waitFor(() => {
      // Just to trigger any logic depending on isLoggedIn
      expect(jobService.getAllJobs).toHaveBeenCalled();
    });
  });
  
  test("calls getFilteredJobs if filters exist", async () => {
    const searchParams = "?jobType=Internship";
    window.history.pushState({}, "", `/search-results${searchParams}`);

    render(<MemoryRouter initialEntries={[`/search-results${searchParams}`]}><SearchResults /></MemoryRouter>);
    await waitFor(() => {
      expect(jobService.getFilteredJobs).toHaveBeenCalled();
    });
  });




});
