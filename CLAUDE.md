# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm install       # install dependencies
npm run serve     # dev server with hot reload (vue-cli-service serve)
npm run build     # production build to dist/ (vue-cli-service build)
npm run lint      # eslint --fix via vue-cli-service lint
```

There is no test suite/framework configured in this project.

Requires a `.env.development` (or `.env.production`) file with:
```
VUE_APP_API_BASE_URL=http://localhost:4000/api
```

Deployment is via Firebase Hosting (`firebase.json` / `.firebaserc`, project `scraperai-in`), serving the `dist/` build with SPA rewrites to `index.html`.

## Architecture

This is a **Vue 2** SPA (Options API, `vue-cli-service`, Vuetify 2 for UI) — not Vue 3/Composition API. Path alias `@` maps to `src/` (see `jsconfig.json`).

There is **no Vuex/Pinia store**. State is managed per-component (component `data()`), with cross-cutting concerns (auth token) handled via `localStorage` + a shared axios instance rather than a central store.

### Auth flow

- `src/service/axios.js` creates the single shared axios instance (`apiClient`), reading `VUE_APP_API_BASE_URL`. It exposes `setAuthToken()` which sets/clears the `Authorization: Bearer` header, and an interceptor that force-logs-out (clears token, redirects to `/login`) on any 401 response.
- `src/utils/initAuth.js#initializeAuth()` runs once in `main.js` at boot to restore the token from `localStorage` (`user-token`) into axios.
- `src/router/index.js` has a global `router.beforeEach` guard: routes with `meta.requiresAuth` check `localStorage.getItem("user-token")`, redirecting to `/login` if absent. Routes can additionally set `meta.permission` (e.g. `"user:manage"`), which is checked against `currentUser.user.roleId.permissions` (fetched once and cached in a module-level variable) fetched from `/clients/currentUser`; `"*"` grants all permissions.

### Routing / layout structure

The app is organized as multiple **parallel dashboard sections**, each with its own layout wrapping a `<router-view>` for its child screens, all mounted under `/dashboard/*` in `src/router/index.js`:

- `DashboardLayout.vue` — main dashboard: home, profile, Knowledge (sources, items, issues), knowledge gaps, Bot Profile, sandbox, Quality, Setup, integrations, the Guide (`DocumentationPage.vue`), insights, chat analytics and Team. Its `sideNavs` data is not rendered; navigation is the tiles on the dashboard home (`DasboardHome.vue`).
- `ChatLayout.vue` — `/dashboard/chat/*` (chat list, chat view, chat insights)
- `CallAnalysisLayout.vue` — call batch analysis and reports

Screens live under `src/screens/dashboard/**`, with subfolders per section (`knowledge/`, `knowledgeGap/`, `quality/`, `setup/`, `insights/`, `Chats/`). Their building blocks live in matching `src/components/` folders (`knowledge/`, `quality/`, `setup/`, `integrations/`, `team/`, `profile/`, `sandbox/`), and per-feature helpers in `src/utils/` (`knowledge.js`, `quality.js`, `setup.js`, `team.js`, …). Top-level marketing/auth pages (landing, login, signup) live in `src/pages/`.

Dashboard routes are lazy-loaded via dynamic `import()`. Old URLs of removed screens (`page-list`, `scraped-pages`, `sitemap`, `content-chunks`, `forms`) redirect to their replacements.

### Feature areas (backend contract)

These screens follow the backend's API on the `feat/w0-widget-sessions` branch of `Scraper AI - BE/ScraperAI-backend`. Responses are `{ success, data }`, and 400/409 messages are written for clients, so show them as is (`apiError()` in `utils/knowledge.js`).

- **Knowledge** (`/api/knowledge`; `knowledge:read|write|publish|delete`) — sources (website, FAQs, notes, "Learned from chats") → items → chunks. Website pages are imported once; nothing re-scrapes on a timer. Items are checked on publish (contradictions, duplicates, private data) and can end up `needs_review` or held; issues live at `/dashboard/knowledge/issues`. Imports and indexing finish in the background, so the screens poll while items are busy.
- **Bot Profile** (`/api/clients/bot-profile`) — draft → publish with versions. The sandbox tests the draft.
- **Quality** (`/api/eval`, `settings:manage`) — test questions and graded runs compared with a baseline.
- **Setup** (`/api/setup`, `settings:manage`) — go-live wizard. New sources are staged (invisible to live chats) until a switch-over. The sandbox and test runs take `knowledgeMode: "live" | "staging"`.
- **Guide copy** — all client-facing feature text (the Guide hub and the "Things to know" cards rendered by `components/ThingsToKnow.vue`) lives in `src/content/featureGuides.js`. Update it when a feature's behaviour changes.

The router's `meta.permission` check only guards routes. Screens hide buttons with `can(perms, key)` from `utils/knowledge.js`, after `loadMyPermissions()`.

### Icons

All icons are Lucide, registered as Vuetify icon aliases in `src/plugins/icons.js` and used by Lucide name: `<v-icon>$search</v-icon>`, `prepend-inner-icon="$search"`. To add one, import it from `lucide` and add it to `APP_ICONS`; an unregistered alias renders nothing. Never use `mdi-*` names: the Material Design Icons font is not loaded. Brand logos are vendored in `src/icons/brands.js`, and `.icon-spin` (in `App.vue`) spins an icon.

### Real-time chat

`ChatView.vue` connects directly to a hardcoded socket.io endpoint (`https://ai-api.on-track.in`, websocket transport) rather than going through the axios `apiClient` or the `VUE_APP_API_BASE_URL` env var. It authenticates with the dashboard JWT (`auth.token`), emits `joinRoom { chatId }` and `sendMessage { text }`, and listens for `previousMessages`, `message`, `typing`/`stopTyping`, `error_message` (permission/auth failures to show the user) and `connect_error`. The socket is created on demand and explicitly disconnected on teardown/`beforeDestroy`. This requires the backend's secure widget sessions to be deployed first.

### Notifications

Toasts use `vue-toastification` (registered globally in `main.js`, top-right, 3s timeout) for user-facing success/error messages — prefer this over native `alert()` for new code (existing auth/router code still uses `alert()` in a few places, e.g. `router/index.js`, `service/axios.js`).
