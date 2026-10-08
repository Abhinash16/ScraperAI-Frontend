// Form <-> API helpers for the optional Product / Customer API settings:
// sign-in (auth), extra parameters and the product field mapping.
// Stored secrets come back as MASKED_VALUE; sending it back keeps them.
import { MASKED_VALUE } from "@/utils/apiHeaders";

export const AUTH_TYPES = [
  { value: "headers", text: "Headers only (below)" },
  { value: "bearer", text: "Bearer token" },
  { value: "basic", text: "Username and password (Basic)" },
  { value: "query_key", text: "API key in the URL" },
];

export const isMasked = (v) => v === MASKED_VALUE;

export function authToForm(auth) {
  const a = auth || {};
  return {
    type: AUTH_TYPES.some((t) => t.value === a.type) ? a.type : "headers",
    token: a.token || "",
    username: a.username || "",
    password: a.password || "",
    param: a.param || "",
    key: a.key || "",
  };
}

// Returns { auth } (null = headers only) or { error }
export function authFromForm(form) {
  const f = form || {};
  const t = (v) => String(v || "").trim();
  if (f.type === "bearer") {
    if (!t(f.token)) return { error: "Enter the bearer token." };
    return { auth: { type: "bearer", token: t(f.token) } };
  }
  if (f.type === "basic") {
    if (!t(f.username)) return { error: "Enter the username." };
    return { auth: { type: "basic", username: t(f.username), password: f.password || "" } };
  }
  if (f.type === "query_key") {
    if (!t(f.param) || !t(f.key)) {
      return { error: "Enter both the parameter name and the API key." };
    }
    return { auth: { type: "query_key", param: t(f.param), key: t(f.key) } };
  }
  return { auth: null };
}

let nextId = 0;
export const newRow = (fields) => ({ id: ++nextId, ...fields });

// { name: value } <-> [{ id, name, value }]
export function pairsToRows(obj, a = "name", b = "value") {
  return Object.entries(obj || {}).map(([k, v]) => newRow({ [a]: k, [b]: String(v ?? "") }));
}

// Returns { value } (null when empty) or { error }
export function rowsToPairs(rows, { a = "name", b = "value", max = 20, label = "parameter" } = {}) {
  const out = {};
  for (const row of rows || []) {
    const k = String(row[a] || "").trim();
    const v = String(row[b] || "").trim();
    if (!k && !v) continue;
    if (!k) return { error: `Every ${label} needs a name.` };
    if (Object.prototype.hasOwnProperty.call(out, k)) {
      return { error: `"${k}" is listed more than once.` };
    }
    out[k] = v;
  }
  if (Object.keys(out).length > max) return { error: `Up to ${max} ${label}s.` };
  return { value: Object.keys(out).length ? out : null };
}

// Product field mapping: our field -> a dot path inside one of their products
export const FIELD_MAP_FIELDS = [
  "sku", "name", "url", "category", "aliases",
  "prices", "price", "priceLabel", "priceUnit", "currency", "currencyCode",
  "availability", "locations",
];

export const STOCK_STATUSES = [
  { value: "in_stock", text: "In stock" },
  { value: "limited", text: "Limited" },
  { value: "out_of_stock", text: "Out of stock" },
  { value: "on_request", text: "On request" },
];

export function fieldMapToForm(map) {
  const m = map || {};
  const form = {};
  FIELD_MAP_FIELDS.forEach((f) => (form[f] = m[f] || ""));
  form.availabilityValues = pairsToRows(m.availabilityValues, "theirs", "ours");
  form.attributes = pairsToRows(m.attributes, "ours", "path");
  return form;
}

// Returns { fieldMap } (null when nothing is mapped) or { error }
export function fieldMapFromForm(form) {
  const out = {};
  FIELD_MAP_FIELDS.forEach((f) => {
    const v = String(form[f] || "").trim();
    if (v) out[f] = v;
  });
  const values = rowsToPairs(form.availabilityValues, {
    a: "theirs", b: "ours", max: 50, label: "stock value",
  });
  if (values.error) return { error: values.error };
  if (values.value && Object.values(values.value).some((v) => !v)) {
    return { error: "Pick our stock status for every stock value." };
  }
  const attrs = rowsToPairs(form.attributes, { a: "ours", b: "path", label: "attribute" });
  if (attrs.error) return { error: attrs.error };
  if (values.value) out.availabilityValues = values.value;
  if (attrs.value) out.attributes = attrs.value;
  return { fieldMap: Object.keys(out).length ? out : null };
}

// Dot paths in a sample product, for mapping suggestions:
// { a: { b: 1 }, c: [..] } -> ["a", "a.b", "c"]
export function keyPaths(obj, prefix = "", depth = 0, out = []) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj) || depth > 4) return out;
  for (const [k, v] of Object.entries(obj)) {
    if (out.length >= 200) break;
    const path = prefix ? `${prefix}.${k}` : k;
    out.push(path);
    keyPaths(v, path, depth + 1, out);
  }
  return out;
}
