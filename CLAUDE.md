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

- `DashboardLayout.vue` — main dashboard (home, profile, sitemap/scraping setup, page list, scraped pages, integrations, security, insights, knowledge gap, content chunks, whatsapp bot, documentation, chat analytics, user/team management)
- `ChatLayout.vue` — `/dashboard/chat/*` (chat list, chat view, chat insights, chatbot knowledge score)
- `FormsDashboardLayout.vue` — `/dashboard/forms/*` (form list/builder/submissions/analytics)
- `CallAnalysisLayout.vue` — call batch analysis and reports

Screens live under `src/screens/dashboard/**`, grouped into subfolders per section (`forms/`, `insights/`, `knowledgeGap/`, `Chats/`). Standalone reusable widgets (not tied to a route) live in `src/components/`. Top-level marketing/auth pages (landing, login, signup) live in `src/pages/`.

Most dashboard routes are lazy-loaded via dynamic `import()`; a few core ones (`SitemapForm`, `ScrapedPages`) are statically imported at the top of `router/index.js`.

### Real-time chat

`ChatView.vue` connects directly to a hardcoded socket.io endpoint (`https://ai-api.on-track.in`, websocket transport) rather than going through the axios `apiClient` or the `VUE_APP_API_BASE_URL` env var. It joins a room, and listens for `previousMessages`, `message`, `typing`/`stopTyping`, and `connect_error` events; the socket is created on-demand and explicitly disconnected on teardown/`beforeDestroy`.

### Notifications

Toasts use `vue-toastification` (registered globally in `main.js`, top-right, 3s timeout) for user-facing success/error messages — prefer this over native `alert()` for new code (existing auth/router code still uses `alert()` in a few places, e.g. `router/index.js`, `service/axios.js`).
