import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Space_Grotesk: () => ({ variable: "--font-space-grotesk" }),
}));

vi.mock("nextjs-toploader", () => ({
  default: () => <div data-testid="next-top-loader" />,
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <div data-testid="app-sidebar" />,
}));

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarInset: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarTrigger: () => <button type="button" />,
}));

vi.mock("@/components/layout/theme-provider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div />,
}));

import RootLayout from "./layout";

describe("RootLayout", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a global navigation progress bar", () => {
    render(
      <RootLayout>
        <div />
      </RootLayout>,
    );

    expect(screen.getByTestId("next-top-loader")).toBeInTheDocument();
  });

  it("renders the AppSidebar and SiteHeader within a SidebarProvider", () => {
    render(
      <RootLayout>
        <div />
      </RootLayout>,
    );

    expect(screen.getByTestId("sidebar-provider")).toBeInTheDocument();
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("site-header")).toBeInTheDocument();
  });
});
