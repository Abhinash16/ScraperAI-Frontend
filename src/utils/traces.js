import apiClient from "@/service/axios";
import { productModeInfo } from "@/utils/productModes";

// Live reply traces (/api/traces), kept by the backend for 30 days.
export const TRACES_API = "/traces";

export async function fetchTrace(id) {
  const { data } = await apiClient.get(`${TRACES_API}/${id}`);
  return data.data;
}

export const PLATFORMS = { web: "Website", whatsapp: "WhatsApp" };

export const STATUS = {
  ok: { label: "Answered", color: "success" },
  error: { label: "Error", color: "error" },
  handoff: { label: "Handed off", color: "warning" },
  escalated: { label: "Escalated", color: "deep-purple" },
  media: { label: "Media", color: "grey" },
};
export const statusInfo = (s) => STATUS[s] || { label: s || "Unknown", color: "grey" };

// One-line explanations for replies that didn't come from an AI answer
export const SOURCE_NOTES = {
  cache: "Answered from a saved answer (24h).",
  greeting: "Answered with the greeting.",
  small_talk: "Small talk, answered without searching your knowledge.",
  handoff: "AI reply limit reached; handoff message sent.",
  escalated: "Chat is with your team.",
  media: "The customer sent media, so there was no AI answer.",
};

export const productLookupLabel = (mode) => (mode ? productModeInfo(mode).label : "");

export function formatSeconds(ms) {
  return typeof ms === "number" ? `${(ms / 1000).toFixed(1)}s` : "—";
}

// Estimates from list prices: small amounts need more decimals
export function formatCost(usd) {
  if (typeof usd !== "number") return "—";
  return `≈$${usd < 0.01 ? usd.toFixed(4) : usd.toFixed(2)}`;
}
