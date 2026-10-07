// Helpers for the Knowledge screens (sources, items, imports).
import apiClient from "@/service/axios";
import { FULL_ACCESS } from "@/utils/team";

export const KNOWLEDGE_API = "/knowledge";

export const SOURCE_TYPES = {
  website: { label: "Website", icon: "$globe", color: "indigo" },
  faq: { label: "FAQs", icon: "$message-circle-question-mark", color: "deep-purple" },
  manual: { label: "Notes", icon: "$notebook-pen", color: "teal" },
  knowledge_gap: { label: "Learned from chats", icon: "$messages-square", color: "orange" },
};

export const sourceType = (type) =>
  SOURCE_TYPES[type] || { label: type, icon: "$folder", color: "grey" };

// Sources whose items are FAQs (question + answer) rather than free text
export const isFaqSource = (source) => ["faq", "knowledge_gap"].includes(source?.type);

// Draft FAQs the AI pulled from website pages, waiting for approval
export const isSuggested = (item) => item.origin === "ai_suggested" && item.status === "draft";

// Backend limits for FAQs
export const FAQ_ANSWER_MAX = 2000;
export const FAQ_ALTERNATES_MAX = 10;

export const ITEM_STATUS = {
  draft: { label: "Draft", color: "grey" },
  published: { label: "Published", color: "success" },
  // A check found a blocker: not live, no chunks
  needs_review: { label: "Needs review", color: "error" },
  archived: { label: "Archived", color: "blue-grey" },
};

// Health from the publish-time checks. "held" = published but hidden from the
// bot because a more trusted item contradicts it.
export const HEALTH = {
  held: { label: "Held", color: "orange darken-2", icon: "$eye-off" },
  warning: { label: "Warning", color: "amber darken-3", icon: "$triangle-alert" },
};

export const healthOf = (item) => HEALTH[item?.healthStatus] || null;

export const ISSUE_TYPES = {
  contradiction: "Contradiction",
  duplicate: "Duplicate",
  pii: "Personal details",
  secret: "Secret or ID number",
  injection: "Instructions to the bot",
};

export const SEVERITY = {
  blocker: { label: "Blocker", color: "error" },
  warning: { label: "Warning", color: "amber darken-3" },
};

export const ISSUE_STATUS = {
  open: { label: "Open", color: "primary" },
  resolved: { label: "Resolved", color: "success" },
  dismissed: { label: "Dismissed", color: "grey" },
};

export const OVERRIDE_REASON_MIN = 5;
export const DISMISS_REASON_MIN = 3;

// Open issue counts: { blocker, warning }. Null when unavailable.
export async function loadIssueSummary() {
  try {
    const { data } = await apiClient.get(`${KNOWLEDGE_API}/issues/summary`);
    return data.data || { blocker: 0, warning: 0 };
  } catch {
    return null;
  }
}

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
  // AI_CONFIG (our platform key) and EMPTY_TEXT: message only, nothing the
  // client can do.
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
