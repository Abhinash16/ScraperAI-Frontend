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

// "Honda Activa 6G (actva→activa, 6g)"
export function catalogMatchLabel(match) {
  const matched = Array.isArray(match?.matched) ? match.matched : [];
  const name = match?.name || match?.sku || "Unknown product";
  return matched.length ? `${name} (${matched.join(", ")})` : name;
}

const DETECTION_LABELS = {
  keyword: "keyword",
  catalog: "catalog match",
  category: "category / brand",
};

// Why a message counted as a product question, from a test result or trace.
// Uses the server's `detectedBy`; infers it for older responses.
export function detectionSources(result) {
  if (!result) return [];
  if (Array.isArray(result.detectedBy)) {
    return result.detectedBy.map((d) => DETECTION_LABELS[d] || d);
  }
  const sources = [];
  if (result.keywordIntent) sources.push(DETECTION_LABELS.keyword);
  if ((result.catalogMatches || []).length) sources.push(DETECTION_LABELS.catalog);
  if (!sources.length && result.isProductQuestion) {
    sources.push(DETECTION_LABELS.category);
  }
  return sources;
}
