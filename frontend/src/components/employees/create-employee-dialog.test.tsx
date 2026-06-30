import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CountryRead, DepartmentRead } from "@/lib/generated";
import { createEmployeeEmployeesPost } from "@/lib/generated";
import { CreateEmployeeDialog } from "./create-employee-dialog";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api", () => ({
  apiClient: {},
}));

vi.mock("@/lib/generated", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/generated")>();
  return {
    ...actual,
    createEmployeeEmployeesPost: vi.fn(),
  };
});

import type { ReactNode } from "react";

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
      <button type="button" data-testid="select-dept" onClick={() => onValueChange("1")}>
        Select Dept
      </button>
      <button type="button" data-testid="select-country" onClick={() => onValueChange("US")}>
        Select Country
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
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

const departments: DepartmentRead[] = [{ id: 1, name: "Engineering" }];
const countries: CountryRead[] = [
  {
    id: 1,
    code: "US",
    name: "United States",
    default_currency: { id: 1, code: "USD", name: "US Dollar" },
  },
];

describe("CreateEmployeeDialog", () => {
  const mockRouter = {
    refresh: vi.fn(),
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);
    vi.mocked(usePathname).mockReturnValue("/employees");
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("search=existing") as unknown as ReturnType<typeof useSearchParams>,
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens the dialog when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <CreateEmployeeDialog
        departments={departments}
        countries={countries}
        trigger={<button type="button">Open Dialog</button>}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open Dialog" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create New Employee")).toBeInTheDocument();
  });

  it("calls API, pushes to router with employeeId, and refreshes when form is submitted successfully", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(createEmployeeEmployeesPost).mockResolvedValue({
      data: { id: 123 },
      error: undefined,
      response: {},
    } as unknown as Awaited<ReturnType<typeof createEmployeeEmployeesPost>>);

    render(
      <CreateEmployeeDialog
        departments={departments}
        countries={countries}
        trigger={<button type="button">Open</button>}
        onSuccess={onSuccess}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "john.doe@example.com");

    await user.click(screen.getAllByTestId("select-dept")[0] as HTMLElement);
    await user.click(screen.getAllByTestId("select-country")[1] as HTMLElement);

    await user.click(screen.getByRole("button", { name: "Create Employee" }));

    await waitFor(() => {
      expect(createEmployeeEmployeesPost).toHaveBeenCalledWith({
        client: expect.any(Object),
        body: {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          department_id: 1,
          country_code: "US",
        },
      });
    });

    expect(mockRouter.push).toHaveBeenCalledWith("/employees?search=existing&employeeId=123");
    expect(mockRouter.refresh).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("shows an error toast if API returns an error", async () => {
    const user = userEvent.setup();
    vi.mocked(createEmployeeEmployeesPost).mockResolvedValue({
      data: undefined,
      error: { detail: [{ loc: ["body"], msg: "Validation failed", type: "value_error" }] },
      response: {} as Response,
    });

    render(
      <CreateEmployeeDialog
        departments={departments}
        countries={countries}
        trigger={<button type="button">Open</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "john.doe@example.com");
    await user.click(screen.getAllByTestId("select-dept")[0] as HTMLElement);
    await user.click(screen.getAllByTestId("select-country")[1] as HTMLElement);

    await user.click(screen.getByRole("button", { name: "Create Employee" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Validation failed"));
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("shows an error toast if API throws an exception", async () => {
    const user = userEvent.setup();
    vi.mocked(createEmployeeEmployeesPost).mockRejectedValue(new Error("Network Error"));

    render(
      <CreateEmployeeDialog
        departments={departments}
        countries={countries}
        trigger={<button type="button">Open</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "john.doe@example.com");
    await user.click(screen.getAllByTestId("select-dept")[0] as HTMLElement);
    await user.click(screen.getAllByTestId("select-country")[1] as HTMLElement);

    await user.click(screen.getByRole("button", { name: "Create Employee" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Network Error"));
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
