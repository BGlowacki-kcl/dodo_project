import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { useNavigate, useParams } from "react-router-dom";
import EmployerApplicants from "../components/EmployerApplicants";
import { getJobApplicants } from "../services/application.service.js";
import WhiteBox from "../components/WhiteBox";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));

// Mock service functions
vi.mock("../services/application.service.js", () => ({
  getJobApplicants: vi.fn(),
}));

// Mock components
vi.mock("../components/WhiteBox", () => ({
  default: vi.fn(({ children, className }) => (
    <div className={`white-box ${className}`} data-testid="white-box">
      {children}
    </div>
  )),
}));

vi.mock("../components/StatusBadge", () => ({
  default: vi.fn(({ status, size, fontSize, padding }) => (
    <span data-testid={`status-badge-${status}`} className={`${size} ${fontSize} ${padding}`}>
      {status}
    </span>
  )),
}));

vi.mock("../components/Pagination", () => ({
  default: vi.fn(({ pageCount, onPageChange }) => (
    <div data-testid="pagination">
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          data-testid={`page-${i}`}
          onClick={() => onPageChange({ selected: i })}
        >
          Page {i + 1}
        </button>
      ))}
    </div>
  )),
}));

describe("EmployerApplicants", () => {
  const mockNavigate = vi.fn();
  const mockJobId = "job123";

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ jobId: mockJobId });
  });

  const mockApplicants = [
    {
      id: "app1",
      applicationId: "app1",
      name: "John Doe",
      email: "john.doe@example.com",
      status: "Applied",
      submittedAt: "2025-03-01T12:00:00Z",
    },
    {
      id: "app2",
      applicationId: "app2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      status: "In Review",
      submittedAt: "2025-03-02T12:00:00Z",
    },
  ];

  it("renders loading state while fetching applicants", () => {
    getJobApplicants.mockReturnValue(new Promise(() => {})); // Pending promise

    render(<EmployerApplicants />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders error message when fetching fails", async () => {
    getJobApplicants.mockRejectedValue(new Error("Failed to fetch applicants"));

    render(<EmployerApplicants />);

    await waitFor(() => {
      expect(screen.getByText("Error: Failed to fetch applicants")).toBeInTheDocument();
    });
  });

  it("renders table with applicants when data is fetched", async () => {
    getJobApplicants.mockResolvedValue(mockApplicants);

    render(<EmployerApplicants />);

    await waitFor(() => {
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Date of Submission")).toBeInTheDocument();

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("jane.smith@example.com")).toBeInTheDocument();

      expect(StatusBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "Applied",
          size: "w-40 h-6",
          fontSize: "text-sm",
          padding: "px-15 py-5",
        }),
        expect.anything()
      );
      expect(StatusBadge).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "In Review",
          size: "w-40 h-6",
          fontSize: "text-sm",
          padding: "px-15 py-5",
        }),
        expect.anything()
      );

      expect(screen.getByText("01/03/2025")).toBeInTheDocument();
      expect(screen.getByText("02/03/2025")).toBeInTheDocument();
    });
  });

  it("fetches applicants on mount with correct jobId", async () => {
    getJobApplicants.mockResolvedValue(mockApplicants);

    render(<EmployerApplicants />);

    await waitFor(() => {
      expect(getJobApplicants).toHaveBeenCalledWith("job123");
    });
  });

  it("sorts applicants by submission date (Oldest First by default)", async () => {
    getJobApplicants.mockResolvedValue(mockApplicants);

    render(<EmployerApplicants />);

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      // First row is header, second row should be John Doe (earlier date)
      expect(rows[1]).toHaveTextContent("John Doe");
      expect(rows[2]).toHaveTextContent("Jane Smith");
    });
  });

  it("toggles sort order between Oldest First and Newest First", async () => {
    getJobApplicants.mockResolvedValue(mockApplicants);

    render(<EmployerApplicants />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // Default sort: Oldest First (John Doe first)
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("John Doe");
    expect(rows[2]).toHaveTextContent("Jane Smith");

    // Toggle to Newest First
    fireEvent.click(screen.getByText(/Date of Submission/));

    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Jane Smith");
    expect(rows[2]).toHaveTextContent("John Doe");

    // Toggle back to Oldest First
    fireEvent.click(screen.getByText(/Date of Submission/));

    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("John Doe");
    expect(rows[2]).toHaveTextContent("Jane Smith");
  });

  it("navigates to applicant details on row click", async () => {
    getJobApplicants.mockResolvedValue(mockApplicants);

    render(<EmployerApplicants />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const row = screen.getByText("John Doe").closest("tr");
    fireEvent.click(row);

    expect(mockNavigate).toHaveBeenCalledWith("/applicant/app1");
  });

  it("handles pagination correctly", async () => {
    // Create 15 applicants to have multiple pages (10 per page)
    const manyApplicants = Array.from({ length: 15 }, (_, i) => ({
      id: `app${i}`,
      applicationId: `app${i}`,
      name: `Applicant ${i}`,
      email: `applicant${i}@example.com`,
      status: "Applied",
      submittedAt: `2025-03-${String(i + 1).padStart(2, "0")}T12:00:00Z`,
    }));
    getJobApplicants.mockResolvedValue(manyApplicants);

    render(<EmployerApplicants />);

    await waitFor(() => {
      expect(screen.getByText("Applicant 0")).toBeInTheDocument();
    });

    // First page: Applicants 0-9
    expect(screen.getByText("Applicant 0")).toBeInTheDocument();
    expect(screen.getByText("Applicant 9")).toBeInTheDocument();
    expect(screen.queryByText("Applicant 10")).not.toBeInTheDocument();

    // Navigate to second page
    fireEvent.click(screen.getByTestId("page-1"));

    expect(screen.getByText("Applicant 10")).toBeInTheDocument();
    expect(screen.getByText("Applicant 14")).toBeInTheDocument();
    expect(screen.queryByText("Applicant 0")).not.toBeInTheDocument();
  });

  it("shows 'No applicants found' when applicant list is empty", async () => {
    getJobApplicants.mockResolvedValue([]);

    render(<EmployerApplicants />);

    await waitFor(() => {
      expect(screen.getByText("No applicants found.")).toBeInTheDocument();
    });
  });

  it("does not show pagination for a single page of applicants", async () => {
    const fewApplicants = mockApplicants.slice(0, 5); // Less than 10 applicants
    getJobApplicants.mockResolvedValue(fewApplicants);

    render(<EmployerApplicants />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(Pagination).toHaveBeenCalledWith(
      expect.objectContaining({
        pageCount: 1,
      }),
      expect.anything()
    );
  });
});