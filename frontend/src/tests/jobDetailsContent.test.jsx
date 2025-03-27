import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import JobDetailsContent from "../components/JobDetailsContent";
import { vi } from "vitest";

// Mock the updateJob function
vi.mock("../services/job.service", () => ({
  updateJob: vi.fn((id, updates) => Promise.resolve({ _id: id, ...updates })),
}));

import { updateJob } from "../services/job.service";

const mockJob = {
  _id: "job1",
  title: "Developer",
  company: "Tech Corp",
  location: "Remote",
  employmentType: "Full-time",
  experienceLevel: "Mid",
  description: "Build great stuff.",
  salaryRange: { min: 40000, max: 60000 },
  requirements: ["JavaScript", "React"],
  questions: [{ questionText: "Why do you want this job?" }],
  assessments: [{ title: "Technical Test" }],
};

describe("JobDetailsContent", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders job details", () => {
    render(<JobDetailsContent job={mockJob} isEmployer={false} />);
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("£40000 - £60000")).toBeInTheDocument();
    expect(screen.getByText("Mid")).toBeInTheDocument();
    expect(screen.getByText("Build great stuff.")).toBeInTheDocument();
  });

  test("renders fallback when no job passed", () => {
    render(<JobDetailsContent job={null} isEmployer={false} />);
    expect(screen.getByText(/no job details available/i)).toBeInTheDocument();
  });

  test("renders fallback salary if undefined", () => {
    const noSalaryJob = { ...mockJob, salaryRange: null };
    render(<JobDetailsContent job={noSalaryJob} isEmployer={false} />);
    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });

  test("renders requirements and fallbacks", () => {
    render(<JobDetailsContent job={mockJob} isEmployer={false} />);
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();

    const jobWithNoReqs = { ...mockJob, requirements: [] };
    render(<JobDetailsContent job={jobWithNoReqs} isEmployer={false} />);
    expect(screen.getByText(/no requirements needed/i)).toBeInTheDocument();
  });

  test("renders questions and assessments", () => {
    render(<JobDetailsContent job={mockJob} isEmployer={false} />);
    expect(screen.getByText(/yes, this job requires answering questions/i)).toBeInTheDocument();
    expect(screen.getByText(/yes, this job requires taking an assessment/i)).toBeInTheDocument();

    const jobWithNone = { ...mockJob, questions: [], assessments: [] };
    render(<JobDetailsContent job={jobWithNone} isEmployer={false} />);
    expect(screen.getByText(/no, this job does not require answering questions/i)).toBeInTheDocument();
    expect(screen.getByText(/no, this job does not require taking an assessment/i)).toBeInTheDocument();
  });

  test("employer can edit and save description", async () => {
    render(<JobDetailsContent job={mockJob} isEmployer={true} />);
    const section = screen.getByText(/job description/i).closest("div");
    const editBtn = within(section).getByRole("button");

    fireEvent.click(editBtn);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Updated description" } });

    fireEvent.click(within(section).getByRole("button"));
    await waitFor(() => {
      expect(updateJob).toHaveBeenCalledWith("job1", { description: "Updated description" });
    });
  });

  test("shows alert if saving job description fails", async () => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
    updateJob.mockRejectedValueOnce(new Error("Save failed"));

    render(<JobDetailsContent job={mockJob} isEmployer={true} />);
    const section = screen.getByText(/job description/i).closest("div");
    fireEvent.click(within(section).getByRole("button"));

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "New Desc" } });
    fireEvent.click(within(section).getByRole("button"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to save the job description. Please try again.");
    });
    window.alert.mockRestore();
  });

  test("toggles salary editing mode", async () => {
    render(<JobDetailsContent job={mockJob} isEmployer={true} />);
    const salarySection = screen.getByText(/salary/i).closest("div");
    const editBtn = within(salarySection).getByRole("button");

    fireEvent.click(editBtn);
    expect(await screen.findByPlaceholderText("Min Salary")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Max Salary")).toBeInTheDocument();
  });

  test("allows editing and saving salary", async () => {
    const jobCopy = {
      ...mockJob,
      salaryRange: { min: 40000, max: 60000 },
    };

    updateJob.mockResolvedValueOnce({
      ...jobCopy,
      salaryRange: { min: 50000, max: 80000 },
    });

    render(<JobDetailsContent job={jobCopy} isEmployer={true} />);
    const salarySection = screen.getByText(/salary/i).closest("div");
    const editBtn = within(salarySection).getByRole("button");
    fireEvent.click(editBtn);

    const minInput = screen.getByPlaceholderText("Min Salary");
    const maxInput = screen.getByPlaceholderText("Max Salary");

    fireEvent.change(minInput, { target: { value: "50000" } });
    fireEvent.change(maxInput, { target: { value: "80000" } });

    fireEvent.click(within(salarySection).getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("£50000 - £80000")).toBeInTheDocument();
    });
  });

  test("shows alert if saving salary fails", async () => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
    updateJob.mockRejectedValueOnce(new Error("Save failed"));

    render(<JobDetailsContent job={mockJob} isEmployer={true} />);
    const salarySection = screen.getByText(/salary/i).closest("div");
    const editButton = within(salarySection).getByRole("button");

    fireEvent.click(editButton);
    fireEvent.change(screen.getByPlaceholderText("Min Salary"), { target: { value: "30000" } });
    fireEvent.change(screen.getByPlaceholderText("Max Salary"), { target: { value: "50000" } });

    fireEvent.click(within(salarySection).getByRole("button"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Failed to save the salary range. Please try again.");
    });

    window.alert.mockRestore();
  });

  test("displays fallback for missing experience level", () => {
    const jobWithNoExperience = { ...mockJob, experienceLevel: "" };
    render(<JobDetailsContent job={jobWithNoExperience} isEmployer={false} />);
    expect(screen.getByText("Not specified")).toBeInTheDocument();
  });  
});
