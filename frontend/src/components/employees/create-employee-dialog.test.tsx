import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateEmployeeDialog } from "./create-employee-dialog";

describe("CreateEmployeeDialog", () => {
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
});
