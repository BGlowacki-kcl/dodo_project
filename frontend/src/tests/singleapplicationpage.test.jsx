import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import SingleApplicationPage from "../pages/user/SingleApplicationPage";
import { getApplicationById, withdrawApplication } from "../services/application.service.js";
import { useParams, useNavigate } from "react-router-dom";

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock("../services/applicationService", () => ({
  getApplicationById: vi.fn(),
  withdrawApplication: vi.fn(),
}));

describe("SingleApplicationPage", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useParams.mockReturnValue({ appId: "testAppId123" });
    useNavigate.mockReturnValue(mockNavigate);
  });

  it("shows 'Loading...' until data is fetched", async () => {
    getApplicationById.mockReturnValue(new Promise(() => {}));

    render(<SingleApplicationPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays application details after fetching", async () => {
    getApplicationById.mockResolvedValue({
      data: {
        _id: "testAppId123",
        status: "in review",
        coverLetter: "My cover letter text",
        submittedAt: "2025-03-09T12:00:00Z",
        job: {
          _id: "jobIdXYZ",
          title: "Example Job Title",
          location: "Remote",
        },
      },
    });

    render(<SingleApplicationPage />);
    await waitFor(() => {
      expect(screen.getByText("Application Details")).toBeInTheDocument();
    });

    expect(screen.getByText("Example Job Title")).toBeInTheDocument();
    expect(screen.getByText("My cover letter text")).toBeInTheDocument();
    expect(screen.getByText("in review")).toBeInTheDocument();
    const viewJobBtn = screen.getByRole("button", { name: /View Job Listing/i });
    expect(viewJobBtn).toBeInTheDocument();

    const withdrawBtn = screen.getByRole("button", { name: /Withdraw/i });
    expect(withdrawBtn).toBeInTheDocument();
  });

  it("handles code challenge scenario", async () => {
    getApplicationById.mockResolvedValue({
      data: {
        _id: "testAppId123",
        status: "code challenge",
        coverLetter: "Cover letter text",
        submittedAt: "2025-03-09T12:00:00Z",
        job: {},
      },
    });

    render(<SingleApplicationPage />);

    await waitFor(() => {
      expect(screen.getByText("Application Details")).toBeInTheDocument();
    });

    const assessmentBtn = screen.getByRole("button", { name: /Proceed to assessment/i });
    expect(assessmentBtn).toBeInTheDocument();
  });

  it("withdraws application and navigates away", async () => {
    getApplicationById.mockResolvedValue({
      data: {
        _id: "testAppId123",
        status: "applied",
        coverLetter: "My cover letter text",
        submittedAt: "2025-03-09T12:00:00Z",
        job: { _id: "abc123", title: "Example Job" },
      },
    });
    withdrawApplication.mockResolvedValue("Application withdrawn successfully!");

    render(<SingleApplicationPage />);
    await waitFor(() => {
      expect(screen.getByText("Application Details")).toBeInTheDocument();
    });

    const withdrawBtn = screen.getByRole("button", { name: /Withdraw/i });
    expect(withdrawBtn).toBeInTheDocument();

    vi.spyOn(window, "confirm").mockReturnValue(true);

    fireEvent.click(withdrawBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/user/applications");
    });
  });
});
