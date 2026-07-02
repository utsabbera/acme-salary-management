import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClosePaneButton } from "./close-pane-button";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: vi.fn(),
}));

const mockTopLoaderStart = vi.fn();
vi.mock("nextjs-toploader", () => ({
  useTopLoader: () => ({
    start: mockTopLoaderStart,
    done: vi.fn(),
  }),
}));

describe("ClosePaneButton", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("removes employeeId from searchParams and pushes new URL on click", async () => {
    const user = userEvent.setup();

    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?department_id=21&employeeId=1") as unknown as ReturnType<
        typeof useSearchParams
      >,
    );

    render(<ClosePaneButton />);

    const button = screen.getByRole("button", { name: /close pane/i });
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith("?department_id=21");
  });
});
