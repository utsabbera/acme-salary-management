import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Space_Grotesk: () => ({ variable: "--font-space-grotesk" }),
}));

vi.mock("nextjs-toploader", () => ({
  default: () => <div data-testid="next-top-loader" />,
}));

vi.mock("@/components/layout/sidebar", () => ({
  Sidebar: () => <div />,
}));

vi.mock("@/components/layout/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div />,
}));

import RootLayout from "./layout";

describe("RootLayout", () => {
  it("renders a global navigation progress bar", () => {
    render(
      <RootLayout>
        <div />
      </RootLayout>,
    );

    expect(screen.getByTestId("next-top-loader")).toBeInTheDocument();
  });
});
