import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Landing from "../pages/applicant/Landing";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// Mock job service functions
import * as jobService from "../services/job.service";

vi.mock("../components/LandingComponents", () => ({
  ComboBox: ({ label, options, onSelect }) => (
    <select data-testid={`combobox-${label}`} onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  ),
  Box: ({ text, counter, onClick }) => (
    <div data-testid={`box-${text}`} onClick={onClick}>
      {text} ({counter})
    </div>
  ),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Landing Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(jobService, "getJobCountByType").mockImplementation((type) =>
      Promise.resolve({ Internship: 7, Placement: 3, Graduate: 5 }[type] || 0)
    );
    vi.spyOn(jobService, "getAllJobTypes").mockResolvedValue(["Internship", "Placement", "Graduate"]);
    vi.spyOn(jobService, "getAllJobRoles").mockResolvedValue(["Frontend", "Backend"]);
    vi.spyOn(jobService, "getAllJobLocations").mockResolvedValue(["London", "Manchester"]);
  });

  test("renders heading and loads job data", async () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("box-Internships")).toBeInTheDocument();
      expect(screen.getByTestId("box-Internships").textContent).toContain("7");
    });
  });

  test("navigates when a category box is clicked", async () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByTestId("box-Internships"));

    fireEvent.click(screen.getByTestId("box-Internships"));
    expect(mockNavigate).toHaveBeenCalledWith("/search-results?jobType=Internship");
  });

  test("builds search query from dropdowns and navigates", async () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByTestId("combobox-Job Type"));

    fireEvent.change(screen.getByTestId("combobox-Job Type"), {
      target: { value: "Graduate" },
    });
    fireEvent.change(screen.getByTestId("combobox-Role"), {
      target: { value: "Frontend" },
    });
    fireEvent.change(screen.getByTestId("combobox-Location"), {
      target: { value: "London" },
    });

    fireEvent.click(screen.getByText("Search Jobs"));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/search-results?jobType=Graduate&role=Frontend&location=London"
    );
  });

  test("shows footer correctly", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getByText(/Joborithm/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  test("logs error if job data fetching fails", async () => {
    // Force service functions to reject
    vi.spyOn(jobService, "getJobCountByType").mockRejectedValue(new Error("API failure"));
    vi.spyOn(jobService, "getAllJobRoles").mockRejectedValue(new Error("API failure"));
    vi.spyOn(jobService, "getAllJobLocations").mockRejectedValue(new Error("API failure"));
    vi.spyOn(jobService, "getAllJobTypes").mockRejectedValue(new Error("API failure"));
  
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch data", expect.any(Error));
    });
  
    consoleSpy.mockRestore();
  });
  
  test("navigates to search-results with query params if filters are selected", async () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );
  
    await waitFor(() => screen.getByTestId("combobox-Job Type"));
  
    fireEvent.change(screen.getByTestId("combobox-Job Type"), {
      target: { value: "Internship" },
    });
  
    fireEvent.change(screen.getByTestId("combobox-Role"), {
      target: { value: "Backend" },
    });
  
    fireEvent.change(screen.getByTestId("combobox-Location"), {
      target: { value: "London" },
    });
  
    fireEvent.click(screen.getByText("Search Jobs"));
  
    expect(mockNavigate).toHaveBeenCalledWith(
      "/search-results?jobType=Internship&role=Backend&location=London"
    );
  });
  
  test("navigates to search-results without query if no filters are selected", async () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );
  
    await waitFor(() => screen.getByText("Search Jobs"));
  
    fireEvent.click(screen.getByText("Search Jobs"));
  
    expect(mockNavigate).toHaveBeenCalledWith("/search-results");
  });  
});
