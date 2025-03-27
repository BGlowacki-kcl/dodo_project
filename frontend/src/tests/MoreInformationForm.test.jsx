import React from "react";
import { render, screen } from "@testing-library/react";
import renderData from "../components/MoreInformationForm"; // Adjust the path as needed

describe("renderData", () => {
  const mockData = {
    personal: {
      name: "John",
      surname: "Doe",
      location: "New York",
      "portfolio website": "https://portfolio.com",
      "LinkedIn website": "https://linkedin.com/in/johndoe",
      "GitHub website": "https://github.com/johndoe",
    },
    experience: [
      {
        company: "Tech Corp",
        position: "Software Engineer",
        skills: "JavaScript, React",
        "start date": "2020-01",
        "end date": "2022-12",
        description: "Developed web applications.",
      },
    ],
    education: [
      {
        University: "State University",
        Major: "Computer Science",
        Degree: "Bachelor's",
        "start date": "2016-09",
        "end date": "2020-05",
      },
    ],
    projects: [
      {
        name: "Project X",
        skills: "Python, Django",
        description: "A web app for task management.",
      },
    ],
  };

  it("returns null when text is not provided", () => {
    const result = renderData(null);
    expect(result).toBeNull();
  });

  it("renders the parsed resume container with correct styles", () => {
    render(<>{renderData(mockData)}</>);

    const container = screen.getByText("Parsed Resume").closest("div");
    expect(container).toHaveClass("border-2 border-black p-4 mt-4 w-96");
  });

  it("renders section headers", () => {
    render(<>{renderData(mockData)}</>);

    const parsedResumeHeader = screen.getByText("Parsed Resume");
    expect(parsedResumeHeader).toBeInTheDocument();
    expect(parsedResumeHeader).toHaveClass("text-lg font-bold");

    const personalHeader = screen.getByText("Personal Information");
    expect(personalHeader).toBeInTheDocument();
    expect(personalHeader).toHaveClass("font-semibold mt-2");

    const experienceHeader = screen.getByText("Experience");
    expect(experienceHeader).toBeInTheDocument();
    expect(experienceHeader).toHaveClass("font-semibold mt-2");

    const educationHeader = screen.getByText("Education");
    expect(educationHeader).toBeInTheDocument();
    expect(educationHeader).toHaveClass("font-semibold mt-2");

    const projectsHeader = screen.getByText("Projects");
    expect(projectsHeader).toBeInTheDocument();
    expect(projectsHeader).toHaveClass("font-semibold mt-2");
  });
});