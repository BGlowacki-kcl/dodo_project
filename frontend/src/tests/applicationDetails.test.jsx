import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ApplicationDetails from "../components/ApplicationDetails";

describe("ApplicationDetails Component", () => {
  const mockProps = {
    coverLetter: "Dear employer, I am excited to apply...",
    questions: [
      { _id: "q1", questionText: "Why do you want this job?" },
      { _id: "q2", questionText: "What are your strengths?" }
    ],
    answers: [
      { questionId: "q1", answerText: "I am passionate about tech." },
      { questionId: "q2", answerText: "I am a quick learner." }
    ],
    codeAssessment: {
      assessments: [
        { _id: "a1", title: "FizzBuzz", description: "Implement FizzBuzz." }
      ],
      submissions: [
        { assessment: "a1", solutionCode: "function fizzBuzz() {}", score: 100 }
      ]
    }
  };

  test("renders cover letter", () => {
    render(<ApplicationDetails {...mockProps} />);
    expect(screen.getByText("Cover Letter")).toBeInTheDocument();
    expect(screen.getByText(/Dear employer/i)).toBeInTheDocument();
  });

  test("renders and toggles question answers", () => {
    render(<ApplicationDetails {...mockProps} />);
    const questionButton = screen.getByText("Why do you want this job?");
    fireEvent.click(questionButton);
    expect(screen.getByText("I am passionate about tech.")).toBeInTheDocument();
    fireEvent.click(questionButton);
    expect(screen.queryByText("I am passionate about tech.")).not.toBeInTheDocument();
  });

  test("renders fallback text when no cover letter provided", () => {
    render(<ApplicationDetails {...mockProps} coverLetter="" />);
    expect(screen.getByText("No cover letter provided")).toBeInTheDocument();
  });

  test("handles missing submission gracefully", () => {
    const modifiedProps = {
      ...mockProps,
      codeAssessment: {
        assessments: [{ _id: "a2", title: "New Challenge", description: "Test" }],
        submissions: [],
      },
    };
    render(<ApplicationDetails {...modifiedProps} />);
    expect(screen.getByText("No Submission Available")).toBeInTheDocument();
  });

  test("displays message when there are no questions", () => {
    render(<ApplicationDetails {...mockProps} questions={[]} />);
    expect(screen.getByText("No questions available for this job.")).toBeInTheDocument();
  });
  
  test("displays message when there are no code assessments", () => {
    const noAssessmentProps = {
      ...mockProps,
      codeAssessment: {
        assessments: [],
        submissions: [],
      },
    };
    render(<ApplicationDetails {...noAssessmentProps} />);
    expect(screen.getByText("No code challenges available.")).toBeInTheDocument();
  });

  test("renders fallback when answer is missing", () => {
    const propsWithMissingAnswer = {
      ...mockProps,
      answers: [], // no answers
    };
  
    render(<ApplicationDetails {...propsWithMissingAnswer} />);
    
    // Expand a question to see the fallback
    const questionButton = screen.getByText("Why do you want this job?");
    fireEvent.click(questionButton);
  
    expect(screen.getByText("No answer provided")).toBeInTheDocument();
  });
});
