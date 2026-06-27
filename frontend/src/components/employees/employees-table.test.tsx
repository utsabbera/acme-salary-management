import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { afterEach, describe, expect, it } from "vitest";
import { EmployeesTable } from "./employees-table";

const mockEmployees = [
  {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    department: "Engineering",
    country: "USA",
    salary: "100000",
    currency: "USD",
    salary_usd: "100000",
    valid_from: "2023-01-01",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@example.com",
    department: "HR",
    country: "UK",
    salary: "80000",
    currency: "GBP",
    salary_usd: "100000",
    valid_from: "2023-02-01",
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2023-02-01T00:00:00Z",
  },
];

describe("EmployeesTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty state when no employees", () => {
    render(<EmployeesTable employees={[]} />);
    expect(screen.getByText("No employees found.")).toBeInTheDocument();
  });

  it("renders a list of employees", () => {
    render(<EmployeesTable employees={mockEmployees} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();

    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("HR")).toBeInTheDocument();
  });

  it("formats salary with currency correctly", () => {
    render(<EmployeesTable employees={mockEmployees} />);
    expect(screen.getAllByText("$100,000.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("£80,000.00").length).toBeGreaterThan(0);
  });

  it("renders an action menu with Edit and Delete options for each employee", async () => {
    const user = userEvent.setup();
    render(<EmployeesTable employees={mockEmployees} />);

    const actionButtons = screen.getAllByRole("button", { name: /open menu/i });
    expect(actionButtons).toHaveLength(2);

    await user.click(actionButtons[0] as HTMLElement);

    expect(await screen.findByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /delete/i })).toBeInTheDocument();
  });

  it("opens an Edit dialog pre-filled with employee data when Edit is clicked", async () => {
    const user = userEvent.setup();
    render(<EmployeesTable employees={mockEmployees} />);

    const actionButtons = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionButtons[0] as HTMLElement);

    const editOption = await screen.findByRole("menuitem", { name: /edit/i });
    await user.click(editOption);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/edit employee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toHaveValue("John");
  });

  it("opens a Delete confirmation dialog when Delete is clicked", async () => {
    const user = userEvent.setup();
    render(<EmployeesTable employees={mockEmployees} />);

    const actionButtons = screen.getAllByRole("button", { name: /open menu/i });
    await user.click(actionButtons[0] as HTMLElement);

    const deleteOption = await screen.findByRole("menuitem", { name: /delete/i });
    await user.click(deleteOption);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument();
  });
});
