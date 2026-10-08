import apiClient from "@/service/axios";

// Conversations: a chat split into sessions that end after inactivity.

export async function fetchConversations(chatId) {
  const { data } = await apiClient.get(`/chats/${chatId}/conversations`);
  return Array.isArray(data.data) ? data.data : [];
}

export const OUTCOMES = {
  ai: { label: "Handled by the bot", color: "primary" },
  agent: { label: "Handled by your team", color: "success" },
  handed_off: { label: "Handed to your team, no reply", color: "warning" },
  no_reply: { label: "No reply needed", color: "grey" },
};

export const CLOSED_REASONS = {
  inactivity: "Ended after inactivity",
  resolved: "Ended when the chat was resolved",
  manual: "Ended by your team",
};

// Status of a conversation that hasn't ended
export const OPEN_STATUS = {
  open: { label: "Open", color: "primary" },
  escalated: { label: "With your team", color: "deep-purple" },
  waiting: { label: "Waiting for the customer", color: "grey" },
};

export const isOpen = (c) => c && c.status !== "closed";

// "Tue 8 Oct, 10:42"
export function formatStart(value) {
  if (!value) return "";
  const d = new Date(value);
  const day = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${day}, ${time}`;
}

// "12 min", "3 h 5 min", "2 days"
export function formatDuration(c) {
  const end = c.closedAt || c.lastActivityAt;
  if (!c.startedAt || !end) return "";
  const min = Math.max(0, Math.round((new Date(end) - new Date(c.startedAt)) / 60000));
  if (min < 1) return "under a minute";
  if (min < 60) return `${min} min`;
  if (min < 48 * 60) {
    const h = Math.floor(min / 60);
    return min % 60 ? `${h} h ${min % 60} min` : `${h} h`;
  }
  return `${Math.round(min / 1440)} days`;
}

// "Ended after inactivity · Handled by the bot"
export function endedLabel(c) {
  const parts = [CLOSED_REASONS[c.closedReason], OUTCOMES[c.outcome]?.label].filter(Boolean);
  return parts.join(" · ");
}

// Messages with a divider before each conversation and a footer after closed
// ones. Messages without a conversationId (before conversations existed) form
// one "Earlier messages" group. Without any conversationId, no dividers.
export function groupMessages(messages, conversations) {
  const byId = Object.fromEntries((conversations || []).map((c) => [String(c._id), c]));
  const grouped = messages.some((m) => m.conversationId);
  const rows = [];
  let current;
  messages.forEach((m, i) => {
    const id = m.conversationId ? String(m.conversationId) : "";
    if (grouped && (i === 0 || id !== current)) {
      const prev = byId[current];
      if (i > 0 && prev && !isOpen(prev)) rows.push({ footer: prev, key: `end-${current}` });
      rows.push({ divider: byId[id] || { _id: id, earlier: !id }, key: `conv-${id || "earlier"}-${i}` });
      current = id;
    }
    rows.push({ message: m, key: m._id || `${m.timestamp}-${i}` });
  });
  const last = byId[current];
  if (grouped && last && !isOpen(last)) rows.push({ footer: last, key: `end-${current}` });
  return rows;
}
