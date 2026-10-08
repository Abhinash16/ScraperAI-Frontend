# Dashboard UI v1: layout and sections

How the client dashboard should be organised now that the platform covers knowledge, bot behaviour, live data, quality and observability. It's a handoff for the team rebuilding the dashboard layout in the frontend repo (`Scraper AI - FE`, Vue 2 + Vuetify). The backend APIs named here already exist unless marked **(new API)**; appendix A lists them per screen with their permissions.

**What this is not:** a visual design. Colours, spacing and components follow the existing app (section 9). The work is mostly re-arranging and connecting screens that already exist.

### Glossary

| Term | Meaning |
|---|---|
| Client | A company using ScraperAI (e.g. Ontrack). Everything in the dashboard is scoped to one client. |
| User / role | A dashboard login under a client. Roles hold permissions like `chat:read`; `owner` has `*` (all). |
| Knowledge source → item → chunk | A source (Website, Manual knowledge, Learned from chats, FAQ set) holds items (a page, note or FAQ, with draft/published status); chunks are what the bot searches. The UI shows sources and items, never chunks. |
| Issue | A problem found when knowledge is published: contradiction, duplicate, secret, personal data, bot instructions. Blockers stop publishing. |
| Knowledge gap ("Unanswered") | A customer question the bot couldn't answer; answering it creates an FAQ. |
| Bot Profile | How the bot behaves (persona, business facts, rules, escalation, conversation settings). Edited as a draft, then published. |
| Sandbox | Test chat that uses the draft profile without affecting customers. |
| Eval / test run | A set of test questions run against the bot and scored; the first run is the baseline. |
| Escalation / handoff | The bot hands a chat to the client's team (AI turned off for a while, or AI reply limit reached). |
| Trace ("Why this answer") | The record of how the bot produced one reply: knowledge used, product lookups, tokens, cost, errors. Kept 30 days. |
| Alert | A problem the platform detected (many failing replies, product API failing), emailed once when it opens and once when it resolves. |
| Product / customer API | The client's own APIs the bot calls live for prices, stock and the customer's bookings. |
| Setup | The guided first-time knowledge build and go-live (`/api/setup`). |

## 1. Who uses it and what they come for

| Person | Comes to… | Frequency |
|---|---|---|
| **Owner / manager** | See if the bot is doing well, fix what it got wrong, change what it says | Daily glance, weekly session |
| **Agent** | Answer chats the bot handed over, check why the bot said something | All day |
| **Setup person** (us, or the client's admin) | Connect the website, product API, WhatsApp, widget; go live | Once, then rarely |

The dashboard therefore has three modes, and the navigation should make each one obvious:

1. **Operate:** conversations and the inbox. Agents live here.
2. **Improve:** knowledge, bot behaviour, quality. Owners spend their weekly session here.
3. **Connect:** channels, data APIs, team, security. Mostly set up once.

## 2. Problems with today's layout

- **Sections are grouped by data type** ("Analysis", "Business Insights", "Data"), not by what the user is trying to do. "Knowledge Gap" sits under Analysis, far from Knowledge; "Chat Analytics" and "Chatbot Knowledge Score" are split across groups.
- **Built features are hidden.** Setup, Sandbox, Quality (evals), Knowledge issues, Bot health, Widget, WhatsApp and Security exist as routes but aren't in the sidebar.
- **There's no "what needs me today?"** A blocked knowledge item, an open alert, an escalated chat and an unanswered question all live on different pages.
- **Two chat areas:** `/dashboard/chat` (its own layout) and the analytics pages.

## 3. Proposed navigation

```
┌──────────────────────────┐
│ ScraperAI   [Ontrack ▾]  │   client name (switcher for our ops users)
│                          │
│ ⌂  Home                  │   what needs attention + key numbers
│ 💬 Inbox            (3)  │   conversations; badge = waiting for a person
│                          │
│ IMPROVE                  │
│ 📚 Knowledge        (2)  │   sources, items, FAQs; badge = blockers
│ ❓ Unanswered      (12)  │   knowledge gaps → become FAQs
│ 🤖 Bot behaviour         │   Bot Profile (persona, facts, rules, conversation)
│ 🧪 Test & quality        │   sandbox, eval runs, baselines
│ 📈 Insights              │   bot health, chat analytics, call analysis, opportunities
│                          │
│ CONNECT                  │
│ 🔌 Channels              │   website widget, WhatsApp
│ 🧩 Data & integrations   │   product API, customer API, webhooks & escalation
│ 👥 Team & security       │   users, roles, IP allowlist, service tokens
│                          │
│ ? Guide                  │
│ ⚙ Account                │   profile, plan & usage (later)
└──────────────────────────┘
```

Rules:
- **Max 2 levels.** A section opens a page with tabs; no nested sidebar groups.
- **Badges only for things a person must act on** (waiting chats, knowledge blockers, unanswered questions). Never for counts that are just information.
- **Hide what the role can't use** (`chat:read`, `knowledge:*`, `settings:manage`, `analytics:view`). An agent sees Home, Inbox, Knowledge (read/write), Unanswered and Guide.
- **Setup** is not a permanent sidebar item. Until the client is live, Home shows the setup checklist at the top; after go-live it's reachable from Knowledge → "Rebuild knowledge".

### Mapping from today's routes

| Today | Proposed |
|---|---|
| Dashboard (`/dashboard`) | **Home** |
| Chats (`/dashboard/chat`, `/chat/:chatId`), WhatsApp bot | **Inbox** (one inbox, channel filter) |
| Knowledge, Knowledge issues | **Knowledge** (tabs: Sources · Issues · FAQs) |
| Knowledge Gap | **Unanswered** |
| Bot Profile | **Bot behaviour** |
| Sandbox, Quality, Quality run | **Test & quality** (tabs: Try it · Test runs) |
| Bot health, Chat Analytics, Chatbot Knowledge Score, Opportunity Analysis, Call Analysis | **Insights** (tabs) |
| Widget, WhatsApp settings | **Channels** (tabs: Website widget · WhatsApp) |
| Integration (product API, customer API, webhooks) | **Data & integrations** (tabs: Products · Customers · Escalation & webhooks) |
| Team, Security | **Team & security** |
| Profile | **Account** |
| Guide (`/documentation`) | **Guide** (also opened in a side panel from any "?") |

Keep the old paths as redirects, as is done today for `sitemap`, `try-chat` etc.

## 4. Home

The page answers two questions in this order: **what needs me?** then **how is the bot doing?**

```
┌───────────────────────────────────────────────────────────────────────┐
│ Good morning, Abhinash                         Last 7 days ▾           │
├───────────────────────────────────────────────────────────────────────┤
│ ⚠ NEEDS YOU                                                           │
│ ● 3 chats waiting for a person (oldest 12 min)          Open inbox →  │
│ ● 2 knowledge items blocked: contradictions             Review →      │
│ ● Your product API failed 5 times in 30 min (alert)     See calls →   │
│ ● 12 questions the bot couldn't answer this week        Answer →      │
├───────────────────────────────────────────────────────────────────────┤
│ Conversations   AI answered   Handed to team   Reply errors  AI cost  │
│     1,284          86%            7%              0.4%        $3.12   │
│   ▲ 12% vs prev   ▲ 3 pts       ▼ 1 pt          ━               ━      │
├──────────────────────────────────┬────────────────────────────────────┤
│ Conversations per day (chart)    │ Knowledge health                    │
│ by channel: web / WhatsApp       │ 412 items · 98% published           │
│                                  │ 2 blockers · 5 warnings             │
│                                  │ Last test run: 84% (baseline 81%)   │
├──────────────────────────────────┴────────────────────────────────────┤
│ Recent conversations                                       View all → │
│ 919…422  "which bikes are available?"   AI · In-stock list · 2m ago   │
│ web#a81  "refund kab milega"            Handed to team · 9m ago       │
└───────────────────────────────────────────────────────────────────────┘
```

- **"Needs you" is the most important block.** Each row is one action, sorted by urgency, and disappears when nothing is pending. With nothing pending: "All clear. The bot is handling everything."
- **Before go-live** the top of Home is the setup checklist (`/api/setup`), with a progress bar and the next step as the main button.
- **Numbers:** at most 5 tiles, each with a comparison to the previous period. Click-through to the matching Insights tab.
- **Sources:** `GET /api/traces/stats` (replies, errors, cost, by status), `GET /api/traces/alerts`, `GET /api/knowledge/issues/summary`, knowledge gap counts, eval runs. A single `GET /api/home` **(new API)** that bundles these would make Home one request; not required to start.

## 5. Inbox (Operate)

The agent's workspace. Three columns on desktop, one at a time on mobile.

```
┌──────────────┬──────────────────────────────────┬─────────────────────┐
│ Filters      │ Conversation                     │ Customer            │
│ ○ Waiting (3)│ ┌──────────────────────────────┐ │ Abhinash Sharma     │
│ ○ Bot active │ │ customer: which bikes are…   │ │ 917602743422        │
│ ○ Resolved   │ │ bot: Hero HF 100 (2024) is…  │ │ Active rental:      │
│ Channel ▾    │ │      Why this answer ▸       │ │ L25J0126064 · EV    │
│ ───────────  │ │ bot: (let me check…)  grey   │ │ ends in 19 days     │
│ 919…422  2m  │ └──────────────────────────────┘ │ ─────────────       │
│ web#a81  9m  │ [ Take over ] [ Resolve ]        │ Bot: AI on ◉        │
│ …            │ ┌ Reply… ─────────────────────┐ │ Escalated until 7:45│
│              │ └──────────────────────────────┘ │ Tags, notes (later) │
└──────────────┴──────────────────────────────────┴─────────────────────┘
```

- **Default filter: "Waiting for a person"** (escalated, or AI off), oldest first.
- **Every bot reply has "Why this answer"** (`traceId` → `GET /api/traces/:id`), already built. Holding messages are shown greyed and smaller, so agents can tell them from answers (needs a `kind: "holding"` flag on those messages **(new API)**; today they only lack a `traceId`, like replies sent before traces existed).
- **"Take over"** turns AI off for the chat and assigns the agent; **"Resolve"** sets the ticket status and gives the bot back.
- **Customer panel** shows what the customer API returned (the same data the bot sees), so the agent and the bot have the same context.
- **From a wrong answer, one click to fix it:** "Fix this answer" opens a side panel: edit the FAQ or knowledge item the answer cited, or add a new FAQ from the customer's question. This is how agent corrections feed knowledge (roadmap Q3).

## 6. Improve

### Knowledge
Tabs: **Sources · Issues · FAQs**.
- **Sources**: cards per source (Website, Manual knowledge, Learned from chats, FAQ sets, later Documents) with item counts, last import, status (live / paused / staging / retiring). Primary actions: "Add website pages", "Upload document" (Phase 4), "Add note", "Add FAQ".
- **Source detail**: an item table (title, status chip, health chip, last edited) with bulk publish/archive. Item editor: body on the left; on the right: status, issues for this item, "Test this in the sandbox".
- **Issues**: blockers first; the side-by-side contradiction view (already built) with Resolve / Dismiss / Publish anyway.
- **Status chips are the same everywhere**: Draft (grey), Needs review (red), Published (green), Held (amber), Archived (outline).

### Unanswered
The knowledge-gap queue as a to-do list: question, how often it was asked, last asked, an example conversation. The main action is "Answer", which creates an FAQ in "Learned from chats". Secondary: "Not relevant". The badge counts open gaps.

### Bot behaviour
The Bot Profile, as tabs in the order people think about them: **Identity · Business facts · Rules · Escalation · Conversation · Custom instructions**.
- A sticky **draft bar** at the bottom: "Unpublished changes · Test in sandbox · Publish". It already exists; keep it on every tab.
- **History** (versions, rollback) behind a "History" button, not a tab.

### Test & quality
Tabs: **Try it · Test runs**.
- **Try it** is the sandbox: chat on the left, "Why this answer" on the right, toggles for draft profile and staging knowledge.
- **Test runs** are evals: score trend with the baseline line, the latest run's failures first, "Generate questions from FAQs".

### Insights
Tabs: **Bot health · Conversations · Knowledge score · Opportunities · Calls**.
- **Bot health** is already built (tiles, per-day chart, problems table, alerts).
- **Conversations** is today's chat analytics.
- Tabs that need a feature the client doesn't use (e.g. Calls) are hidden, not empty.

## 7. Connect

### Channels
Tabs: **Website widget · WhatsApp**. Each tab follows the same structure: a status card at the top ("Live on 2 domains" / "Receiving messages · last 3 min ago"), settings below, and an install/test block (widget embed code with a copy button, the WhatsApp webhook URL with a "send a test message" check).

### Data & integrations
Tabs: **Products · Customers · Escalation & webhooks**. Each tab, top to bottom:
1. **Status card**: connected / paused (circuit breaker) / not set up, with the 24h failure rate and response time (`/integration-calls`).
2. **Connection**: URL, method, sign-in type, extra parameters, timeout.
3. **Mapping** (Products): field mapping with suggestions from a real response.
4. **Try it**: the preview with the listing check.
5. **Recent calls**.
- **Escalation & webhooks** also holds the alert email addresses and the escalation duration.

### Team & security
Tabs: **Users · Roles · IP allowlist · Service tokens**.

## 8. Patterns used everywhere

- **Status before settings.** Every configuration page starts with a card that says whether it's working, in one sentence, before the form.
- **Preview before save** for anything that changes what customers see: the Bot Profile draft + sandbox, the product API "Try it", the widget preview.
- **"Why" is always one click away.** Bot replies → trace; blocked items → issue; alerts → the failing calls or replies.
- **Plain-language errors** that say what happened and what to do (the backend already returns these for knowledge failures, integrations and settings). Never show raw JSON outside a "Technical details" expander.
- **Empty states teach.** Each one says what the page is for and gives the first action ("No unanswered questions. When the bot can't answer something, it shows up here for you to answer once.").
- **Guide in context.** A "?" in each page header opens the matching guide entry (`featureGuides.js`) in a side panel instead of navigating away.
- **Secrets**: masked, with the "🔒 Encrypted and never shown again" note (built).
- **Destructive actions** (delete source, revoke token, switch over) use a confirmation that names the consequence ("Deletes 120 items and removes them from the bot immediately").
- **Time**: relative ("9 min ago") with the exact IST time on hover.
- **Responsive**: Inbox and Home must work on a phone; settings pages can be desktop-first.

## 9. Visual direction

- **Calm, dense, readable.** It's a work tool: white/neutral surfaces, one accent colour (the current indigo) for primary actions, and colour reserved for meaning (red = blocked/error, amber = needs attention, green = live/ok).
- **Cards for status, tables for lists**, chips for states. No decorative illustrations inside the app; use them only for empty states.
- **Numbers** in tiles: big value, small label, comparison underneath. Charts are simple bar/line charts with at most two series.
- Keep Vuetify; build shared components for the patterns above (`StatusCard`, `NeedsYouList`, `StatusChip`, `DraftBar`, `TryItPanel`, `GuideDrawer`) so pages stay consistent.

## 10. Rollout order

1. **Navigation + redirects** (section 3). The biggest gain for the least work: every built feature becomes findable.
2. **Home with "Needs you"** (section 4), using the existing endpoints.
3. **Inbox merge** with "Take over / Resolve" and "Fix this answer" (section 5).
4. **Status cards** on Channels and Data & integrations (section 7).
5. **Guide side panel** and empty states (section 8).
6. Later, with their features: Documents in Knowledge (Phase 4), Plan & usage in Account (P2), Conversations/sessions in Inbox (Track S).

### What "done" means for each step

1. **Navigation**
   - The sidebar matches section 3; each item is hidden when the user lacks its permission (appendix A).
   - Every old path in the mapping table redirects to its new place (bookmarks keep working).
   - No built screen is unreachable from the sidebar.
2. **Home**
   - "Needs you" shows only rows with a non-zero count, sorted by urgency (waiting chats → knowledge blockers → open alerts → unanswered questions), each linking to the filtered page.
   - The 5 tiles come from `/api/traces/stats` for the selected range and show the change vs the previous range.
   - Before go-live (setup in progress), the setup checklist is the first block.
   - An agent (no `analytics:view`) sees "Needs you" and recent conversations, not the numbers.
3. **Inbox**
   - One list for web and WhatsApp with a channel filter; default filter "Waiting for a person".
   - "Take over" sets AI off (`PATCH /api/chats/:chatId/ai`); "Resolve" sets the ticket status and turns AI back on.
   - New messages arrive live over the socket; "Why this answer" works on live and loaded messages.
   - Usable on a phone (one column at a time).
4. **Status cards**: each Channels and Data & integrations tab starts with a one-sentence status (working / paused / not set up) before the form.
5. **Guide panel**: the "?" in a page header opens that page's guide entry (`src/content/featureGuides.js`) in a side panel; every list page has an empty state that explains it.

## Appendix A: APIs per screen

All under the API base URL (production `https://ai-api.on-track.in/api`), with the user's client JWT (`Authorization: Bearer …`). Responses are `{ success, data }` or `{ success: false, message }`; show `message` to the user as is (it's written for them).

| Screen | Calls | Permission |
|---|---|---|
| **Home** | `GET /traces/stats?days=7` · `GET /traces/alerts` · `GET /knowledge/issues/summary` · `GET /knowledge/gaps` · `GET /setup` · `GET /eval/runs` · `GET /chats` | stats/alerts `analytics:view`; issues/gaps `knowledge:read`; chats `chat:read`; setup/eval `settings:manage` |
| **Inbox** list / chat | `GET /chats` · `GET /chats/:chatId` · `PATCH /chats/:chatId/ai` · `PATCH /chats/:chatId/ticket-status` · socket (below) | `chat:read`; changes need `chat:reply` |
| Inbox "Why this answer" | `GET /traces/:id` (the message's `traceId`) | `chat:read` |
| Inbox customer panel | `POST /clients/customer-api-settings/test` with the chat's phone returns what the bot sees; a read-only `GET` for agents would be cleaner **(new API)** | `settings:manage` today |
| **Knowledge** sources | `GET/POST /knowledge/sources` · `GET/PATCH/DELETE /knowledge/sources/:id` · `POST …/pause` `…/resume` · imports: `…/import` (URLs), `…/import/sitemap`, `…/import/file` (CSV/JSON of URLs), `…/import/faqs` (FAQ CSV) · `POST …/extract-faqs` | read `knowledge:read`; add/edit `knowledge:write`; pause/publish `knowledge:publish`; delete `knowledge:delete` |
| Knowledge items | `GET /knowledge/sources/:id/items` · `GET/PATCH/DELETE /knowledge/items/:id` · `POST /knowledge/items/:id/publish` `unpublish` `archive` `reimport` · `POST /knowledge/items/bulk` | as above |
| Knowledge issues | `GET /knowledge/issues` · `GET /knowledge/issues/summary` · `GET /knowledge/issues/:id` · `POST …/dismiss` · `POST …/resolve` | `knowledge:read`; dismiss/resolve `knowledge:publish` |
| **Unanswered** | `GET /knowledge/gaps` · `GET /knowledge/gaps/:id` · `POST …/answer` · `POST …/defer` | `knowledge:read`; answer/defer `knowledge:write` |
| **Bot behaviour** | `GET/PUT /clients/bot-profile` (draft; send the `version` you loaded) · `POST /clients/bot-profile/publish` · `GET /clients/bot-profile/history` · `POST /clients/bot-profile/rollback` | `settings:manage` |
| **Test & quality**: Try it | `POST /sandbox/sessions` · `GET/DELETE /sandbox/sessions/:id` · `POST /sandbox/sessions/:id/messages` | `settings:manage` |
| Test runs | `GET/POST /eval/cases` · `POST /eval/cases/generate` · `PATCH/DELETE /eval/cases/:id` · `GET/POST /eval/runs` · `GET /eval/runs/:id` · `POST /eval/runs/:id/baseline` | `settings:manage` |
| **Insights**: Bot health | `GET /traces/stats` · `GET /traces?status=error,handoff` · `GET /traces/alerts` | stats/alerts `analytics:view`; list `chat:read` |
| Conversations analytics | `GET /analytics` · `GET /analytics/messages` · `GET /chats/analytics` | `analytics:view` |
| Knowledge score / opportunities | `GET /client-insight` · `POST /client-insight/create` `/refresh` | `insight:read` / `insight:manage` |
| Calls | `/call-analysis/*` (existing screens) | `call:read` / `call:reply` |
| **Channels**: widget | `GET/PUT /clients/widget-settings` (allowed domains, support WhatsApp number) | `settings:manage` |
| WhatsApp | `GET/PUT /clients/whatsapp-integration` · `POST /clients/whatsapp-integration/regenerate-key` · `PUT /clients/whatsapp-settings` | `settings:manage` |
| **Data & integrations**: products | `GET/PUT /clients/product-api-settings` · `POST …/preview` (Try it) · `POST …/test` · `GET …/index` · `POST …/index/sync` · `GET /clients/integration-calls?kind=product` | `settings:manage` |
| Customers | `GET/PUT /clients/customer-api-settings` · `POST …/test` · `GET /clients/integration-calls?kind=customer` | `settings:manage` |
| Escalation & webhooks | `PUT /clients/webhook` (escalate / upsell / followup) · `GET/PUT /clients/escalation-alerts` | `settings:manage` |
| **Team & security** | users `GET/POST /users`, `PUT/DELETE /users/:userId`, `PUT /users/:userId/password`, `GET /users/roles` · roles `GET/POST /roles`, `PUT/DELETE /roles/:roleId`, `GET /roles/permissions` · IP allowlist `GET/POST /clientIp`, `PUT/DELETE /clientIp/:id` | `user:manage`, `user:reset-password`, `role:manage`, `ip:read`/`ip:manage` |
| **Account** | `GET /clients/currentUser` (user, role, client settings) · `PUT /clients/currentUser/update` | signed in |

**Live updates (Socket.IO, same host):** connect with `auth: { token: <client JWT> }` (needs `chat:read`; replying needs `chat:reply`). Events: `joinRoom` (open a chat) → `previousMessages`; `sendMessage` (agent reply); incoming `message` (new message; bot replies carry `traceId`), `typing` / `stopTyping` (`sender: "ai"` while the bot is writing; a "let me check" message is followed by `typing` again).

**Permissions by default role:** owner `*`; admin `chat:read` `chat:reply` `analytics:view` `user:manage` `user:reset-password` `role:manage` `call:read` `call:reply` `knowledge:*` `ip:read` `ip:manage` `settings:manage` `insight:read` `insight:manage`; agent `chat:read`, `chat:reply`, `call:read`, `knowledge:read`, `knowledge:write`, `insight:read`. Clients can create their own roles, so always check permissions, not role names.

## Appendix B: existing frontend pieces to reuse

Built recently in the FE repo; keep them and move them into the new layout rather than rebuilding:
- `AnswerTrace` (sandbox) and `components/traces/LiveTrace.vue` ("Why this answer" for live messages).
- Bot health page (`/dashboard/bot-health`) with tiles, charts, problems table and alert banners.
- Knowledge issue comparison dialog (side-by-side contradiction view).
- Bot Profile editor with the draft bar, Conversation tab and History.
- `ApiAuthEditor`, `ExtraParamsEditor`, `FieldMapEditor`, `ProductApiPreview` ("Try it"), `IntegrationCallLog`.
- `SecretNotice` (encrypted-key notice) and the Guide hub (`src/content/featureGuides.js`, one entry per feature: keep it as the single source of help text).

