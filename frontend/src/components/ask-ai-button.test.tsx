import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { AskAiButton } from "./ask-ai-button";
import { TooltipProvider } from "./ui/tooltip";

describe("AskAiButton", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders correctly with gradient definition", () => {
    const { container } = render(
      <TooltipProvider>
        <AskAiButton />
      </TooltipProvider>,
    );

    const gradient = container.querySelector("#ai-icon-gradient");
    expect(gradient).not.toBeNull();

    expect(screen.getByText("Ask AI")).toBeInTheDocument();
  });

  it("shows 'Coming soon!' tooltip on hover", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <AskAiButton />
      </TooltipProvider>,
    );

    const button = screen.getByRole("button", { name: /ask ai/i });
    await user.hover(button);

    await waitFor(() => {
      expect(screen.getByText("Coming soon!")).toBeInTheDocument();
    });
  });
});
