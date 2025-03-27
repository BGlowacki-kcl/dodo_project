import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi, describe, test, expect, beforeEach } from "vitest";

import SingleApplicationPage, { getModalMessage } from "../pages/user/SingleApplicationPage";
import { NotificationProvider } from "../context/notification.context";
import * as applicationService from "../services/application.service";

// --- Mocks ---
vi.mock("../services/application.service");
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// --- Mock Data ---
const mockApplication = {
  _id: "app123",
  job: {
    title: "Frontend Developer",
    company: "Techie",
    questions: [{ _id: "q1", questionText: "Why?" }],
  },
  status: "Code Challenge",
  coverLetter: "Here is my letter.",
  submittedAt: new Date("2024-05-01T14:30:00Z").toISOString(),
  answers: [{ questionId: "q1", answerText: "Because!" }],
};

// --- Helper ---
const renderComponent = () => {
  render(
    <NotificationProvider>
      <MemoryRouter initialEntries={["/application/app123"]}>
        <Routes>
          <Route path="/application/:appId" element={<SingleApplicationPage />} />
        </Routes>
      </MemoryRouter>
    </NotificationProvider>
  );
};

describe("SingleApplicationPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    applicationService.getApplicationById.mockResolvedValue(mockApplication);
  });

  test("renders application details and content", async () => {
    renderComponent();

    await screen.findByText(/application details/i);
    expect(screen.getByText(/frontend developer/i)).toBeInTheDocument();
    expect(screen.getByText(/techie/i)).toBeInTheDocument();
    expect(screen.getByText(/here is my letter/i)).toBeInTheDocument();
  });

  test("renders fallback job title and company", async () => {
    const noJobApplication = {
      ...mockApplication,
      job: {
        title: null,
        company: null,
        questions: [],
      },
    };
    applicationService.getApplicationById.mockResolvedValueOnce(noJobApplication);
    renderComponent();

    await screen.findByText("Application Details");
    expect(screen.getByText("Untitled Job")).toBeInTheDocument();
    expect(screen.getByText("Unknown Company")).toBeInTheDocument();
  });

  test("renders date of submission in correct format", async () => {
    renderComponent();
    const dateRegex = /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/;
    await waitFor(() => {
      expect(screen.getByText(dateRegex)).toBeInTheDocument();
    });
  });

  test("opens code assessment modal on badge click", async () => {
    renderComponent();

    const badge = await screen.findByText(/code challenge/i);
    fireEvent.click(badge);

    expect(screen.getByText(/are you sure you want to proceed/i)).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  test("navigates to code assessment on confirmation", async () => {
    renderComponent();
    fireEvent.click(await screen.findByText(/code challenge/i));
    fireEvent.click(screen.getByText("Yes"));
    expect(mockNavigate).toHaveBeenCalledWith("/codeassessment/app123");
  });

  test("closes code assessment modal on 'No'", async () => {
    renderComponent();
    fireEvent.click(await screen.findByText(/code challenge/i));
    fireEvent.click(screen.getByText("No"));

    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeVisible;
    });
  });

  test("navigates to dashboard if application not found", async () => {
    applicationService.getApplicationById.mockResolvedValueOnce(null);
    renderComponent();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/applicant-dashboard");
    });
  });

  test("shows error and navigates to dashboard on fetch error", async () => {
    applicationService.getApplicationById.mockRejectedValueOnce(new Error("Fetch failed"));
    renderComponent();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/applicant-dashboard");
    });
  });

  test("sets codeChallenge to true only if status is 'Code Challenge'", async () => {
    const nonChallengeApp = {
      ...mockApplication,
      status: "In Review",
    };
    applicationService.getApplicationById.mockResolvedValueOnce(nonChallengeApp);
  
    renderComponent();
    await screen.findByText(/application details/i);
  
    // Since it's not "Code Challenge", badge should NOT be clickable
    const badge = screen.getByText(/in review/i);
    fireEvent.click(badge);
  
    expect(
      screen.queryByText(/are you sure you want to proceed to the code assessment/i)
    ).not.toBeInTheDocument();
  });

  test("does not trigger handleAssessment if status !== 'Code Challenge'", async () => {
    const app = { ...mockApplication, status: "Rejected" };
    applicationService.getApplicationById.mockResolvedValueOnce(app);
    renderComponent();
  
    const badge = await screen.findByText(/rejected/i);
    fireEvent.click(badge);
  
    expect(
      screen.queryByText(/are you sure you want to proceed/i)
    ).not.toBeInTheDocument();
  });

  test("ApplicationDetails renders safely with no questions or answers", async () => {
    const appWithoutQnA = {
      ...mockApplication,
      job: {
        ...mockApplication.job,
        questions: null,
      },
      answers: null,
    };
    applicationService.getApplicationById.mockResolvedValueOnce(appWithoutQnA);
  
    renderComponent();
  
    await screen.findByText(/application details/i);
  
    // Should render even if questions/answers are missing
    expect(screen.getByText(/application details/i)).toBeInTheDocument();
  });
});

// -------- getModalMessage Unit Test --------
describe("getModalMessage()", () => {
  const cases = [
    ["Applied", "Congratulations! Your application has been submitted successfully."],
    ["In Review", "Your application is currently under review. Good luck!"],
    ["Shortlisted", "Great news! You have been shortlisted for the next stage."],
    ["Rejected", "Unfortunately, your application was not successful this time. Keep trying!"],
    ["Code Challenge", "You have been invited to complete a code challenge. Click the orange button to proceed."],
    ["Accepted", "Congratulations! Your application has been accepted."],
    ["Something Random", "Your application status has been updated."],
    ["", "Your application status has been updated."],
    [undefined, "Your application status has been updated."],
  ];

  test.each(cases)("returns correct message for '%s'", (input, expected) => {
    expect(getModalMessage(input)).toBe(expected);
  });
});
