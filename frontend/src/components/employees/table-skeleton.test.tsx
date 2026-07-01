import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TableSkeleton } from "./table-skeleton";

describe("TableSkeleton", () => {
  it("renders with Table components to display skeletons", () => {
    const { container } = render(<TableSkeleton />);

    const table = container.querySelector("table");
    expect(table).not.toBeNull();

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
