import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import PostStatistics from "../components/PostStatistics";
import { getApplicationsData } from "../services/application.service";

// Mock dependencies
vi.mock("react-router-dom", () => ({
  useParams: () => ({ jobId: "job123" })
}));

vi.mock("../services/application.service", () => ({
  getApplicationsData: vi.fn()
}));

vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>
}));

vi.mock("chart.js", () => ({
  Chart: {
    register: vi.fn()
  },
  BarElement: "mock-bar-element",
  CategoryScale: "mock-category-scale",
  LinearScale: "mock-linear-scale",
  Tooltip: "mock-tooltip",
  Legend: "mock-legend"
}));

vi.mock("../components/WhiteBox", () => ({
  default: ({ children }) => <div data-testid="white-box">{children}</div>
}));

vi.mock("../components/StatBox", () => ({
  default: ({ title, value }) => (
    <div data-testid="stat-box">
      <div>{title}</div>
      <div>{value}</div>
    </div>
  )
}));

describe("PostStatistics Component", () => {
  const mockApplicationData = {
    groupedStatuses: [
      {
        jobId: "job123",
        statuses: [
          { status: "Applied", count: 10 },
          { status: "Shortlisted", count: 5 },
          { status: "Code Challenge", count: 3 },
          { status: "In Review", count: 2 },
          { status: "Rejected", count: 3 },
          { status: "Accepted", count: 2 },
        ]
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches application data on mount", async () => {
    getApplicationsData.mockResolvedValue(mockApplicationData);
    
    render(<PostStatistics />);
    
    expect(getApplicationsData).toHaveBeenCalledTimes(1);
  });

  it("displays statistics correctly", async () => {
    getApplicationsData.mockResolvedValue(mockApplicationData);
    
    render(<PostStatistics />);
    
    await waitFor(() => {
      const statBoxes = screen.getAllByTestId("stat-box");
      expect(statBoxes).toHaveLength(4);
      
      // Check total applicants (sum of all status counts)
      expect(statBoxes[0]).toHaveTextContent("Total Applicants");
      expect(statBoxes[0]).toHaveTextContent("25");
      
      // Check acceptance percentage (2/25 * 100 = 8.00%)
      expect(statBoxes[1]).toHaveTextContent("Acceptance Percentage");
      expect(statBoxes[1]).toHaveTextContent("8.00%");
      
      // Check completion percentage ((2+3)/25 * 100 = 20.00%)
      expect(statBoxes[2]).toHaveTextContent("Completion Percentage");
      expect(statBoxes[2]).toHaveTextContent("20.00%");
      
      // Check pending applicants (total - accepted - rejected = 25-2-3 = 20)
      expect(statBoxes[3]).toHaveTextContent("Pending Applicants");
      expect(statBoxes[3]).toHaveTextContent("20");
    });
  });

  it("renders bar chart when data is available", async () => {
    getApplicationsData.mockResolvedValue(mockApplicationData);
    
    render(<PostStatistics />);
    
    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      expect(screen.getByText("Applicants by Status")).toBeInTheDocument();
    });
  });

  it("handles case when no data is found", async () => {
    // Mock empty response
    getApplicationsData.mockResolvedValue({
      groupedStatuses: []
    });
    
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    render(<PostStatistics />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("No data found for the specified job.");
    });
    
    consoleSpy.mockRestore();
  });

  it("handles API error gracefully", async () => {
    getApplicationsData.mockRejectedValue(new Error("API Error"));
    
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    render(<PostStatistics />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching post statistics:", expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });
});
