import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import JobCard from "../components/JobCard";
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
  const handleRemoveFromShortlist = vi.fn();
  const showNotification = vi.fn();

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
        handleRemoveFromShortlist={handleRemoveFromShortlist}
        showNotification={showNotification}
      />
    );

    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText(/Company:/)).toBeInTheDocument();
    expect(screen.getByText(/Location:/)).toBeInTheDocument();
    expect(screen.getByText(/Type:/)).toBeInTheDocument();
    expect(screen.getByText(/Requirements:/)).toBeInTheDocument();
  });

  test("calls handleJobClick when card is clicked", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={false}
        isShortlisted={false}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
        handleRemoveFromShortlist={handleRemoveFromShortlist}
        showNotification={showNotification}
      />
    );

    fireEvent.click(screen.getByText("Frontend Developer"));
    expect(handleJobClick).toHaveBeenCalledWith("job1");
  });

  test("does not show shortlist buttons if not logged in", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={false}
        isShortlisted={false}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
        handleRemoveFromShortlist={handleRemoveFromShortlist}
        showNotification={showNotification}
      />
    );

    expect(screen.queryByTitle(/add to shortlist/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/remove from shortlist/i)).not.toBeInTheDocument();
  });

  test("shows add-to-shortlist button when logged in and not shortlisted", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={true}
        isShortlisted={false}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
        handleRemoveFromShortlist={handleRemoveFromShortlist}
        showNotification={showNotification}
      />
    );

    const addButton = screen.getByTitle(/add to shortlist/i);
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    expect(handleAddToShortlist).toHaveBeenCalledWith("job1");
    expect(showNotification).toHaveBeenCalledWith("Job added to shortlist", "success");
    expect(handleJobClick).not.toHaveBeenCalled(); // confirm click doesn't bubble
  });

  test("shows remove-from-shortlist button when already shortlisted", () => {
    render(
      <JobCard
        job={mockJob}
        isLoggedIn={true}
        isShortlisted={true}
        handleJobClick={handleJobClick}
        handleAddToShortlist={handleAddToShortlist}
        handleRemoveFromShortlist={handleRemoveFromShortlist}
        showNotification={showNotification}
      />
    );

    const removeButton = screen.getByTitle(/remove from shortlist/i);
    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);

    expect(handleRemoveFromShortlist).toHaveBeenCalledWith("job1");
    expect(showNotification).toHaveBeenCalledWith("Job removed from shortlist", "success");
    expect(handleJobClick).not.toHaveBeenCalled(); // ensure click doesn't bubble
  });

  test("shows joined requirements when job.requirements is an array", () => {
    render(
      <JobCard
        job={{
          ...mockJob,
          requirements: ["React", "JavaScript", "CSS"],
        }}
        isLoggedIn={false}
        isShortlisted={false}
        handleJobClick={vi.fn()}
        handleAddToShortlist={vi.fn()}
        handleRemoveFromShortlist={vi.fn()}
        showNotification={vi.fn()}
      />
    );
  
    expect(
      screen.getByText((_, element) =>
        element?.textContent === "Requirements: React, JavaScript, CSS"
      )
    ).toBeInTheDocument();
  });
  
  test("shows 'Not specified' when job.requirements is not an array", () => {
    render(
      <JobCard
        job={{
          ...mockJob,
          requirements: null,
        }}
        isLoggedIn={false}
        isShortlisted={false}
        handleJobClick={vi.fn()}
        handleAddToShortlist={vi.fn()}
        handleRemoveFromShortlist={vi.fn()}
        showNotification={vi.fn()}
      />
    );
  
    expect(
      screen.getByText((_, element) =>
        element?.textContent === "Requirements: Not specified"
      )
    ).toBeInTheDocument();
  });  
});
