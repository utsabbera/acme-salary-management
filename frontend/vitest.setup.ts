import "@testing-library/jest-dom/vitest";

process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

import * as React from "react";
import { vi } from "vitest";

vi.mock("recharts", async (importOriginal) => {
  const OriginalRecharts = await importOriginal<typeof import("recharts")>();
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.createElement(
        "div",
        { style: { width: 800, height: 400 } },
        React.cloneElement(children as React.ReactElement<{ width?: number; height?: number }>, {
          width: 800,
          height: 400,
        }),
      ),
  };
});
