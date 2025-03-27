import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { Box, ComboBox } from "../components/LandingComponents";

describe("Box Component", () => {
  const mockProps = {
    image: "test-image.jpg",
    text: "Test Job",
    counter: 42,
    onClick: vi.fn(),
  };

  it("renders with the correct content", () => {
    render(<Box {...mockProps} />);
    
    // Check that the text and counter are rendered
    expect(screen.getByText("Test Job")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    
    const boxElement = screen.getByText("Test Job").parentElement;
    expect(boxElement).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    render(<Box {...mockProps} />);
    
    const boxElement = screen.getByText("Test Job").closest("div");
    fireEvent.click(boxElement);
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });
});

describe("ComboBox Component", () => {
  const mockProps = {
    label: "Role",
    options: ["Developer", "Designer", "Manager"],
    onSelect: vi.fn(),
  };

  it("renders with the correct placeholder", () => {
    render(<ComboBox {...mockProps} />);
    
    const input = screen.getByPlaceholderText("Select a Role...");
    expect(input).toBeInTheDocument();
  });

  it("shows dropdown when focused", async () => {
    render(<ComboBox {...mockProps} />);
    
    const input = screen.getByPlaceholderText("Select a Role...");
    fireEvent.focus(input);
    
    await waitFor(() => {
      expect(screen.getByText("Developer")).toBeInTheDocument();
      expect(screen.getByText("Designer")).toBeInTheDocument();
      expect(screen.getByText("Manager")).toBeInTheDocument();
    });
  });

  it("filters options based on input", async () => {
    render(<ComboBox {...mockProps} />);
    
    const input = screen.getByPlaceholderText("Select a Role...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "de" } });
    
    await waitFor(() => {
      expect(screen.getByText("Developer")).toBeInTheDocument();
      expect(screen.getByText("Designer")).toBeInTheDocument();
      expect(screen.queryByText("Manager")).not.toBeInTheDocument();
    });
  });

  it("calls onSelect when option is clicked", async () => {
    render(<ComboBox {...mockProps} />);
    
    const input = screen.getByPlaceholderText("Select a Role...");
    fireEvent.focus(input);
    
    await waitFor(() => {
      const option = screen.getByText("Developer");
      fireEvent.click(option);
    });
    
    expect(mockProps.onSelect).toHaveBeenCalledWith("Developer");
    expect(input).toHaveValue("Developer");
  });
});