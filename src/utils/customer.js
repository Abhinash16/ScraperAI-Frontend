// The Inbox customer panel: what the client's customer API returns for a
// chat's customer (backend: GET /api/chats/:chatId/customer, fields as in
// documentation/api/customer-context.md). A section the API didn't send is
// undefined ("not sent"), which is not the same as [] ("none").
import apiClient from "@/service/axios";

export const getChatCustomer = (chatId, refresh = false) =>
  apiClient
    .get(`/chats/${encodeURIComponent(chatId)}/customer`, { params: refresh ? { refresh: 1 } : {} })
    .then(({ data }) => data.data);

export const SOURCES = {
  whatsapp: "their WhatsApp number",
  voice: "the caller's number",
  verified_web: "their verified phone",
};

export const UNAVAILABLE = {
  not_configured: "Set up the Customer API to see customer data here.",
  no_phone: "There's no phone for this chat, so we can't look the customer up.",
  failed: "Your customer API didn't answer.",
  paused: "Calls to your customer API are paused for a minute after several failures.",
};

const CLOSED = ["resolved", "closed", "cancelled", "completed", "done"];
export const isClosedRequest = (sr) => CLOSED.includes(String(sr?.status || "").toLowerCase());

const CURRENT_RECORDS = ["active", "upcoming", "pending"];
export const isCurrentRecord = (r) => CURRENT_RECORDS.includes(String(r?.status || "").toLowerCase());

export const UPCOMING_TYPES = {
  rental_renewal: { label: "Rental renewal", color: "blue" },
  overdue_rental: { label: "Overdue rental", color: "error" },
  km_bill: { label: "Km bill", color: "amber darken-3" },
};
export const upcomingType = (t) =>
  UPCOMING_TYPES[t] || { label: t ? String(t).replace(/_/g, " ") : "Coming up", color: "grey" };

// "₹2,400" (or "USD 20" for other currencies); "" when missing
export function money(amount, currency) {
  if (amount == null || amount === "") return "";
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  const cur = (currency || "INR").toUpperCase();
  const text = n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return cur === "INR" ? `₹${text}` : `${cur} ${text}`;
}

// "21 Nov 2026"; "" when missing; the raw text if it isn't a date
export function day(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function time(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// Open requests first, then the newest
export function sortRequests(list) {
  return [...(list || [])].sort((a, b) => {
    const closed = Number(isClosedRequest(a)) - Number(isClosedRequest(b));
    if (closed) return closed;
    return new Date(b.opened_at || 0) - new Date(a.opened_at || 0);
  });
}

// Newest first, at most `max`
export const newestPayments = (list, max = 10) =>
  [...(list || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, max);

// Current bookings first, then the newest start
export function sortRecords(list) {
  return [...(list || [])].sort((a, b) => {
    const current = Number(isCurrentRecord(b)) - Number(isCurrentRecord(a));
    if (current) return current;
    return new Date(b.start_at || 0) - new Date(a.start_at || 0);
  });
}
