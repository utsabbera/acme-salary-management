export function formatCurrency(minorUnits: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(minorUnits / 100);
}
