import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ModalMessages from "../components/ModalMessages";

describe("ModalMessages", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();
  const mockMessage = "Are you sure you want to proceed?";
  const mockConfirmText = "Yes";
  const mockCancelText = "No";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when show is false", () => {
    render(
      <ModalMessages
        show={false}
        onClose={mockOnClose}
        message={mockMessage}
        onConfirm={mockOnConfirm}
        confirmText={mockConfirmText}
        cancelText={mockCancelText}
      />
    );

    expect(screen.queryByText(mockMessage)).not.toBeInTheDocument();
    expect(screen.queryByText(mockConfirmText)).not.toBeInTheDocument();
    expect(screen.queryByText(mockCancelText)).not.toBeInTheDocument();
  });

  it("renders modal with message and buttons when show is true", () => {
    render(
      <ModalMessages
        show={true}
        onClose={mockOnClose}
        message={mockMessage}
        onConfirm={mockOnConfirm}
        confirmText={mockConfirmText}
        cancelText={mockCancelText}
      />
    );

    const modal = screen.getByText(mockMessage).closest("div").parentElement;
    expect(modal).toHaveClass("fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50");

    const modalContent = screen.getByText(mockMessage).closest("div");
    expect(modalContent).toHaveClass("bg-white p-6 rounded-lg shadow-lg text-center");

    expect(screen.getByText(mockMessage)).toBeInTheDocument();
    expect(screen.getByText(mockMessage)).toHaveClass("text-lg font-semibold mb-4");

    expect(screen.getByText(mockConfirmText)).toBeInTheDocument();
    expect(screen.getByText(mockConfirmText)).toHaveClass("px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700");

    expect(screen.getByText(mockCancelText)).toBeInTheDocument();
    expect(screen.getByText(mockCancelText)).toHaveClass("px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700");
  });

  it("calls onConfirm handler when confirm button is clicked", () => {
    render(
      <ModalMessages
        show={true}
        onClose={mockOnClose}
        message={mockMessage}
        onConfirm={mockOnConfirm}
        confirmText={mockConfirmText}
        cancelText={mockCancelText}
      />
    );

    const confirmButton = screen.getByText(mockConfirmText);
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("calls onClose handler when cancel button is clicked", () => {
    render(
      <ModalMessages
        show={true}
        onClose={mockOnClose}
        message={mockMessage}
        onConfirm={mockOnConfirm}
        confirmText={mockConfirmText}
        cancelText={mockCancelText}
      />
    );

    const cancelButton = screen.getByText(mockCancelText);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("does not render confirm button when onConfirm is not provided", () => {
    render(
      <ModalMessages
        show={true}
        onClose={mockOnClose}
        message={mockMessage}
        onConfirm={null}
        confirmText={mockConfirmText}
        cancelText={mockCancelText}
      />
    );

    expect(screen.queryByText(mockConfirmText)).not.toBeInTheDocument();
    expect(screen.getByText(mockCancelText)).toBeInTheDocument();
  });

  it("uses default button text when confirmText and cancelText are not provided", () => {
    render(
      <ModalMessages
        show={true}
        onClose={mockOnClose}
        message={mockMessage}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });
});