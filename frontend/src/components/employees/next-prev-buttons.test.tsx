import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextPrevButtons } from "./next-prev-buttons";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

const mockTopLoaderStart = vi.fn();
vi.mock("nextjs-toploader", () => ({
  useTopLoader: () => ({
    start: mockTopLoaderStart,
    done: vi.fn(),
  }),
}));

describe("NextPrevButtons", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?department_id=2") as unknown as ReadonlyURLSearchParams,
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders disabled up/down arrows when prevId and nextId are null", () => {
    render(<NextPrevButtons prevId={null} nextId={null} prevOffset={null} nextOffset={null} />);

    const prevButton = screen.getByRole("button", { name: /previous employee/i });
    const nextButton = screen.getByRole("button", { name: /next employee/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it("renders enabled arrows and pushes the new employeeId to the URL when clicked", async () => {
    const user = userEvent.setup();
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    render(<NextPrevButtons prevId={10} nextId={12} prevOffset={null} nextOffset={null} />);

    const prevButton = screen.getByRole("button", { name: /previous employee/i });
    const nextButton = screen.getByRole("button", { name: /next employee/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    await user.click(prevButton);
    expect(mockPush).toHaveBeenCalledWith("?department_id=2&employeeId=10");
    expect(mockTopLoaderStart).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "optimistic-navigate", detail: "10" }),
    );

    mockTopLoaderStart.mockClear();
    dispatchSpy.mockClear();

    await user.click(nextButton);
    expect(mockPush).toHaveBeenCalledWith("?department_id=2&employeeId=12");
    expect(mockTopLoaderStart).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "optimistic-navigate", detail: "12" }),
    );
  });

  it("includes the new offset in the URL if boundary is crossed", async () => {
    const user = userEvent.setup();
    render(<NextPrevButtons prevId={10} nextId={12} prevOffset={0} nextOffset={20} />);

    const prevButton = screen.getByRole("button", { name: /previous employee/i });
    const nextButton = screen.getByRole("button", { name: /next employee/i });

    await user.click(prevButton);
    expect(mockPush).toHaveBeenCalledWith("?department_id=2&employeeId=10&offset=0");

    await user.click(nextButton);
    expect(mockPush).toHaveBeenCalledWith("?department_id=2&employeeId=12&offset=20");
  });
});
