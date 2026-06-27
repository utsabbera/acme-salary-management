import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EmployeeForm } from "./employee-form";

describe("EmployeeForm", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders all required fields for creating an employee", () => {
    const onSubmit = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} mode="create" />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/valid from/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /create employee/i })).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EmployeeForm onSubmit={onSubmit} mode="create" />);

    const submitButtons = screen.getAllByRole("button", { name: /create employee/i });
    await user.click(submitButtons[0] as HTMLElement);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });

  it("correctly pre-fills data and hides valid_from when in edit mode", async () => {
    const onSubmit = vi.fn();
    const defaultValues = {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      department: "Engineering",
      country: "USA",
      salary: 100000,
      currency: "USD",
    };
    render(<EmployeeForm onSubmit={onSubmit} mode="edit" defaultValues={defaultValues} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toHaveValue("John");
      expect(screen.getByLabelText(/last name/i)).toHaveValue("Doe");
    });
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/valid from/i)).not.toBeInTheDocument();
  });
});
