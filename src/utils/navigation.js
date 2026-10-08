// The dashboard sidebar (documents/dashboard_ui_v1.md, section 3): sections
// grouped by what the user is doing, each opening its screens as tabs.
// Screens keep their existing routes; this only decides where they appear.
import apiClient from "@/service/axios";
import { can } from "@/utils/knowledge";

// A link target: a path plus the query values that must match for it to be
// the active one, e.g. { path: "/dashboard/integration", query: { section: "widget" } }.
const link = (path, query) => ({ path, ...(query ? { query } : {}) });

const startsWith = (prefix) => (route) =>
  route.path === prefix || route.path.startsWith(`${prefix}/`);

const queryIs = (path, key, values, fallback) => (route) =>
  route.path === path && [].concat(values).includes(route.query[key] || fallback);

const CHAT_INSIGHTS = ["/dashboard/chat/insights", "/dashboard/chat/chatbot-knowledge-score"];

// Keys of `badges` returned by loadAttentionCounts()
export const BADGE = {
  knowledgeBlockers: "knowledgeBlockers",
  unanswered: "unanswered",
};

export const NAV_GROUPS = [
  {
    id: "operate",
    items: [
      {
        id: "home",
        name: "Home",
        icon: "$house",
        tabs: [{ name: "Home", to: link("/dashboard"), match: (r) => r.path === "/dashboard" || r.path === "/dashboard/" }],
      },
      {
        id: "inbox",
        name: "Inbox",
        icon: "$inbox",
        description: "Conversations with your customers",
        tabs: [
          {
            name: "Inbox",
            to: link("/dashboard/chat"),
            permission: "chat:read",
            match: (r) => startsWith("/dashboard/chat")(r) && !CHAT_INSIGHTS.includes(r.path),
          },
        ],
      },
    ],
  },
  {
    id: "improve",
    title: "Improve",
    items: [
      {
        id: "knowledge",
        name: "Knowledge",
        icon: "$folder-open",
        badge: BADGE.knowledgeBlockers,
        badgeHint: "knowledge blockers to review",
        description: "Website pages, FAQs and notes the bot answers from",
        tabs: [
          {
            name: "Sources",
            to: link("/dashboard/knowledge"),
            permission: "knowledge:read",
            match: (r) =>
              startsWith("/dashboard/knowledge")(r) &&
              !startsWith("/dashboard/knowledge/issues")(r) &&
              !startsWith("/dashboard/knowledge/notices")(r),
          },
          {
            name: "Issues",
            to: link("/dashboard/knowledge/issues"),
            permission: "knowledge:read",
            match: startsWith("/dashboard/knowledge/issues"),
          },
          {
            name: "Notices",
            to: link("/dashboard/knowledge/notices"),
            permission: ["knowledge:read", "notices:manage"],
            match: startsWith("/dashboard/knowledge/notices"),
          },
          {
            name: "Setup",
            to: link("/dashboard/setup"),
            permission: "settings:manage",
            match: startsWith("/dashboard/setup"),
          },
        ],
      },
      {
        id: "unanswered",
        name: "Unanswered",
        icon: "$message-circle-question-mark",
        badge: BADGE.unanswered,
        badgeHint: "questions the bot couldn't answer",
        description: "Questions the bot couldn't answer yet",
        tabs: [
          {
            name: "Unanswered",
            to: link("/dashboard/knowledge-gap"),
            permission: "knowledge:read",
            match: startsWith("/dashboard/knowledge-gap"),
          },
        ],
      },
      {
        id: "bot",
        name: "Bot behaviour",
        icon: "$bot",
        description: "Persona, business facts, rules and escalation",
        tabs: [
          {
            name: "Bot Profile",
            to: link("/dashboard/bot-profile"),
            permission: "settings:manage",
            match: startsWith("/dashboard/bot-profile"),
          },
        ],
      },
      {
        id: "quality",
        name: "Test & quality",
        icon: "$flask-conical",
        description: "Try the bot and run answer-quality tests",
        tabs: [
          {
            name: "Try it",
            to: link("/dashboard/sandbox"),
            permission: "settings:manage",
            match: startsWith("/dashboard/sandbox"),
          },
          {
            name: "Test runs",
            to: link("/dashboard/quality"),
            permission: "settings:manage",
            match: startsWith("/dashboard/quality"),
          },
        ],
      },
      {
        id: "insights",
        name: "Insights",
        icon: "$chart-line",
        description: "Bot health, conversation analytics and calls",
        tabs: [
          {
            name: "Bot health",
            to: link("/dashboard/bot-health"),
            permission: "analytics:view",
            match: startsWith("/dashboard/bot-health"),
          },
          {
            name: "Conversations",
            to: link("/dashboard/chat-analytics"),
            permission: "analytics:view",
            match: (r) => r.path === "/dashboard/chat-analytics" || r.path === "/dashboard/chat/insights",
          },
          {
            name: "Knowledge score",
            to: link("/dashboard/chat/chatbot-knowledge-score"),
            permission: "insight:read",
            match: startsWith("/dashboard/chat/chatbot-knowledge-score"),
          },
          {
            name: "Opportunities",
            to: link("/dashboard/opportunity-analysis"),
            permission: "insight:read",
            match: startsWith("/dashboard/opportunity-analysis"),
          },
          {
            name: "Calls",
            to: link("/dashboard/call-batches"),
            permission: "call:read",
            match: (r) =>
              ["/dashboard/call-batches", "/call-analysis/report", "/batch-analysis"].some((p) =>
                startsWith(p)(r),
              ),
          },
        ],
      },
    ],
  },
  {
    id: "connect",
    title: "Connect",
    items: [
      {
        id: "channels",
        name: "Channels",
        icon: "$messages-square",
        description: "Website widget and WhatsApp",
        tabs: [
          {
            name: "Website widget",
            to: link("/dashboard/integration", { section: "widget" }),
            permission: "settings:manage",
            match: queryIs("/dashboard/integration", "section", "widget", "widget"),
          },
          {
            name: "WhatsApp",
            to: link("/dashboard/integration", { section: "tellephant" }),
            permission: "settings:manage",
            match: queryIs("/dashboard/integration", "section", "tellephant"),
          },
        ],
      },
      {
        id: "data",
        name: "Data & integrations",
        icon: "$plug",
        description: "Product and customer APIs, webhooks, AI provider",
        tabs: [
          {
            name: "Products",
            to: link("/dashboard/integration", { section: "api-config", tab: "product-api" }),
            permission: "settings:manage",
            match: (r) =>
              queryIs("/dashboard/integration", "section", "api-config")(r) && r.query.tab === "product-api",
          },
          {
            name: "Customers",
            to: link("/dashboard/integration", { section: "api-config", tab: "customer-api" }),
            permission: "settings:manage",
            match: (r) =>
              queryIs("/dashboard/integration", "section", "api-config")(r) && r.query.tab !== "product-api",
          },
          {
            name: "Escalation & webhooks",
            to: link("/dashboard/integration", { section: "webhooks" }),
            permission: "settings:manage",
            match: queryIs("/dashboard/integration", "section", "webhooks"),
          },
          {
            name: "AI & keys",
            to: link("/dashboard/integration", { section: "ai-provider" }),
            permission: "settings:manage",
            match: queryIs("/dashboard/integration", "section", ["ai-provider", "api-keys"]),
          },
        ],
      },
      {
        id: "team",
        name: "Team & security",
        icon: "$shield-user",
        description: "Users, roles and IP allowlist",
        tabs: [
          {
            name: "Users & roles",
            to: link("/dashboard/team"),
            permission: ["user:manage", "role:manage"],
            match: startsWith("/dashboard/team"),
          },
          {
            name: "Security",
            to: link("/dashboard/profile", { section: "security" }),
            match: queryIs("/dashboard/profile", "section", "security"),
          },
        ],
      },
    ],
  },
];

// Pinned to the bottom of the sidebar
export const NAV_FOOTER = [
  {
    id: "guide",
    name: "Guide",
    icon: "$circle-help",
    tabs: [{ name: "Guide", to: link("/dashboard/documentation"), match: startsWith("/dashboard/documentation") }],
  },
  {
    id: "account",
    name: "Account",
    icon: "$circle-user",
    tabs: [
      {
        name: "Account",
        to: link("/dashboard/profile"),
        match: (r) => r.path === "/dashboard/profile" && r.query.section !== "security",
      },
    ],
  },
];

const allows = (perms, permission) =>
  !permission || [].concat(permission).some((p) => can(perms, p));

// The item with only the tabs this user can open; null when none are left.
// While permissions load (`perms` null) only unrestricted tabs show.
export function visibleItem(item, perms) {
  const tabs = item.tabs.filter((t) => allows(perms || [], t.permission));
  return tabs.length ? { ...item, tabs, to: tabs[0].to } : null;
}

export function visibleGroups(perms) {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.map((i) => visibleItem(i, perms)).filter(Boolean),
  })).filter((g) => g.items.length);
}

// The sidebar item (with visible tabs) the current route belongs to
export function activeItem(route, perms) {
  const items = [...NAV_GROUPS.flatMap((g) => g.items), ...NAV_FOOTER];
  for (const raw of items) {
    if (!raw.tabs.some((t) => t.match(route))) continue;
    // Show the section even if this tab is hidden from the sidebar, so the
    // header still names where the user is.
    return visibleItem(raw, perms) || { ...raw, to: raw.tabs[0].to };
  }
  return null;
}

// Counts of things a person must act on, for sidebar badges and Home.
// Read-only; each count is skipped without permission and null on failure.
// Cached briefly so the layouts and Home share one set of requests.
const CACHE_MS = 30 * 1000;
let cached = null;

export function loadAttentionCounts(perms, { fresh = false } = {}) {
  const token = localStorage.getItem("user-token");
  if (!fresh && cached && cached.token === token && Date.now() - cached.at < CACHE_MS) {
    return cached.promise;
  }
  const canRead = can(perms, "knowledge:read");
  const promise = Promise.all([
    canRead
      ? apiClient
          .get("/knowledge/issues/summary")
          .then(({ data }) => data.data?.blocker || 0)
          .catch(() => null)
      : null,
    canRead
      ? apiClient
          .get("/knowledge/gaps", { params: { status: "pending", limit: 1, offset: 0 } })
          .then(({ data }) => data.data?.total || 0)
          .catch(() => null)
      : null,
  ]).then(([blockers, gaps]) => ({
    [BADGE.knowledgeBlockers]: blockers,
    [BADGE.unanswered]: gaps,
  }));
  cached = { token, at: Date.now(), promise };
  return promise;
}
