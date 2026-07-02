import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavUser } from "./nav-user";
import { SidebarProvider } from "./ui/sidebar";

// Mock matchMedia
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

describe("NavUser", () => {
  it("renders HR relevant user options", async () => {
    const { userEvent } = await import("@testing-library/user-event");
    const user = { name: "Test User", email: "test@example.com", avatar: "" };
    render(
      <SidebarProvider>
        <NavUser user={user} />
      </SidebarProvider>,
    );

    const trigger = screen.getByRole("button");
    await userEvent.setup().click(trigger);

    // We expect Profile, Settings, and Log out
    expect(await screen.findByText("Profile")).not.toBeNull();
    expect(await screen.findByText("Settings")).not.toBeNull();
    expect(await screen.findByText("Log out")).not.toBeNull();
  });
});
