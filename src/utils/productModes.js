// Labels for the product lookup `mode` returned by the Product API test
// endpoint and by sandbox answer traces.
export const PRODUCT_MODES = {
  live: { label: "Products found", color: "success" },
  no_match: { label: "Searched, nothing matched", color: "amber darken-2" },
  unavailable: { label: "API error", color: "error" },
  none: { label: "Product API not enabled", color: "grey" },
  skipped: {
    label: "Not a product/price question, so no API call",
    color: "grey",
  },
};

export function productModeInfo(mode) {
  return PRODUCT_MODES[mode] || { label: mode || "Unknown", color: "grey" };
}
