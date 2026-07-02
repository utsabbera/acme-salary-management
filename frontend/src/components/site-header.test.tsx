import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "./layout/theme-provider";
import { SiteHeader } from "./site-header";
import { SidebarProvider } from "./ui/sidebar";
import { TooltipProvider } from "./ui/tooltip";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

describe("SiteHeader", () => {
  it("renders correctly with title and buttons", () => {
    render(
      <ThemeProvider>
        <TooltipProvider>
          <SidebarProvider>
            <SiteHeader />
          </SidebarProvider>
        </TooltipProvider>
      </ThemeProvider>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Ask AI")).toBeInTheDocument();
    expect(screen.getByText("Toggle theme")).toBeInTheDocument();
  });
});
