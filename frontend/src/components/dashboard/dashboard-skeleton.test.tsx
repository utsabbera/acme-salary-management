import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardSkeleton } from "./dashboard-skeleton";

describe("DashboardSkeleton", () => {
  it("renders with a Skeleton component to display skeletons", () => {
    const { container } = render(<DashboardSkeleton />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders charts grid with correct layout matching actual charts", () => {
    const { container } = render(<DashboardSkeleton />);
    const chartsGrid = container.querySelector(".grid-cols-1.md\\:grid-cols-2");
    expect(chartsGrid).not.toBeNull();
    expect(chartsGrid?.className).toContain("gap-6");

    const skeletons = chartsGrid?.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons?.[2]?.className).toContain("h-[350px]");

    expect(skeletons?.[8]?.className).toContain("aspect-square");
  });
});
