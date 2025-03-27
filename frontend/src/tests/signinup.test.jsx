import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";
import AuthForm from "../pages/SignInUp";
import { authService } from "../services/auth.service";
import { useNotification } from "../context/notification.context";

vi.mock("../services/auth.service", () => ({
  authService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
  },
}));

vi.mock("../context/notification.context", () => ({
  useNotification: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("AuthForm Component Tests", () => {
  let notify;

  beforeEach(() => {
    notify = vi.fn();
    useNotification.mockReturnValue(notify);
    authService.signIn.mockReset();
    authService.signUp.mockReset();
  });

  const renderWithRoute = (path) => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/signin" element={<AuthForm />} />
          <Route path="/signup" element={<AuthForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("displays sign-in form elements", () => {
    renderWithRoute("/signin");

    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Confirm your password")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("displays sign-up form elements", () => {
    renderWithRoute("/signup");

    expect(screen.getByText("Create Job Seeker Account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("handles successful sign-in with notification", async () => {
    authService.signIn.mockResolvedValue({ message: "Sign-in success" });

    renderWithRoute("/signin");

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "SecurePass1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(authService.signIn).toHaveBeenCalledWith(
        "user@example.com",
        "SecurePass1",
        expect.any(Function),
        "jobSeeker"
      );
      expect(notify).toHaveBeenCalledWith("Sign-in success", "success");
    });
  });

  it("handles successful sign-up with notification", async () => {
    authService.signUp.mockResolvedValue({ message: "Sign-up complete" });

    renderWithRoute("/signup");

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "StrongPass123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: "StrongPass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(authService.signUp).toHaveBeenCalledWith(
        "newuser@example.com",
        "StrongPass123",
        false,
        expect.any(Function)
      );
      expect(notify).toHaveBeenCalledWith("Sign-up complete", "success");
    });
  });

  it("rejects mismatched passwords during sign-up", async () => {
    renderWithRoute("/signup");

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "Pass123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: "Pass456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
      expect(notify).toHaveBeenCalledWith("Passwords do not match.", "error");
      expect(authService.signUp).not.toHaveBeenCalled();
    });
  });

  it("displays error on sign-in failure", async () => {
    authService.signIn.mockRejectedValue(new Error("Invalid login"));

    renderWithRoute("/signin");

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "WrongPass1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid login")).toBeInTheDocument();
      expect(notify).toHaveBeenCalledWith("Invalid login", "error");
    });
  });

  it("toggles password visibility on click", () => {
    renderWithRoute("/signin");

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const toggleButton = screen.getByTestId("toggle-password");

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});