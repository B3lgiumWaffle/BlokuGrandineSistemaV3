export function formatEth(value, options = {}) {
    if (value == null || value === "") return "-";

    const n = Number(value);
    if (Number.isNaN(n)) return "-";

    const {
        minimumFractionDigits = 0,
        maximumFractionDigits = 8
    } = options;

    return `${n.toLocaleString(undefined, {
        minimumFractionDigits,
        maximumFractionDigits
    })} ETH`;
}

export function formatEthFixed(value, digits = 2) {
    return formatEth(value, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
    });
}

export function formatEthRange(priceFrom, priceTo) {
    if (priceFrom != null && priceTo != null) {
        return `${formatEth(priceFrom)} - ${formatEth(priceTo)}`;
    }

    if (priceFrom != null) return `From ${formatEth(priceFrom)}`;
    if (priceTo != null) return `Up to ${formatEth(priceTo)}`;

    return "Not specified";
}
