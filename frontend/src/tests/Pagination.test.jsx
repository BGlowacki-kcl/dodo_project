import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Pagination from "../components/Pagination";

describe("Pagination Component", () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it("should not render when pageCount is 0", () => {
    const { container } = render(
      <Pagination pageCount={0} onPageChange={mockOnPageChange} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it("should not render when pageCount is 1", () => {
    const { container } = render(
      <Pagination pageCount={1} onPageChange={mockOnPageChange} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it("should render when pageCount is greater than 1", () => {
    render(<Pagination pageCount={3} onPageChange={mockOnPageChange} />);
    
    expect(screen.getByText("← Prev")).toBeInTheDocument();
    expect(screen.getByText("Next →")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should call onPageChange when a page is clicked", () => {
    render(<Pagination pageCount={3} onPageChange={mockOnPageChange} />);
    
    const page2 = screen.getByText("2");
    fireEvent.click(page2);
    
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
    // onPageChange from ReactPaginate passes an object with selected property
    expect(mockOnPageChange.mock.calls[0][0]).toHaveProperty("selected");
  });

  it("should call onPageChange when next button is clicked", () => {
    render(<Pagination pageCount={3} onPageChange={mockOnPageChange} />);
    
    const nextButton = screen.getByText("Next →");
    fireEvent.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
  });

  it("should call onPageChange when prev button is clicked", () => {
    render(<Pagination pageCount={3} onPageChange={mockOnPageChange} />);
    
    // First navigate to page 2 so that the "Prev" button will have an effect
    const page2 = screen.getByText("2");
    fireEvent.click(page2);
    
    // Clear the mock to reset the call count
    mockOnPageChange.mockClear();
    
    // Now clicking the Prev button should navigate back to page 1
    const prevButton = screen.getByText("← Prev");
    fireEvent.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
  });
});
