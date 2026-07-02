import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavMain } from "./nav-main";
import { SidebarProvider } from "./ui/sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

describe("NavMain", () => {
  it("renders grouped items with vertical accent for active states", () => {
    render(
      <SidebarProvider>
        <NavMain
          groups={[
            {
              title: "Test Group",
              items: [{ title: "Test Item", url: "/dashboard" }],
            },
          ]}
        />
      </SidebarProvider>,
    );

    expect(screen.getByText("Test Group")).not.toBeNull();

    const itemSpan = screen.getByText("Test Item");
    const itemLink = itemSpan.closest("a") || itemSpan.closest("button");

    expect(itemLink?.className).toContain("data-active:bg-primary/10");
  });
});
