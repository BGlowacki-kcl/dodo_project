import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ApplicantActivity from "../components/Activity";
import * as appService from "../services/application.service";
import { vi } from "vitest";

// Mock useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock Pagination like in SearchResults
vi.mock("../components/Pagination", () => ({
  default: () => <div data-testid="pagination">Pagination</div>,
}));

// Mock ActivityFilter
vi.mock("../components/filters/ActivityFilter", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div>
        <p>Apply Filters</p>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock application data
const mockApplications = [
  {
    _id: "1",
    status: "Applying",
    job: { _id: "101", title: "Frontend Developer" },
  },
  {
    _id: "2",
    status: "Rejected",
    job: { _id: "102", title: "Backend Developer" },
  },
  {
    _id: "3",
    status: "Accepted",
    job: { _id: "103", title: "Full Stack Engineer" },
  },
];

describe("ApplicantActivity Component", () => {
  beforeEach(() => {
    vi.spyOn(appService, "getAllUserApplications").mockResolvedValue(mockApplications);
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <ApplicantActivity userId="user123" />
      </BrowserRouter>
    );

  it("filters applications via search", async () => {
    renderComponent();

    await screen.findByText("Frontend Developer");
    const searchInput = screen.getByPlaceholderText("Search applications...");
    fireEvent.change(searchInput, { target: { value: "Frontend" } });

    expect(screen.queryByText("Backend Developer")).not.toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });

  it("opens and closes the filter modal", async () => {
    renderComponent();

    const filterBtn = screen.getByRole("button", { name: /filters/i });
    fireEvent.click(filterBtn);

    await waitFor(() => {
      expect(screen.getByText("Apply Filters")).toBeInTheDocument();
    });

    const closeBtn = screen.getByText("Close");
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("Apply Filters")).not.toBeInTheDocument();
    });
  });

  it("renders pagination", async () => {
    renderComponent();
    await screen.findByText("Frontend Developer");

    // Match how you tested in SearchResults
    expect(screen.getByTestId("pagination")).toBeInTheDocument();
  });
});
