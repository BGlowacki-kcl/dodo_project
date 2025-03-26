import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ApplicationCards from "../components/ApplicationCards";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { vi } from "vitest";

// Mock useNavigate from react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockNavigate = vi.fn();
useNavigate.mockImplementation(() => mockNavigate);

const mockApplications = [
  {
    _id: "1",
    status: "Applying",
    submittedAt: "2024-03-20T10:30:00Z",
    job: { _id: "job1", title: "Software Engineer", company: "Tech Inc" },
  },
  {
    _id: "2",
    status: "In Review",
    submittedAt: "2024-03-21T14:45:00Z",
    job: { _id: "job2", title: "Product Manager", company: "Business Co" },
  },
];

describe("ApplicationCards", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  test("renders all applications with correct info", () => {
    render(
      <MemoryRouter>
        <ApplicationCards applications={mockApplications} />
      </MemoryRouter>
    );

    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Tech Inc")).toBeInTheDocument();
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("Business Co")).toBeInTheDocument();
  });

  test("navigates to apply page if status is 'Applying'", () => {
    render(
      <MemoryRouter>
        <ApplicationCards applications={mockApplications} />
      </MemoryRouter>
    );

    const firstCard = screen.getByText("Software Engineer").closest("div");
    fireEvent.click(firstCard);

    expect(mockNavigate).toHaveBeenCalledWith("/apply/job1");
  });

  test("navigates to application details page for other statuses", () => {
    render(
      <MemoryRouter>
        <ApplicationCards applications={mockApplications} />
      </MemoryRouter>
    );

    const secondCard = screen.getByText("Product Manager").closest("div");
    fireEvent.click(secondCard);

    expect(mockNavigate).toHaveBeenCalledWith("/user/applications/2");
  });
});
