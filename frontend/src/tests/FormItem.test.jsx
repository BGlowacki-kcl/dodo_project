import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import FormItem from "../components/FormItem";

describe("FormItem", () => {
  it("renders an input with label when largeArena is false", () => {
    const mockOnChange = vi.fn();
    render(
      <FormItem
        htmlFor="name"
        name="Name"
        value="John Doe"
        onChange={mockOnChange}
        largeArena={false}
      />
    );

    const label = screen.getByText("Name");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "name");

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "Name"); // Match the capitalized name prop
    expect(input).toHaveAttribute("name", "Name");
    expect(input).toHaveValue("John Doe");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveClass("w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500");
    expect(input).toHaveAttribute("required");
    expect(input.tagName).toBe("INPUT");
  });

  it("renders a textarea with label when largeArena is true", () => {
    const mockOnChange = vi.fn();
    render(
      <FormItem
        htmlFor="description"
        name="Description"
        value="This is a description."
        onChange={mockOnChange}
        largeArena={true}
      />
    );

    const label = screen.getByText("Description");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "description");

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("id", "Description"); // Match the capitalized name prop
    expect(textarea).toHaveAttribute("name", "Description");
    expect(textarea).toHaveValue("This is a description.");
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveClass("w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none");
    expect(textarea).toHaveAttribute("required");
  });

  it("calls onChange handler when input value changes", () => {
    const ControlledFormItem = () => {
      const [value, setValue] = useState("John Doe");
      return (
        <FormItem
          htmlFor="name"
          name="Name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          largeArena={false}
        />
      );
    };

    render(<ControlledFormItem />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("John Doe");

    fireEvent.change(input, { target: { value: "Jane Doe" } });
    expect(input).toHaveValue("Jane Doe");
  });

  it("calls onChange handler when textarea value changes", () => {
    const ControlledFormItem = () => {
      const [value, setValue] = useState("This is a description.");
      return (
        <FormItem
          htmlFor="description"
          name="Description"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          largeArena={true}
        />
      );
    };

    render(<ControlledFormItem />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("This is a description.");

    fireEvent.change(textarea, { target: { value: "Updated description." } });
    expect(textarea).toHaveValue("Updated description.");
  });
});