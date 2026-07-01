import { cleanup, render, screen } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./sidebar";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("./theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Mock Theme Toggle</button>,
}));

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("highlights Dashboard when pathname starts with /dashboard", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Sidebar />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    const employeesLink = screen.getByText("Employees").closest("a");

    expect(dashboardLink).toHaveClass("bg-muted text-primary");
    expect(employeesLink).toHaveClass("text-muted-foreground");
    expect(employeesLink).not.toHaveClass("bg-muted text-primary");
  });

  it("highlights Employees when pathname starts with /employees", () => {
    mockUsePathname.mockReturnValue("/employees");
    render(<Sidebar />);

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    const employeesLink = screen.getByText("Employees").closest("a");

    expect(employeesLink).toHaveClass("bg-muted text-primary");
    expect(dashboardLink).toHaveClass("text-muted-foreground");
    expect(dashboardLink).not.toHaveClass("bg-muted text-primary");
  });

  it("renders the ThemeToggle component in the header", () => {
    mockUsePathname.mockReturnValue("/");
    render(<Sidebar />);

    expect(screen.getByRole("button", { name: /mock theme toggle/i })).toBeInTheDocument();
  });
});
