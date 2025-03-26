import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UserApplicationsPage from "../pages/user/UserApplicationsPage"; 
import { getAllUserApplications } from "../services/application.service.js";

// Mock the method used in UserApplicationsPage
vi.mock("../services/applicationService", () => ({
  getAllUserApplications: vi.fn(),
}));

describe("UserApplicationsPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a message if no applications exist", async () => {
    //Mock zero apps
    getAllUserApplications.mockResolvedValueOnce([]);
    render(<UserApplicationsPage />);
    await waitFor(() =>
      expect(screen.getByText(/You have not applied to any jobs yet/i)).toBeInTheDocument()
    );
  });

  it("shows applications and allows filtering and view-mode toggles", async () => {
    //Mock some applications
    getAllUserApplications.mockResolvedValueOnce([
      {
        _id: "app1",
        status: "Applied",
        submittedAt: "2025-03-09T15:28:36.140Z",
        job: { title: "Frontend Dev" },
      },
      {
        _id: "app2",
        status: "Shortlisted",
        submittedAt: "2025-03-10T15:28:36.140Z",
        job: { title: "Backend Dev" },
      },
    ]); 
    render(<UserApplicationsPage />); 
    await waitFor(() => {
      expect(screen.getByText("Frontend Dev")).toBeInTheDocument();
      expect(screen.getByText("Backend Dev")).toBeInTheDocument();
    });

    //Check that the default list view is displayed 
    const detailLinks = screen.getAllByRole("link", { name: /View Details/i });
    expect(detailLinks.length).toBe(2);

    //Switch to "grid" view
    const gridButton = screen.getByRole("button", { name: /Grid View/i });
    fireEvent.click(gridButton);
    expect(screen.getByText("Frontend Dev")).toBeInTheDocument();
    expect(screen.getByText("Backend Dev")).toBeInTheDocument();

    //Filter by status "applied"
    const filterSelect = screen.getByLabelText("Filter by Status");  
    fireEvent.change(filterSelect, { target: { value: "Applied" } }); 
    expect(screen.getByText("Frontend Dev")).toBeInTheDocument();
    expect(screen.queryByText("Backend Dev")).not.toBeInTheDocument();
  });
});
