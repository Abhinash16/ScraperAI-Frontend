import apiClient from "@/service/axios";

// Sales mode: every conversation is scored as a lead. Backend: /api/leads
// (chat:read), /api/leads/deals and /api/analytics/agents (analytics:view).

// In order; a lead only moves forward. "lost" is set aside from the funnel.
export const STAGES = {
  browsing: { label: "Browsing", color: "blue-grey", help: "Looking around, no clear interest yet" },
  interested: { label: "Interested", color: "blue", help: "Asked about a product or price" },
  qualified: { label: "Ready to book", color: "indigo", help: "Gave the details a booking needs" },
  checkout: { label: "Checkout", color: "deep-purple", help: "About to pay: the bot is offering or has sent a payment link" },
  won: { label: "Paid", color: "success", help: "Your system reported a payment" },
  lost: { label: "Lost", color: "grey", help: "Said no, or the link was declined or expired" },
};
export const FUNNEL = ["browsing", "interested", "qualified", "checkout", "won"];
export const stageInfo = (stage) => STAGES[stage] || { label: stage || "—", color: "grey", help: "" };

export const PLATFORMS = {
  web: "Website",
  whatsapp: "WhatsApp",
  voice: "Phone",
};

export const DEAL_KINDS = {
  new_booking: "New booking",
  booking: "Booking",
  extension: "Extension",
  other: "Other",
};

export const ATTRIBUTION = {
  bot_link: { label: "Paid through the bot's link", color: "success" },
  bot_conversation: { label: "Paid after a bot chat", color: "primary" },
  none: { label: "Without the bot", color: "grey" },
};

// Score colour: hot leads stand out
export function scoreColor(score, hot = 70) {
  if (score >= hot) return "deep-orange";
  if (score >= 40) return "amber darken-2";
  return "blue-grey lighten-1";
}

// "Activa 6G · Koramangala hub · from 1 Dec · 3 months"
export function leadWants(lead) {
  if (!lead) return "";
  const date = lead.startDate ? `from ${formatDay(lead.startDate)}` : "";
  return [lead.product, lead.location, date, lead.duration].filter(Boolean).join(" · ");
}

export function formatDay(value) {
  const d = new Date(value);
  // Free text ("next Monday") stays as written
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function formatMoney(amount, currency = "INR") {
  if (amount == null || amount === "") return "";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || ""} ${amount}`.trim();
  }
}

// The newest conversation that has a lead, for the Inbox header
export const latestLead = (conversations) =>
  (conversations || []).find((c) => c.lead && c.lead.stage) || null;

export async function listLeads(params) {
  const { data } = await apiClient.get("/leads", { params });
  return data.data || { items: [], total: 0 };
}

export async function listDeals(params) {
  const { data } = await apiClient.get("/leads/deals", { params });
  return data.data || { items: [], total: 0 };
}

export async function fetchAgentReports(days) {
  const { data } = await apiClient.get("/analytics/agents", { params: { days } });
  return data.data || { agents: [] };
}
