import { cleanup, render, screen } from "@testing-library/react";
import { type ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidePeekLayout } from "./side-peek-layout";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

// react-resizable-panels uses ResizeObserver which is not available in jsdom.
// We must mock it.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("SidePeekLayout", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const ListComponent = <div data-testid="mock-list-pane">List Content</div>;
  const DetailComponent = <div data-testid="mock-detail-pane">Detail Content</div>;

  it("renders only list pane when employeeId is not present", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReadonlyURLSearchParams,
    );

    render(<SidePeekLayout list={ListComponent} detail={DetailComponent} />);

    expect(screen.getByTestId("mock-list-pane")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-detail-pane")).not.toBeInTheDocument();
  });

  it("renders both panes when employeeId is present", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("?employeeId=1") as unknown as ReadonlyURLSearchParams,
    );

    render(<SidePeekLayout list={ListComponent} detail={DetailComponent} />);

    expect(screen.getByTestId("mock-list-pane")).toBeInTheDocument();
    expect(screen.getByTestId("mock-detail-pane")).toBeInTheDocument();
  });
});
