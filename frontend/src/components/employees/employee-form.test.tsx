import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "@/components/ui/dialog";
import type { CountryRead, DepartmentRead } from "@/lib/generated";
import { EmployeeForm } from "./employee-form";

vi.mock("@/components/ui/select", () => ({
  Select: ({
    onValueChange,
    children,
    value,
  }: {
    onValueChange: (v: string) => void;
    children: ReactNode;
    value?: string;
  }) => (
    <div data-testid="mock-select" data-value={value}>
      {children}
      <button type="button" onClick={() => onValueChange("1")}>
        Select Dept 1
      </button>
      <button type="button" onClick={() => onValueChange("US")}>
        Select US
      </button>
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <div data-value={value}>{children}</div>
  ),
  SelectTrigger: ({
    children,
    "aria-label": ariaLabel,
  }: {
    children: ReactNode;
    "aria-label"?: string;
  }) => (
    <button type="button" aria-label={ariaLabel}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder, children }: { placeholder?: string; children?: ReactNode }) => (
    <span>{children ?? placeholder}</span>
  ),
}));

const departments: DepartmentRead[] = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "HR" },
];

const countries: CountryRead[] = [
  {
    id: 1,
    code: "US",
    name: "United States",
    default_currency: { id: 1, code: "USD", name: "US Dollar" },
  },
  {
    id: 2,
    code: "GB",
    name: "United Kingdom",
    default_currency: { id: 2, code: "GBP", name: "British Pound" },
  },
];

describe("EmployeeForm", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders all required fields for creating an employee", () => {
    const onSubmit = vi.fn();
    render(
      <Dialog>
        <EmployeeForm
          onSubmit={onSubmit}
          mode="create"
          departments={departments}
          countries={countries}
        />
      </Dialog>,
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toHaveTextContent("Select department");
    expect(screen.getByLabelText(/country/i)).toHaveTextContent("Select country");
    expect(screen.getByRole("button", { name: /create employee/i })).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Dialog>
        <EmployeeForm
          onSubmit={onSubmit}
          mode="create"
          departments={departments}
          countries={countries}
        />
      </Dialog>,
    );

    const submitButtons = screen.getAllByRole("button", { name: /create employee/i });
    await user.click(submitButtons[0] as HTMLElement);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });

  it("correctly pre-fills data when in edit mode", async () => {
    const onSubmit = vi.fn();
    const defaultValues = {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      department_id: 1,
      country_code: "US",
    };
    render(
      <Dialog>
        <EmployeeForm
          onSubmit={onSubmit}
          mode="edit"
          defaultValues={defaultValues}
          departments={departments}
          countries={countries}
        />
      </Dialog>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/first name/i)).toHaveValue("John");
      expect(screen.getByLabelText(/last name/i)).toHaveValue("Doe");
      expect(screen.getByLabelText(/department/i)).toHaveTextContent("Engineering");
      expect(screen.getByLabelText(/country/i)).toHaveTextContent("United States");
    });
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/valid from/i)).not.toBeInTheDocument();
  });
});
