import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ServerWakeupLoader } from "./server-wakeup-loader";

describe("ServerWakeupLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  it("renders children initially and hides the wakeup message", () => {
    render(
      <ServerWakeupLoader>
        <div data-testid="test-child">Child Content</div>
      </ServerWakeupLoader>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();

    const wakeupMessages = screen.getAllByText("Waking up the server...");
    const wakeupMessage = wakeupMessages[0];
    if (!wakeupMessage) throw new Error("Message not found");
    expect(wakeupMessage).toBeInTheDocument();

    const messageContainer = wakeupMessage.closest("div.fixed");
    expect(messageContainer).toHaveClass("opacity-0");
  });

  it("shows the default skeleton if no children are provided", () => {
    const { container } = render(<ServerWakeupLoader />);

    expect(container.querySelector(".bg-transparent")).toBeInTheDocument();
  });

  it("transitions to the wakeup state after 3 seconds", () => {
    render(
      <ServerWakeupLoader>
        <div data-testid="test-child">Child Content</div>
      </ServerWakeupLoader>,
    );

    const wakeupMessages = screen.getAllByText("Waking up the server...");
    const wakeupMessage = wakeupMessages[0];
    if (!wakeupMessage) throw new Error("Message not found");
    const messageContainer = wakeupMessage.closest("div.fixed");

    expect(messageContainer).toHaveClass("opacity-0");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(messageContainer).toHaveClass("opacity-100");
    expect(messageContainer).not.toHaveClass("opacity-0");
  });

  it("cleans up the timer on unmount", () => {
    const { unmount } = render(<ServerWakeupLoader />);

    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
