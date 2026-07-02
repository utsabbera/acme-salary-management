import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComingSoon } from "./coming-soon";

describe("ComingSoon", () => {
  it("renders correctly with the provided title", () => {
    render(<ComingSoon title="Settings" />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're working hard to bring this feature to you. Check back soon for updates!",
      ),
    ).toBeInTheDocument();
  });
});
