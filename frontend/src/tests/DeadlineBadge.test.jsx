import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import DeadlineBadge from "../components/DeadlineBadge";

// Mock Date to control the current date
const mockCurrentDate = new Date("2025-03-26T00:00:00Z");
vi.setSystemTime(mockCurrentDate);

describe("DeadlineBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'No deadline' when deadline is not provided", () => {
    render(<DeadlineBadge deadline={null} />);

    expect(screen.getByText("Deadline:")).toBeInTheDocument();
    expect(screen.getByText("No deadline")).toBeInTheDocument();
    const badge = screen.getByText("No deadline");
    expect(badge).toHaveClass("bg-red-200", "text-red-800");
  });

  it("renders 'No deadline' when deadline is undefined", () => {
    render(<DeadlineBadge deadline={undefined} />);

    expect(screen.getByText("Deadline:")).toBeInTheDocument();
    expect(screen.getByText("No deadline")).toBeInTheDocument();
    const badge = screen.getByText("No deadline");
    expect(badge).toHaveClass("bg-red-200", "text-red-800");
  });

  it("renders 'No deadline' when deadline is empty", () => {
    render(<DeadlineBadge deadline="" />);

    expect(screen.getByText("Deadline:")).toBeInTheDocument();
    expect(screen.getByText("No deadline")).toBeInTheDocument();
    const badge = screen.getByText("No deadline");
    expect(badge).toHaveClass("bg-red-200", "text-red-800");
  });

  it("renders 'Deadline Passed' when deadline has passed", () => {
    const pastDeadline = "2025-03-25T00:00:00Z"; // 1 day before current date
    render(<DeadlineBadge deadline={pastDeadline} />);

    expect(screen.getByText("Deadline:")).toBeInTheDocument();
    expect(screen.getByText("Deadline Passed")).toBeInTheDocument();
    const badge = screen.getByText("Deadline Passed");
    expect(badge).toHaveClass("bg-red-200", "text-red-800");
    expect(badge).toHaveAttribute("title", "Deadline was: 25/03/2025");
  });

  it("renders '1 Week Remaining' when deadline is exactly 7 days away", () => {
    const oneWeekAway = "2025-04-02T00:00:00Z"; // 7 days after current date
    render(<DeadlineBadge deadline={oneWeekAway} />);

    expect(screen.getByText("Deadline:")).toBeInTheDocument();
    expect(screen.getByText("1 Week Remaining")).toBeInTheDocument();
    const badge = screen.getByText("1 Week Remaining");
    expect(badge).toHaveClass("bg-orange-200", "text-orange-800");
    expect(badge).toHaveAttribute("title", "7 days left until the deadline");
  });

  it("renders deadline date when deadline is not passed and not 7 days away", () => {
    const futureDeadline = "2025-04-01T00:00:00Z"; // 6 days after current date
    render(<DeadlineBadge deadline={futureDeadline} />);

    expect(screen.getByText("Deadline:")).toBeInTheDocument();
    expect(screen.getByText("01/04/2025")).toBeInTheDocument();
    const badge = screen.getByText("01/04/2025");
    expect(badge).toHaveClass("bg-green-200", "text-green-800");
    expect(badge).toHaveAttribute("title", "6 days left until the deadline");
  });

  it("renders deadline date for 1 day away", () => {
    const oneDayAway = "2025-03-27T00:00:00Z"; // 1 day after current date
    render(<DeadlineBadge deadline={oneDayAway} />);

    expect(screen.getByText("Deadline:")).toBeInTheDocument();
    expect(screen.getByText("27/03/2025")).toBeInTheDocument();
    const badge = screen.getByText("27/03/2025");
    expect(badge).toHaveClass("bg-green-200", "text-green-800");
    expect(badge).toHaveAttribute("title", "1 day left until the deadline");
  });

  it("renders deadline date for today (0 days away)", () => {
    const today = "2025-03-26T00:00:00Z"; // Same as current date
    render(<DeadlineBadge deadline={today} />);

    expect(screen.getByText("Deadline:")).toBeInTheDocument();
    expect(screen.getByText("26/03/2025")).toBeInTheDocument();
    const badge = screen.getByText("26/03/2025");
    expect(badge).toHaveClass("bg-green-200", "text-green-800");
    expect(badge).toHaveAttribute("title", "0 days left until the deadline");
  });

  it("renders 'Deadline Passed' for 1 day past deadline", () => {
    const oneDayPast = "2025-03-25T00:00:00Z"; // 1 day before current date
    render(<DeadlineBadge deadline={oneDayPast} />);

    expect(screen.getByText("Deadline:")).toBeInTheDocument();
    expect(screen.getByText("Deadline Passed")).toBeInTheDocument();
    const badge = screen.getByText("Deadline Passed");
    expect(badge).toHaveClass("bg-red-200", "text-red-800");
    expect(badge).toHaveAttribute("title", "Deadline was: 25/03/2025");
  });
});