import { act, cleanup, render, screen } from "@testing-library/react";
import { type ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

function makeParams(search = "") {
  return new URLSearchParams(search) as unknown as ReadonlyURLSearchParams;
}

describe("SidePeekLayout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    vi.clearAllMocks();
  });

  const List = <div data-testid="mock-list-pane">List Content</div>;
  const Detail = <div data-testid="mock-detail-pane">Detail Content</div>;

  it("renders only list pane when employeeId is not present", () => {
    vi.mocked(useSearchParams).mockReturnValue(makeParams());
    render(<SidePeekLayout list={List} detail={Detail} />);

    expect(screen.getByTestId("mock-list-pane")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-detail-pane")).not.toBeInTheDocument();
  });

  it("renders both panes when employeeId is present", () => {
    vi.mocked(useSearchParams).mockReturnValue(makeParams("?employeeId=1"));
    render(<SidePeekLayout list={List} detail={Detail} />);

    expect(screen.getByTestId("mock-list-pane")).toBeInTheDocument();
    expect(screen.getByTestId("mock-detail-pane")).toBeInTheDocument();
  });

  it("applies sidepeek-enter class to detail pane on open", () => {
    vi.mocked(useSearchParams).mockReturnValue(makeParams("?employeeId=1"));
    render(<SidePeekLayout list={List} detail={Detail} />);

    const detailPane = screen.getByTestId("detail-pane");
    expect(detailPane.className).toContain("sidepeek-enter");
  });

  it("keeps detail pane visible immediately after employeeId is removed (closing animation phase)", () => {
    const { rerender } = render(<SidePeekLayout list={List} detail={Detail} />);
    vi.mocked(useSearchParams).mockReturnValue(makeParams("?employeeId=1"));
    rerender(<SidePeekLayout list={List} detail={Detail} />);

    vi.mocked(useSearchParams).mockReturnValue(makeParams());
    rerender(<SidePeekLayout list={List} detail={Detail} />);

    expect(screen.getByTestId("detail-pane")).toBeInTheDocument();
    expect(screen.getByTestId("mock-detail-pane")).toBeInTheDocument();
  });

  it("removes detail pane after the closing animation completes", () => {
    const { rerender } = render(<SidePeekLayout list={List} detail={Detail} />);
    vi.mocked(useSearchParams).mockReturnValue(makeParams("?employeeId=1"));
    rerender(<SidePeekLayout list={List} detail={Detail} />);

    vi.mocked(useSearchParams).mockReturnValue(makeParams());
    rerender(<SidePeekLayout list={List} detail={Detail} />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByTestId("detail-pane")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-detail-pane")).not.toBeInTheDocument();
  });

  it("does not trigger closing animation when switching between employees", () => {
    vi.mocked(useSearchParams).mockReturnValue(makeParams("?employeeId=1"));
    const { rerender } = render(<SidePeekLayout list={List} detail={Detail} />);

    vi.mocked(useSearchParams).mockReturnValue(makeParams("?employeeId=2"));
    rerender(<SidePeekLayout list={List} detail={Detail} />);

    const detailPane = screen.getByTestId("detail-pane");
    expect(detailPane.className).not.toContain("closing");
    expect(detailPane.className).toContain("sidepeek-enter");

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("mock-detail-pane")).toBeInTheDocument();
  });
});
