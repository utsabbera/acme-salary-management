import type { ExchangeRateRead } from "../generated/types.gen";

export function formatCurrency(minorUnits: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(minorUnits / 100);
}

export function convertMinorUnitsToUSD(
  minorUnits: number,
  currencyCode: string,
  rates: ExchangeRateRead[],
): number | null {
  const rateObj = rates.find((r) => r.currency === currencyCode);
  if (!rateObj) {
    return null;
  }

  const rawUsdAmount = (minorUnits * rateObj.rate) / 100;
  return Math.round(rawUsdAmount * 100) / 100;
}
