import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SalaryBreakdown } from "./salary-breakdown";

describe("SalaryBreakdown", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders null if item is not provided", () => {
    // @ts-expect-error Testing invalid input
    const { container } = render(<SalaryBreakdown item={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders only base salary if other components are not provided", () => {
    render(
      <SalaryBreakdown
        item={{
          base_salary_minor_units: 500000,
          currency: "USD",
        }}
      />,
    );

    expect(screen.getByText("Base Salary")).toBeInTheDocument();
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();

    expect(screen.queryByText("Housing")).not.toBeInTheDocument();
    expect(screen.queryByText("Equity")).not.toBeInTheDocument();
    expect(screen.queryByText("Other")).not.toBeInTheDocument();
  });

  it("renders all provided salary components", () => {
    render(
      <SalaryBreakdown
        item={{
          base_salary_minor_units: 500000,
          housing_allowance_minor_units: 100000,
          equity_minor_units: 200000,
          other_allowance_minor_units: 50000,
          currency: "EUR",
        }}
      />,
    );

    expect(screen.getByText("Base Salary")).toBeInTheDocument();
    expect(screen.getByText("€5,000.00")).toBeInTheDocument();

    expect(screen.getByText("Housing")).toBeInTheDocument();
    expect(screen.getByText("€1,000.00")).toBeInTheDocument();

    expect(screen.getByText("Equity")).toBeInTheDocument();
    expect(screen.getByText("€2,000.00")).toBeInTheDocument();

    expect(screen.getByText("Other")).toBeInTheDocument();
    expect(screen.getByText("€500.00")).toBeInTheDocument();
  });

  it("does not render components if their value is 0", () => {
    render(
      <SalaryBreakdown
        item={{
          base_salary_minor_units: 500000,
          housing_allowance_minor_units: 0,
          equity_minor_units: null,
          currency: "USD",
        }}
      />,
    );

    expect(screen.getByText("Base Salary")).toBeInTheDocument();
    expect(screen.queryByText("Housing")).not.toBeInTheDocument();
    expect(screen.queryByText("Equity")).not.toBeInTheDocument();
  });
});
