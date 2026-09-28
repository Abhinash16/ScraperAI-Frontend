// Helpers for the key/value header editor used by the Customer / Product API
// settings. The server never returns header values; stored ones come back as
// MASKED_VALUE, and sending MASKED_VALUE back tells the server to keep them.

export const MASKED_VALUE = "********";

let nextId = 0;

export function newHeaderRow(key = "", value = "", stored = false) {
  nextId += 1;
  return { id: nextId, key, value, stored };
}

export function rowsFromHeaders(headers) {
  return Object.entries(headers || {}).map(([key, value]) =>
    newHeaderRow(key, value, value === MASKED_VALUE),
  );
}

// Returns { headers } on success or { error } with a user-facing message.
// Headers removed from the list are simply left out, which deletes them.
export function headersFromRows(rows) {
  const headers = {};

  for (const row of rows) {
    const key = (row.key || "").trim();
    const value = row.stored ? MASKED_VALUE : row.value || "";

    if (!key && !value) continue;
    if (!key) return { error: "Every header needs a name." };
    if (Object.prototype.hasOwnProperty.call(headers, key)) {
      return { error: `Header "${key}" is listed more than once.` };
    }
    if (!row.stored && !value) {
      return { error: `Enter a value for header "${key}".` };
    }

    headers[key] = value;
  }

  return { headers };
}
