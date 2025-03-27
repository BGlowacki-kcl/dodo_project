import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { vi } from "vitest";
import ApplicationCards from "../components/ApplicationCards";
import StatusBadge from "../components/StatusBadge";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

// Mock StatusBadge component
vi.mock("../components/StatusBadge", () => ({
  default: vi.fn(({ status, size, fontSize, padding }) => (
    <span data-testid={`status-badge-${status}`} className={`${size} ${fontSize} ${padding}`}>
      {status}
    </span>
  )),
}));

describe("ApplicationCards", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  const mockApplications = [
    {
      _id: "app1",
      job: { _id: "job1", title: "Software Engineer", company: "Tech Corp" },
      status: "Applying",
      submittedAt: "2025-03-09T12:00:00Z",
    },
    {
      _id: "app2",
      job: { _id: "job2", title: "Product Manager", company: "Biz Inc" },
      status: "Rejected",
      submittedAt: "2025-03-10T14:30:00Z",
    },
  ];

  it("renders a list of application cards", () => {
    render(<ApplicationCards applications={mockApplications} />);

    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("Biz Inc")).toBeInTheDocument();

    expect(StatusBadge).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "Applying",
        size: "w-40 h-6",
        fontSize: "text-sm",
        padding: "px-15 py-5",
      }),
      expect.anything()
    );
    expect(StatusBadge).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "Rejected",
        size: "w-40 h-6",
        fontSize: "text-sm",
        padding: "px-15 py-5",
      }),
      expect.anything()
    );

    expect(screen.getByText("09/03/2025 12:00")).toBeInTheDocument();
    expect(screen.getByText("10/03/2025 14:30")).toBeInTheDocument();
  });

  it("navigates to apply page when status is 'Applying'", () => {
    render(<ApplicationCards applications={mockApplications} />);

    const card = screen.getByText("Software Engineer").closest("div");
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith("/apply/job1");
  });

  it("navigates to application details page when status is not 'Applying'", () => {
    render(<ApplicationCards applications={mockApplications} />);

    const card = screen.getByText("Product Manager").closest("div");
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith("/user/applications/app2");
  });

  it("renders fallback text for missing job title or company", () => {
    const applicationsWithMissingData = [
      {
        _id: "app3",
        job: { _id: "job3" },
        status: "In Review",
        submittedAt: "2025-03-11T09:00:00Z",
      },
    ];

    render(<ApplicationCards applications={applicationsWithMissingData} />);

    expect(screen.getByText("Untitled Job")).toBeInTheDocument();
    expect(screen.getByText("Unknown Company")).toBeInTheDocument();
  });

  it("renders container with no children when applications list is empty", () => {
    const { container } = render(<ApplicationCards applications={[]} />);

    // Query the root div by its className
    const applicationContainer = container.querySelector(".space-y-4");
    expect(applicationContainer).toBeInTheDocument();
    expect(applicationContainer.children).toHaveLength(0);
  });

  it("formats dates correctly", () => {
    render(<ApplicationCards applications={mockApplications} />);

    expect(screen.getByText("09/03/2025 12:00")).toBeInTheDocument();
    expect(screen.getByText("10/03/2025 14:30")).toBeInTheDocument();
  });
});