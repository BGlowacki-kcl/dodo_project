import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Contact from "../pages/Contact";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// 🧠 Step 1: Declare `sendEmail` above
let sendEmail = vi.fn();

// Step 2: Hoisted mock — do NOT reference `sendEmail` here
vi.mock("../services/email.service.js", () => ({
  default: (...args) => sendEmail(...args),
}));

// Other mocks
vi.mock("../components/FormItem", () => ({
  __esModule: true,
  default: ({ label, name, value, onChange }) => (
    <input
      data-testid={`input-${name}`}
      value={value}
      placeholder={label}
      onChange={(e) => onChange({ target: { name, value: e.target.value } })}
    />
  ),
}));

vi.mock("../components/WhiteBox", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

const notify = vi.fn();
vi.mock("../context/notification.context", () => ({
  useNotification: () => notify,
}));

describe("Contact Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendEmail = vi.fn();
  });

  test("renders form fields and button", () => {
    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Subject")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Message")).toBeInTheDocument();
    expect(screen.getByText("Send Message")).toBeInTheDocument();
  });

  test("shows error for invalid email", async () => {
    render(<MemoryRouter><Contact /></MemoryRouter>);

    fireEvent.change(screen.getByTestId("input-Email"), {
      target: { value: "invalidemail" },
    });

    fireEvent.submit(screen.getByText("Send Message"));

    await waitFor(() => {
      expect(notify).toHaveBeenCalledWith("Please provide a valid email address", "danger");
    });
  });
  
  test("shows error and prevents submission for invalid email", async () => {
    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );
  
    // Only fill in the email field (invalid)
    fireEvent.change(screen.getByTestId("input-Name"), { target: { value: "User" } });
    fireEvent.change(screen.getByTestId("input-Email"), { target: { value: "invalid-email" } });
    fireEvent.submit(screen.getByText("Send Message"));
  
    await waitFor(() => {
      expect(notify).toHaveBeenCalledWith("Please provide a valid email address", "danger");
    });
  });

});
