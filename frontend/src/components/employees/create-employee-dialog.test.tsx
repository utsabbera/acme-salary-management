import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmployeeEmployeesPost } from "@/lib/generated";
import { CreateEmployeeDialog } from "./create-employee-dialog";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
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

describe("CreateEmployeeDialog", () => {
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      refresh: mockRefresh,
    } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens the dialog when the trigger is clicked", async () => {
    const user = userEvent.setup();
    const trigger = <button type="button">Open Dialog</button>;

    render(<CreateEmployeeDialog trigger={trigger} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open dialog/i }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/create new employee/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /create employee/i })).toBeInTheDocument();
  });

  it("calls API and refreshes router when form is submitted successfully", async () => {
    const user = userEvent.setup();
    const trigger = <button type="button">Open Dialog</button>;
    vi.mocked(createEmployeeEmployeesPost).mockResolvedValue({
      data: { id: 1 },
    } as unknown as Awaited<ReturnType<typeof createEmployeeEmployeesPost>>);

    render(<CreateEmployeeDialog trigger={trigger} />);
    await user.click(screen.getByRole("button", { name: /open dialog/i }));

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/email/i), "john.doe@example.com");
    await user.type(screen.getByLabelText(/department/i), "Engineering");
    await user.type(screen.getByLabelText(/country/i), "USA");
    await user.type(screen.getByLabelText(/salary/i), "100000");
    await user.type(screen.getByLabelText(/currency/i), "USD");
    await user.type(screen.getByLabelText(/valid from/i), "2024-01-01");

    await user.click(screen.getByRole("button", { name: /create employee/i }));

    await waitFor(() => {
      expect(createEmployeeEmployeesPost).toHaveBeenCalledWith({
        client: expect.any(Object),
        body: {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          department: "Engineering",
          country: "USA",
          salary_minor_units: 10000000,
          currency: "USD",
          valid_from: "2024-01-01",
        },
      });
    });

    expect(mockRefresh).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
