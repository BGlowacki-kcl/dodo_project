import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AssessmentStatus from "../components/AssessmentStatus";
import { vi } from "vitest";

describe("AssessmentStatus", () => {
  const title = "Assessment 1";

  const statuses = [
    { status: "completed-full", icon: "✅", tooltip: "Completed (Full Marks)" },
    { status: "completed-partial", icon: "🟡", tooltip: "Completed (Not Full Marks)" },
    { status: "attempted", icon: "📝", tooltip: "Attempted (Not Submitted)" },
    { status: "not-submitted", icon: "🔍", tooltip: "Not Submitted" },
  ];

  test("renders correct icon and tooltip for each status", () => {
    statuses.forEach(({ status, icon, tooltip }) => {
      render(<AssessmentStatus status={status} title={title} />);
      expect(screen.getByText(icon)).toBeInTheDocument();
      expect(screen.getByTitle(tooltip)).toBeInTheDocument();
    });
  });

  test("calls onClick when not chosen for all statuses", () => {
    statuses.forEach(({ status, icon }) => {
      const handleClick = vi.fn();
      render(
        <AssessmentStatus
          status={status}
          title={title}
          onClick={handleClick}
          chosen={false}
        />
      );
      fireEvent.click(screen.getByText(icon));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  test("does not call onClick when chosen for all statuses", () => {
    statuses.forEach(({ status, icon }) => {
      const handleClick = vi.fn();
      render(
        <AssessmentStatus
          status={status}
          title={title}
          onClick={handleClick}
          chosen={true}
        />
      );
      fireEvent.click(screen.getByText(icon));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
