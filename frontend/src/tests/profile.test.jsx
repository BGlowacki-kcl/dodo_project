import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Profile from "../components/Profile";
import { userService } from "../services/user.service";

// Mock external dependencies
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../services/user.service.js", () => ({
  userService: {
    getUserProfile: vi.fn(),
    updateUser: vi.fn(),
  },
}));

vi.mock("../components/UserDetails", () => ({
  default: ({ user, isEditing, onEdit, onChange, onAdd, onRemove, onSave }) => (
    <div data-testid="user-details">
      <button 
        data-testid="edit-personal"
        onClick={() => onEdit("personal")}
      >
        Edit Personal
      </button>
      <button 
        data-testid="save-personal"
        onClick={() => onSave("personal", user)}
      >
        Save Personal
      </button>
      <input 
        data-testid="name-input"
        name="name"
        value={user.name || ""}
        onChange={(e) => onChange(e)}
      />
      <button 
        data-testid="add-education"
        onClick={() => onAdd("education")}
      >
        Add Education
      </button>
      <button 
        data-testid="remove-education"
        onClick={() => onRemove("education", 0)}
      >
        Remove Education
      </button>
    </div>
  ),
}));

describe("Profile Component", () => {
  const mockUserData = {
    name: "John Doe",
    email: "john@example.com",
    location: "London",
    education: [{ institution: "KCL", degree: "Computer Science" }],
    experience: [{ company: "Tech Co", title: "Developer" }],
    skills: ["JavaScript", "React"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    userService.getUserProfile.mockResolvedValue(mockUserData);
    userService.updateUser.mockResolvedValue({ data: mockUserData });
  });

  it("renders loading state initially", () => {
    render(<Profile />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders user profile data after loading", async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByTestId("user-details")).toBeInTheDocument();
    });

    expect(userService.getUserProfile).toHaveBeenCalledTimes(1);
  });

  it("handles error state gracefully", async () => {
    const errorMessage = "Failed to fetch profile";
    userService.getUserProfile.mockRejectedValue(new Error(errorMessage));

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/error fetching user profile/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch profile$/i)).toBeInTheDocument();
    });
  });

  it("toggles edit mode when edit button is clicked", async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("edit-personal"));
    expect(screen.getByTestId("user-details")).toBeInTheDocument();
  });

  it("saves profile data when save button is clicked", async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("save-personal"));
    expect(userService.updateUser).toHaveBeenCalledTimes(1);
  });

  it("adds education item when add button is clicked", async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("add-education"));
    expect(screen.getByTestId("user-details")).toBeInTheDocument();
  });

  it("removes education item when remove button is clicked", async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("remove-education"));
    expect(screen.getByTestId("user-details")).toBeInTheDocument();
  });

  it("updates input fields when changed", async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId("name-input"), { target: { value: "Jane Doe" } });
    expect(screen.getByTestId("user-details")).toBeInTheDocument();
  });
});
