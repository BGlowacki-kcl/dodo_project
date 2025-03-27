import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ApplicationDetails from "../components/ApplicationDetails";
import WhiteBox from "../components/WhiteBox";

// Mock WhiteBox component
vi.mock("../components/WhiteBox", () => ({
  default: vi.fn(({ children, className }) => (
    <div className={`white-box ${className}`} data-testid="white-box">
      {children}
    </div>
  )),
}));

// Mock react-icons
vi.mock("react-icons/fa", () => ({
  FaFileAlt: () => <span data-testid="file-icon" />,
  FaQuestionCircle: () => <span data-testid="question-icon" />,
  FaCode: () => <span data-testid="code-icon" />,
}));

describe("ApplicationDetails", () => {
  const mockQuestions = [
    { _id: "q1", questionText: "Why do you want this job?" },
    { _id: "q2", questionText: "What are your strengths?" },
  ];

  const mockAnswers = [
    { questionId: "q1", answerText: "I am passionate about this role." },
    { questionId: "q2", answerText: "I am a hard worker." },
  ];

  const mockCodeAssessment = {
    assessments: [
      {
        _id: "assess1",
        title: "Coding Test 1",
        description: "Write a function to reverse a string.",
      },
    ],
    submissions: [
      {
        assessment: "assess1",
        solutionCode: "function reverse(str) { return str.split('').reverse().join(''); }",
        score: 85,
      },
    ],
  };

  it("renders cover letter section with provided text", () => {
    render(
      <ApplicationDetails
        coverLetter="This is my cover letter."
        questions={[]}
        answers={[]}
        codeAssessment={null}
      />
    );

    expect(screen.getByText("Cover Letter")).toBeInTheDocument();
    expect(screen.getByTestId("file-icon")).toBeInTheDocument();
    expect(screen.getByText("This is my cover letter.")).toBeInTheDocument();
  });

  it("renders cover letter fallback when coverLetter is empty", () => {
    render(
      <ApplicationDetails
        coverLetter=""
        questions={[]}
        answers={[]}
        codeAssessment={null}
      />
    );

    expect(screen.getByText("No cover letter provided")).toBeInTheDocument();
  });

  it("renders questions and answers section with questions", () => {
    render(
      <ApplicationDetails
        coverLetter="Test cover letter"
        questions={mockQuestions}
        answers={mockAnswers}
        codeAssessment={null}
      />
    );

    expect(screen.getByText("Questions and Answers")).toBeInTheDocument();
    expect(screen.getByTestId("question-icon")).toBeInTheDocument();
    expect(screen.getByText("Why do you want this job?")).toBeInTheDocument();
    expect(screen.getByText("What are your strengths?")).toBeInTheDocument();

    expect(screen.queryByText("I am passionate about this role.")).not.toBeInTheDocument();
  });

  it("toggles question answer on click", () => {
    render(
      <ApplicationDetails
        coverLetter="Test cover letter"
        questions={mockQuestions}
        answers={mockAnswers}
        codeAssessment={null}
      />
    );

    const questionButton = screen.getByText("Why do you want this job?");
    fireEvent.click(questionButton);

    expect(screen.getByText("I am passionate about this role.")).toBeInTheDocument();

    fireEvent.click(questionButton);
    expect(screen.queryByText("I am passionate about this role.")).not.toBeInTheDocument();
  });

  it("shows fallback when no questions are available", () => {
    render(
      <ApplicationDetails
        coverLetter="Test cover letter"
        questions={[]}
        answers={[]}
        codeAssessment={null}
      />
    );

    expect(screen.getByText("No questions available for this job.")).toBeInTheDocument();
  });

  it("renders answer fallback when no answer is provided", () => {
    const answersWithMissing = [{ questionId: "q2", answerText: "I am a hard worker." }];

    render(
      <ApplicationDetails
        coverLetter="Test cover letter"
        questions={mockQuestions}
        answers={answersWithMissing}
        codeAssessment={null}
      />
    );

    const questionButton = screen.getByText("Why do you want this job?");
    fireEvent.click(questionButton);

    expect(screen.getByText("No answer provided")).toBeInTheDocument();
  });

  it("renders code assessment section with assessments and submissions", () => {
    render(
      <ApplicationDetails
        coverLetter="Test cover letter"
        questions={[]}
        answers={[]}
        codeAssessment={mockCodeAssessment}
        showCodeAssessment={true}
      />
    );

    expect(screen.getByText("Code Assessment")).toBeInTheDocument();
    expect(screen.getByTestId("code-icon")).toBeInTheDocument();
    expect(screen.getByText("Coding Test 1")).toBeInTheDocument();
    expect(screen.getByText("Write a function to reverse a string.")).toBeInTheDocument();
    expect(screen.getByText("Submitted Code:")).toBeInTheDocument();
    expect(screen.getByText("function reverse(str) { return str.split('').reverse().join(''); }")).toBeInTheDocument();
    // Match the score text using a function to handle the <strong> tag
    expect(screen.getByText((content, element) => {
      return element.textContent === "Score: 85";
    })).toBeInTheDocument();
  });

  it("shows fallback when no code assessments are available", () => {
    render(
      <ApplicationDetails
        coverLetter="Test cover letter"
        questions={[]}
        answers={[]}
        codeAssessment={{ assessments: [] }}
        showCodeAssessment={true}
      />
    );

    expect(screen.getByText("No code challenges available.")).toBeInTheDocument();
  });

  it("shows fallback when no submission is available for an assessment", () => {
    const codeAssessmentNoSubmission = {
      assessments: [
        {
          _id: "assess2",
          title: "Coding Test 2",
          description: "Write a function to sort an array.",
        },
      ],
      submissions: [],
    };

    render(
      <ApplicationDetails
        coverLetter="Test cover letter"
        questions={[]}
        answers={[]}
        codeAssessment={codeAssessmentNoSubmission}
        showCodeAssessment={true}
      />
    );

    expect(screen.getByText("No Submission Available")).toBeInTheDocument();
  });

  it("does not render code assessment section when showCodeAssessment is false", () => {
    render(
      <ApplicationDetails
        coverLetter="Test cover letter"
        questions={[]}
        answers={[]}
        codeAssessment={mockCodeAssessment}
        showCodeAssessment={false}
      />
    );

    expect(screen.queryByText("Code Assessment")).not.toBeInTheDocument();
    expect(screen.queryByTestId("code-icon")).not.toBeInTheDocument();
  });
});