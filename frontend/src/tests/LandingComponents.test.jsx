import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { Box, ComboBox } from "../components/LandingComponents";

describe("LandingComponents", () => {
  describe("Box Component", () => {
    const mockOnClick = vi.fn();
    const mockImage = "https://example.com/image.jpg";
    const mockText = "Job Openings";
    const mockCounter = 42;

    it("calls onClick handler when box is clicked", () => {
      render(<Box image={mockImage} text={mockText} onClick={mockOnClick} counter={mockCounter} />);

      const box = screen.getByText(mockCounter).closest("div");
      fireEvent.click(box);

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe("ComboBox Component", () => {
    const mockOptions = ["Software Engineer", "Product Manager", "Data Scientist"];
    const mockOnSelect = vi.fn();
    const mockLabel = "Job Role";

    it("renders input with placeholder", () => {
      render(<ComboBox label={mockLabel} options={mockOptions} onSelect={mockOnSelect} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", `Select a ${mockLabel}...`);
      expect(input).toHaveClass("w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500");
    });
  });
});