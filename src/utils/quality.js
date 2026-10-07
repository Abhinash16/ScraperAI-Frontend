// Helpers for the Quality (answer tests) screens. API: /api/eval.

export const EVAL_API = "/eval";

export const CASE_ORIGINS = {
  manual: { label: "Manual", color: "grey" },
  faq: { label: "From FAQ", color: "deep-purple" },
  faq_alternate: { label: "FAQ phrasing", color: "deep-purple" },
  knowledge_gap: { label: "From chats", color: "orange" },
};

export const caseOrigin = (origin) => CASE_ORIGINS[origin] || { label: origin, color: "grey" };

// Generated cases take their expected answer from the FAQ
export const isGenerated = (c) => !!c && c.origin !== "manual";

export const RUN_STATUS = {
  queued: { label: "Queued", color: "grey" },
  running: { label: "Running", color: "primary" },
  done: { label: "Done", color: "success" },
  failed: { label: "Failed", color: "error" },
};

export const isRunActive = (run) => !!run && ["queued", "running"].includes(run.status);

export const PROFILE_MODES = {
  published: "Live profile",
  draft: "Draft profile",
};

// 1–5 judge scores
export const SCORE_KEYS = [
  { key: "correctness", label: "Correct" },
  { key: "groundedness", label: "Grounded" },
  { key: "tone", label: "Tone" },
];

export function scoreColor(score) {
  if (score == null) return "grey";
  if (score >= 4) return "success";
  if (score >= 3) return "amber darken-2";
  return "error";
}

export function passRateColor(rate) {
  if (rate == null) return "grey";
  if (rate >= 90) return "success";
  if (rate >= 70) return "amber darken-2";
  return "error";
}

export const formatRate = (rate) => (rate == null ? "—" : `${Math.round(rate)}%`);

export function formatDelta(delta) {
  if (delta == null) return "";
  const rounded = Math.round(delta * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded} pts`;
}
