// Helpers for the Knowledge screens (sources, items, imports).
import apiClient from "@/service/axios";
import { FULL_ACCESS } from "@/utils/team";

export const KNOWLEDGE_API = "/knowledge";

export const SOURCE_TYPES = {
  website: { label: "Website", icon: "$globe", color: "indigo" },
  manual: { label: "Notes", icon: "$notebook-pen", color: "teal" },
  knowledge_gap: { label: "Learned from chats", icon: "$messages-square", color: "orange" },
};

export const sourceType = (type) =>
  SOURCE_TYPES[type] || { label: type, icon: "$folder", color: "grey" };

export const ITEM_STATUS = {
  draft: { label: "Draft", color: "grey" },
  published: { label: "Published", color: "success" },
  archived: { label: "Archived", color: "blue-grey" },
};

// Background work on an item: importing (pages) comes before indexing.
const IMPORT_STATE = {
  queued: { label: "Import queued", color: "grey", busy: true },
  scraping: { label: "Importing", color: "primary", busy: true },
  failed: { label: "Import failed", color: "error" },
};

const INDEX_STATE = {
  queued: { label: "Index queued", color: "grey", busy: true },
  indexing: { label: "Indexing", color: "primary", busy: true },
  failed: { label: "Index failed", color: "error" },
};

// The one background state worth showing for an item, or null when idle.
// `error` is client-facing text from the server; a queued item with an error
// is being retried automatically, so it isn't a failure yet.
export function workState(item) {
  const make = (state, error, code) => {
    const retrying = state.busy && !!error;
    return {
      ...state,
      ...(retrying ? { label: "Retrying", color: "info" } : {}),
      retrying,
      error,
      code,
    };
  };
  const imp = IMPORT_STATE[item.importStatus];
  if (imp) return make(imp, item.importError, item.importErrorCode);
  const idx = INDEX_STATE[item.indexStatus];
  if (idx) return make(idx, item.indexError, item.indexErrorCode);
  return null;
}

// What we offer when an import or index fails, by error code.
const FIX_BY_CODE = {
  NOT_FOUND: "delete",
  BAD_DOMAIN: "delete",
  PRIVATE_URL: "delete",
  BLOCKED: "note",
  TOO_LITTLE_TEXT: "note",
  NO_KNOWLEDGE: "note",
  UNREACHABLE: "retry",
  AI_BUSY: "retry",
  UNKNOWN: "retry",
  AI_CONFIG: "ai-settings",
};

export const fixFor = (state) =>
  state && !state.busy && state.error ? FIX_BY_CODE[state.code] || null : null;

export const isBusy = (item) => !!workState(item)?.busy;

export function apiError(err, fallback) {
  return err?.response?.data?.message || fallback;
}

export function formatDate(value) {
  return value
    ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";
}

// The signed-in user's permission keys. Not cached: a different user can
// sign in without a page reload.
export async function loadMyPermissions() {
  const { data } = await apiClient.get("/clients/currentUser");
  return data.data?.user?.roleId?.permissions || [];
}

export const can = (permissions, key) =>
  (permissions || []).includes(FULL_ACCESS) || (permissions || []).includes(key);
