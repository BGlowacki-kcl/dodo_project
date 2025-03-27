import React from "react";
import { render, screen, fireEvent } from "@testing-library/react"; // Import screen
import { vi } from "vitest";
import useLocalStorage from "../hooks/useLocalStorage"; // Adjust the path as needed

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

describe("useLocalStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it("initializes with the initial value when localStorage is empty", () => {
    const TestComponent = () => {
      const [value] = useLocalStorage("testKey", "initialValue");
      return <div>{value}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByText("initialValue")).toBeInTheDocument();
    expect(localStorageMock.getItem).toHaveBeenCalledWith("testKey");
  });

  it("initializes with the value from localStorage when available", () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify("storedValue"));

    const TestComponent = () => {
      const [value] = useLocalStorage("testKey", "initialValue");
      return <div>{value}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByText("storedValue")).toBeInTheDocument();
    expect(localStorageMock.getItem).toHaveBeenCalledWith("testKey");
  });

  it("updates the value and persists it to localStorage", () => {
    const TestComponent = () => {
      const [value, setValue] = useLocalStorage("testKey", "initialValue");
      return (
        <div>
          <span>{value}</span>
          <button onClick={() => setValue("newValue")}>Update</button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText("initialValue")).toBeInTheDocument();

    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);

    expect(screen.getByText("newValue")).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith("testKey", JSON.stringify("newValue"));
  });

  it("updates the value using a callback function", () => {
    const TestComponent = () => {
      const [value, setValue] = useLocalStorage("testKey", 0);
      return (
        <div>
          <span>{value}</span>
          <button onClick={() => setValue((prev) => prev + 1)}>Increment</button>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByText("0")).toBeInTheDocument();

    const incrementButton = screen.getByText("Increment");
    fireEvent.click(incrementButton);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(localStorageMock.setItem).toHaveBeenCalledWith("testKey", JSON.stringify(1));
  });

  it("handles JSON parsing errors gracefully", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorageMock.getItem.mockReturnValueOnce("invalid JSON");

    const TestComponent = () => {
      const [value] = useLocalStorage("testKey", "defaultValue");
      return <div>{value}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByText("defaultValue")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error reading localStorage key:",
      "testKey",
      expect.any(SyntaxError)
    );

    consoleErrorSpy.mockRestore();
  });

  it("handles localStorage setItem errors gracefully", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("Storage error");
    });

    const TestComponent = () => {
      const [value, setValue] = useLocalStorage("testKey", "initialValue");
      return (
        <div>
          <span>{value}</span>
          <button onClick={() => setValue("newValue")}>Update</button>
        </div>
      );
    };

    render(<TestComponent />);

    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);

    expect(screen.getByText("newValue")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error setting localStorage key:",
      "testKey",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});