export const formatCurrency = (value: number, currency = "GHS"): string => {
    try {
        return new Intl.NumberFormat("en-GH", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `GH₵ ${value.toFixed(2)}`;
    }
};