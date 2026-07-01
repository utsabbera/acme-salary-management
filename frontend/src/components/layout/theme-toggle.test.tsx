import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });
  it("renders a toggle button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  it("calls setTheme with correct values when options are clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    // Open dropdown
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    // Click Light
    await user.click(await screen.findByRole("menuitem", { name: /light/i }));
    expect(mockSetTheme).toHaveBeenCalledWith("light");

    // Open dropdown again
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    // Click Dark
    await user.click(await screen.findByRole("menuitem", { name: /dark/i }));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");

    // Open dropdown again
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    // Click System
    await user.click(await screen.findByRole("menuitem", { name: /system/i }));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });
});
