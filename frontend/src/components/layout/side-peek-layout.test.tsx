import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SidePeekLayout } from "./side-peek-layout";

// react-resizable-panels uses ResizeObserver which is not available in jsdom.
// We must mock it.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

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

  it("renders only list pane when detail is not present", () => {
    render(<SidePeekLayout list={List} detail={null} />);

    expect(screen.getByTestId("mock-list-pane")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-detail-pane")).not.toBeInTheDocument();
  });

  it("renders both panes when detail is present", () => {
    render(<SidePeekLayout list={List} detail={Detail} />);

    expect(screen.getByTestId("mock-list-pane")).toBeInTheDocument();
    expect(screen.getByTestId("mock-detail-pane")).toBeInTheDocument();
  });

  it("applies sidepeek-enter class to detail pane on open from closed state", () => {
    const { rerender } = render(<SidePeekLayout list={List} detail={null} />);

    // Open the pane
    rerender(<SidePeekLayout list={List} detail={Detail} />);

    const detailPane = screen.getByTestId("detail-pane");
    expect(detailPane.className).toContain("sidepeek-enter");
  });

  it("keeps detail pane visible immediately after detail is removed (closing animation phase)", () => {
    const { rerender } = render(<SidePeekLayout list={List} detail={Detail} />);
    rerender(<SidePeekLayout list={List} detail={null} />);

    expect(screen.getByTestId("detail-pane")).toBeInTheDocument();
    expect(screen.getByTestId("mock-detail-pane")).toBeInTheDocument();
  });

  it("removes detail pane after the closing animation completes", () => {
    const { rerender } = render(<SidePeekLayout list={List} detail={Detail} />);
    rerender(<SidePeekLayout list={List} detail={null} />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByTestId("detail-pane")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-detail-pane")).not.toBeInTheDocument();
  });

  it("does not trigger closing animation or enter animation when switching between detail content", () => {
    const { rerender } = render(<SidePeekLayout list={List} detail={Detail} />);

    const Detail2 = <div data-testid="mock-detail-pane-2">Detail 2</div>;
    rerender(<SidePeekLayout list={List} detail={Detail2} />);

    const detailPane = screen.getByTestId("detail-pane");
    expect(detailPane.className).not.toContain("closing");
    expect(detailPane.className).not.toContain("sidepeek-enter");

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId("mock-detail-pane-2")).toBeInTheDocument();
  });
});
