from decimal import Decimal

# Static exchange rates to USD.
# In a real application, this would come from an external API or database.
RATES_TO_USD = {
    "USD": Decimal("1.0"),
    "EUR": Decimal("1.08"),
    "GBP": Decimal("1.25"),
    "INR": Decimal("0.012"),
}


def convert_to_usd(amount: Decimal, currency: str) -> Decimal:
    """
    Convert a given amount in a specific currency to USD.
    Raises ValueError if the currency is not supported.
    """
    rate = RATES_TO_USD.get(currency.upper())
    if not rate:
        raise ValueError(f"Unsupported currency: {currency}")
    return (amount * rate).quantize(Decimal("0.01"))
