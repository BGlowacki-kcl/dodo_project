import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import JobCard from "../components/JobCard"; // adjust path if needed
import { vi } from "vitest";

const mockJob = {
  _id: "job1",
  title: "Frontend Developer",
  company: "Tech Co",
  location: "Remote",
  employmentType: "Full-time",
  requirements: ["React", "JavaScript", "CSS"],
  description: "We are looking for a frontend developer.",
};

describe("JobCard", () => {
  const handleJobClick = vi.fn();
  const handleAddToShortlist = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders job details correctly", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={false}
        isShortlisted={false}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
      />
    );

    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText(/Company:/)).toBeInTheDocument("Company: Tech Co");
    expect(screen.getByText(/Location:/)).toBeInTheDocument("Location: Remote");
    expect(screen.getByText(/Type:/)).toBeInTheDocument("Type: Full-time");
    expect(screen.getByText(/Requirements:/)).toBeInTheDocument("Requirements: React, JavaScript, CSS");
    expect(screen.getByText(/We are looking for a frontend developer/i)).toBeInTheDocument();
  });

  test("calls handleJobClick when card is clicked", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={false}
        isShortlisted={false}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
      />
    );

    fireEvent.click(screen.getByText("Frontend Developer"));
    expect(handleJobClick).toHaveBeenCalledWith("job1");
  });

  test("does not show shortlist button if not logged in", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={false}
        isShortlisted={false}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
      />
    );

    expect(screen.queryByTitle(/add to shortlist/i)).not.toBeInTheDocument();
  });

  test("shows add-to-shortlist button if logged in and not shortlisted", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={true}
        isShortlisted={false}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
      />
    );

    const button = screen.getByTitle(/add to shortlist/i);
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleAddToShortlist).toHaveBeenCalledWith("job1");
  });

  test("clicking add-to-shortlist does not trigger card click", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={true}
        isShortlisted={false}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
      />
    );

    const addButton = screen.getByTitle(/add to shortlist/i);
    fireEvent.click(addButton);
    expect(handleJobClick).not.toHaveBeenCalled();
    expect(handleAddToShortlist).toHaveBeenCalled();
  });

  test("shows tick button if already shortlisted", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={true}
        isShortlisted={true}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
      />
    );

    const button = screen.getByTitle(/already added to shortlist/i);
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("✓");
  });
});
