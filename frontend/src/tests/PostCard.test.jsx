import { render, screen, fireEvent, within } from "@testing-library/react";
import { vi } from "vitest";
import PostCard from "../components/PostCard";

// Mock the useNavigate hook
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate
}));

// Mock DeadlineBadge component
vi.mock("../components/DeadlineBadge", () => ({
  default: ({ deadline }) => <div data-testid="deadline-badge">{deadline}</div>
}));

// Mock WhiteBox component
vi.mock("../components/WhiteBox", () => ({
  default: ({ children, onClick, className }) => (
    <div onClick={onClick} className={className} data-testid="white-box">
      {children}
    </div>
  )
}));

const mockNavigate = vi.fn();

describe("PostCard Component", () => {
  const mockProps = {
    title: "Frontend Developer",
    type: "Full-time",
    location: "London",
    totalApplicants: 25,
    pendingApplicants: 15,
    statusBreakdown: [
      { status: "Applied", count: 10 },
      { status: "Shortlisted", count: 5 },
      { status: "In Review", count: 5 },
      { status: "Accepted", count: 3 },
      { status: "Rejected", count: 2 },
      { status: "Applying", count: 0 }, // Should be filtered out
      { status: "Code Challenge", count: 0 }
    ],
    jobId: "job123",
    deadline: "2023-12-31"
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders job information correctly", () => {
    render(<PostCard {...mockProps} />);
    
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText(/Full-time/)).toBeInTheDocument();
    expect(screen.getByText(/London/)).toBeInTheDocument();
  });

  it("renders applicant count information correctly", () => {
    render(<PostCard {...mockProps} />);
    
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Pending Applicants")).toBeInTheDocument();
    expect(screen.getByText("Total Applicants")).toBeInTheDocument();
  });

  it("renders status breakdown table correctly", () => {
    render(<PostCard {...mockProps} />);
    
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Count")).toBeInTheDocument();
    
    // Get the table and check rows by finding both status and count together
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row").slice(1); // Skip header row
    
    // Check that the correct statuses are shown with their counts
    const rowData = rows.map(row => ({
      status: within(row).getByRole("cell", { name: /Applied|Shortlisted|Code Challenge|In Review|Rejected|Accepted/ }).textContent,
      count: within(row).getAllByRole("cell")[1].textContent
    }));
    
    // Verify expected status/count pairs
    expect(rowData).toContainEqual({ status: "Applied", count: "10" });
    expect(rowData).toContainEqual({ status: "Shortlisted", count: "5" });
    expect(rowData).toContainEqual({ status: "In Review", count: "5" });
    expect(rowData).toContainEqual({ status: "Rejected", count: "2" });
    expect(rowData).toContainEqual({ status: "Accepted", count: "3" });
    
    // Should not include Applying status
    const tableContent = table.textContent;
    expect(tableContent).not.toContain("Applying");
  });

  it("navigates to correct URL when clicked", () => {
    render(<PostCard {...mockProps} />);
    
    const whiteBox = screen.getByTestId("white-box");
    fireEvent.click(whiteBox);
    
    expect(mockNavigate).toHaveBeenCalledWith("/employer/post/job123");
  });

  it("renders deadline badge with correct date", () => {
    render(<PostCard {...mockProps} />);
    
    const deadlineBadge = screen.getByTestId("deadline-badge");
    expect(deadlineBadge).toBeInTheDocument();
    expect(deadlineBadge).toHaveTextContent("2023-12-31");
  });
});
