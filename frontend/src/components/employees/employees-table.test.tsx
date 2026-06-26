import { render, screen } from "@testing-library/react";

import { describe, expect, it } from "vitest";
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
});
