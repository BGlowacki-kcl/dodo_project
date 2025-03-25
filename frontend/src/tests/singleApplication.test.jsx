import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import SingleApplicationPage from "../pages/user/SingleApplicationPage";
import * as applicationService from "../services/applicationService";
import { NotificationProvider } from "../context/notification.context";
import { vi } from "vitest";

// Mock useNavigate and application service
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock("../services/applicationService");

const mockApplication = {
  _id: "123",
  job: {
    title: "Example Job Title",
    company: "Example Company",
    questions: [{ _id: "q1", questionText: "Why do you want this job?" }],
  },
  status: "Code Challenge",
  coverLetter: "I am very interested in this role.",
  submittedAt: new Date().toISOString(),
  answers: [{ questionId: "q1", answerText: "Because I love challenges." }],
};

describe("SingleApplicationPage", () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    applicationService.getApplicationById.mockResolvedValue(mockApplication);
    useNavigate.mockImplementation(() => navigate);
  });

  const renderComponent = () => {
    render(
      <NotificationProvider>
        <MemoryRouter initialEntries={["/application/123"]}>
          <Routes>
            <Route path="/application/:appId" element={<SingleApplicationPage />} />
          </Routes>
        </MemoryRouter>
      </NotificationProvider>
    );
  };

  test("displays application details after fetching", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/application details/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/example job title/i)).toBeInTheDocument();
    expect(screen.getByText(/example company/i)).toBeInTheDocument();
    expect(screen.getByText(/cover letter/i)).toBeInTheDocument();
    expect(screen.getByText(/i am very interested in this role/i)).toBeInTheDocument();
  });

  test("handles code challenge scenario", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/code challenge/i)).toBeInTheDocument();
    });

    const badge = screen.getByText(/code challenge/i);
    fireEvent.click(badge);

    await waitFor(() => {
      expect(
        screen.getByText(/are you sure you want to proceed to the code assessment/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /no/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /yes/i }));
    expect(navigate).toHaveBeenCalledWith("/codeassessment/123");
  });
});
