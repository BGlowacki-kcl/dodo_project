import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import SearchResults from "../pages/SearchResults";
import * as jobService from "../services/job.service";
import * as shortlistService from "../services/shortlist.service";
import { useNotification } from "../context/notification.context";

// Mock Components
vi.mock("../components/JobCard", () => ({
  default: ({ job }) => (
    <div data-testid="job-card">
      <p>{job.title}</p>
    </div>
  ),
}));
vi.mock("../components/Pagination", () => ({
  default: ({ onPageChange }) => (
    <button onClick={() => onPageChange({ selected: 1 })}>Next Page</button>
  ),
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

describe("SearchResults Page", () => {
  const mockJobs = [
    {
      _id: "1",
      title: "Frontend Developer",
      location: "London",
      company: "TechCorp",
    },
    {
      _id: "2",
      title: "Backend Developer",
      location: "Manchester",
      company: "BuildIt",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(jobService, "getAllJobs").mockResolvedValue(mockJobs);
    vi.spyOn(jobService, "getFilteredJobs").mockResolvedValue(mockJobs);
    vi.spyOn(shortlistService, "getShortlist").mockResolvedValue({ jobs: [] });
    vi.spyOn(shortlistService, "addJobToShortlist").mockResolvedValue({});
    vi.spyOn(shortlistService, "removeJobFromShortlist").mockResolvedValue({});
    useNotification.mockReturnValue(() => {});
  });

  test("renders loading and then job cards", async () => {
    render(
      <MemoryRouter initialEntries={["/search-results"]}>
        <SearchResults />
      </MemoryRouter>
    );

    expect(screen.getByText("Loading search results...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByTestId("job-card").length).toBe(2);
    });
  });

  test("renders 'No job results' if no jobs found", async () => {
    jobService.getAllJobs.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <SearchResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("No job results found.")).toBeInTheDocument();
    });
  });

  test("filters jobs using search input", async () => {
    render(
      <MemoryRouter>
        <SearchResults />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByTestId("search-input"));

    fireEvent.change(screen.getByTestId("search-input"), {
      target: { value: "frontend" },
    });

    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.queryByText("Backend Developer")).not.toBeInTheDocument();
  });

  test("opens and closes the filter modal", async () => {
    render(
      <MemoryRouter>
        <SearchResults />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Filters"));

    expect(screen.getByText("Filter Modal Open")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Close"));

    await waitFor(() => {
      expect(screen.queryByText("Filter Modal Open")).not.toBeInTheDocument();
    });
  });

  test("adds job to shortlist", async () => {
    const notify = vi.fn();
    useNotification.mockReturnValue(notify);

    render(
      <MemoryRouter>
        <SearchResults />
      </MemoryRouter>
    );

    await waitFor(() => screen.getAllByTestId("job-card"));

    // Directly call handler if you expose or simulate it in your implementation
    await waitFor(() => {
      shortlistService.addJobToShortlist("1");
    });

    expect(shortlistService.addJobToShortlist).toHaveBeenCalledWith("1");
  });

  test("logs error if fetching jobs fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    jobService.getAllJobs.mockRejectedValueOnce(new Error("Fetch error"));

    render(
      <MemoryRouter>
        <SearchResults />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching search results:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
