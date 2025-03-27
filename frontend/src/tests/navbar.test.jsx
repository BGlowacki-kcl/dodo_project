import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { authService } from "../services/auth.service";
import { useNotification } from "../context/notification.context";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({ children, to, className }) => <a href={to} className={className}>{children}</a>,
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}));

// Mock auth.service
vi.mock("../services/auth.service", () => ({
  authService: {
    signOut: vi.fn(),
  },
}));

// Mock useNotification
vi.mock("../context/notification.context", () => ({
  useNotification: vi.fn(),
}));

describe("Navbar", () => {
  const mockNavigate = vi.fn();
  const mockShowNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ pathname: "/" });
    useNotification.mockReturnValue(mockShowNotification);
    // Mock sessionStorage
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "token") return null;
      if (key === "role") return null;
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders logo and navigation links for guest users", () => {
    render(<Navbar />);

    // Logo
    expect(screen.getByText("Jobirithm")).toBeInTheDocument();
    const logoImg = screen.getByAltText("Logo");
    expect(logoImg).toHaveAttribute("src", "/joborithmLogo.png");
    expect(logoImg).toHaveClass("h-15 w-14");

    // Navigation links for guests
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("All Jobs")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();

    // Ensure employer and logged-in user links are not present
    expect(screen.queryByText("Posts")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Swipe Jobs")).not.toBeInTheDocument();
  });

  it("renders navigation links for logged-in non-employer users", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "token") return "mockToken";
      if (key === "role") return "applicant";
      return null;
    });

    render(<Navbar />);

    // Navigation links for logged-in non-employer users
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("All Jobs")).toBeInTheDocument();
    expect(screen.getByText("Swipe Jobs")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();

    // Ensure employer and guest links are not present
    expect(screen.queryByText("Posts")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("renders navigation links for logged-in employer users", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "token") return "mockToken";
      if (key === "role") return "employer";
      return null;
    });

    render(<Navbar />);

    // Navigation links for logged-in employer users
    expect(screen.getByText("Posts")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();

    // Ensure non-employer and guest links are not present
    expect(screen.queryByText("Swipe Jobs")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("applies active link styling based on current path", () => {
    useLocation.mockReturnValue({ pathname: "/search-results" });

    render(<Navbar />);

    const activeLink = screen.getByText("All Jobs");
    expect(activeLink).toHaveClass("bg-blue-100 text-blue-600 rounded-lg px-3 py-3");

    const inactiveLink = screen.getByText("Home");
    expect(inactiveLink).toHaveClass("text-gray-600 hover:bg-blue-100 hover:text-blue-600 rounded-lg px-3 py-3 transition-all");
  });

  it("closes logout modal when Cancel is clicked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "token") return "mockToken";
      if (key === "role") return "applicant";
      return null;
    });

    render(<Navbar />);

    const logoutButton = screen.getByText("Log Out");
    fireEvent.click(logoutButton);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByText("Confirm Logout")).not.toBeInTheDocument();
  });
});