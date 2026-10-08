import Vue from "vue";
import VueRouter from "vue-router";
import LandingPage from "@/pages/landing/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";

Vue.use(VueRouter);

// Define the routes
const routes = [
  { path: "/", component: LandingPage },
  { path: "/login", component: LoginPage },
  { path: "/signup", component: SignupPage },
  {
    path: "/dashboard",
    component: () => import("../layouts/DashboardLayout.vue"),
    children: [
      // {
      //   path: "/",
      //   component: () => import("../screens/dashboard/CompanyInsights.vue"),
      // },
      {
        path: "/",
        component: () => import("../screens/dashboard/DasboardHome.vue"),
      },
      {
        path: "profile",
        component: () => import("../screens/dashboard/MyProfile.vue"),
        meta: { tab: 0 },
      },
      {
        path: "knowledge",
        component: () =>
          import("../screens/dashboard/knowledge/KnowledgeSources.vue"),
        meta: { permission: "knowledge:read" },
      },
      {
        path: "setup",
        component: () => import("../screens/dashboard/setup/SetupPage.vue"),
        meta: { permission: "settings:manage" },
      },
      {
        path: "quality",
        component: () => import("../screens/dashboard/quality/QualityPage.vue"),
        meta: { permission: "settings:manage" },
      },
      {
        path: "quality/runs/:runId",
        component: () => import("../screens/dashboard/quality/QualityRun.vue"),
        meta: { permission: "settings:manage" },
      },
      {
        path: "knowledge/issues",
        component: () =>
          import("../screens/dashboard/knowledge/KnowledgeIssues.vue"),
        meta: { permission: "knowledge:read" },
      },
      {
        path: "knowledge/:sourceId",
        component: () =>
          import("../screens/dashboard/knowledge/KnowledgeSource.vue"),
        meta: { permission: "knowledge:read" },
      },
      // Replaced by Knowledge (Track K)
      { path: "sitemap", redirect: "/dashboard/knowledge" },
      { path: "page-list", redirect: "/dashboard/knowledge" },
      { path: "scraped-pages", redirect: "/dashboard/knowledge" },
      { path: "content-chunks", redirect: "/dashboard/knowledge" },
      {
        path: "integration",
        component: () => import("../screens/dashboard/IntegrationPage.vue"),
        meta: { hideTab: true },
      },
      {
        path: "security",
        redirect: "/dashboard/profile?section=security",
      },

      {
        path: "sandbox",
        component: () => import("../screens/dashboard/TryChat.vue"),
        meta: { permission: "settings:manage" },
      },
      { path: "try-chat", redirect: "/dashboard/sandbox" },
      {
        path: "bot-profile",
        component: () => import("../screens/dashboard/BotProfile.vue"),
        meta: { permission: "settings:manage" },
      },

      {
        path: "opportunity-analysis",
        component: () =>
          import("../screens/dashboard/insights/OpportunityAnalysis.vue"),
      },
      // {
      //   path: "chatbot-knowledge-score",
      //   component: () =>
      //     import("../screens/dashboard/insights/ChatbotKnowledgeScore.vue"),
      // },

      {
        path: "knowledge-gap",
        name: "KnowledgeGapList",
        component: () =>
          import("../screens/dashboard/knowledgeGap/KnowledgeGapList.vue"),
      },
      {
        path: "knowledge-gap/:id",
        name: "KnowledgeGap",
        component: () =>
          import("../screens/dashboard/knowledgeGap/KnowledgeGapView.vue"),
      },

      {
        path: "whatsapp-bot",
        redirect: "/dashboard/integration?section=tellephant",
      },
      {
        path: "widget",
        redirect: "/dashboard/integration?section=widget",
      },
      {
        path: "documentation",
        name: "documentation",
        component: () => import("../screens/dashboard/DocumentationPage.vue"),
      },
      {
        path: "bot-health",
        component: () => import("../screens/dashboard/BotHealth.vue"),
        meta: { permission: "analytics:view" },
      },
      {
        path: "chat-analytics",
        name: "Chat Analytics",
        component: () => import("../screens/dashboard/AnalyticsDashboard.vue"),
      },
      {
        path: "team",
        name: "Team",
        component: () => import("../screens/dashboard/TeamManagement.vue"),
        meta: {
          permission: ["user:manage", "role:manage"],
        },
      },
      { path: "user-list", redirect: "/dashboard/team" },

      // Section names from the sidebar (utils/navigation.js); the screens
      // keep their existing paths.
      { path: "inbox", redirect: "/dashboard/chat" },
      { path: "unanswered", redirect: "/dashboard/knowledge-gap" },
      { path: "bot-behaviour", redirect: "/dashboard/bot-profile" },
      { path: "test", redirect: "/dashboard/sandbox" },
      { path: "insights", redirect: "/dashboard/bot-health" },
      { path: "channels", redirect: "/dashboard/integration?section=widget" },
      {
        path: "data",
        redirect: "/dashboard/integration?section=api-config&tab=product-api",
      },
      { path: "account", redirect: "/dashboard/profile" },
    ],
    meta: { requiresAuth: true }, // Indicate that this route requires authentication
  },

  // chat dashboard
  {
    path: "/dashboard/chat",
    component: () => import("../layouts/ChatLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("../screens/dashboard/ChatList.vue"),
      },
      {
        path: "insights",
        component: () => import("../screens/dashboard/AnalyticsDashboard.vue"),
      },
      {
        path: "chatbot-knowledge-score",
        component: () =>
          import("../screens/dashboard/insights/ChatbotKnowledgeScore.vue"),
      },
      {
        path: "whatsapp-bot",
        redirect: "/dashboard/integration?section=tellephant",
      },
      {
        path: ":chatId",
        component: () => import("../screens/dashboard/ChatView.vue"),
      },
    ],
  },

  // The forms module was removed; send old links to the dashboard
  { path: "/dashboard/forms*", redirect: "/dashboard" },

  // call analysis dashboard
  {
    path: "/dashboard",
    component: () => import("../layouts/CallAnalysisLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "call-batches",
        component: () => import("../screens/dashboard/CallAnalysis.vue"),
        meta: { tab: 1 },
      },
      {
        path: "/call-analysis/report/:id",
        name: "CallAnalysisReport",
        component: () => import("../screens/dashboard/CallAnalysisReport.vue"),
      },
      {
        path: "/batch-analysis/:id",
        name: "BatchAnalysis",
        component: () => import("../screens/dashboard/BatchCallAnalysis.vue"),
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition; // browser back/forward
    } else {
      return { x: 0, y: 0 }; // always go top
    }
  },
});

// Define a function to check if the user is logged in
function isAuthenticated() {
  // Check if a token is present in local storage (or any other logic you use to verify authentication)
  return !!localStorage.getItem("user-token");
}

import apiClient from "@/service/axios";

// Add a global beforeEach guard
let currentUser = null; // cache

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // This route requires authentication, check if logged in
    if (!isAuthenticated()) {
      alert("You need to be logged in to access this page.");
      return next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      // ✅ ADD THIS BLOCK ONLY
      try {
        if (to.meta.permission) {
          // fetch user only once
          if (!currentUser) {
            const { data } = await apiClient.get("/clients/currentUser");
            currentUser = data.data;
          }

          const permissions = currentUser?.user?.roleId?.permissions || [];

          // meta.permission may be one key or a list (any of them)
          const required = [].concat(to.meta.permission);
          const hasAccess =
            permissions.includes("*") ||
            required.some((p) => permissions.includes(p));

          if (!hasAccess) {
            return next("/dashboard"); // ❌ block
          }
        }

        next(); // ✅ continue
      } catch (err) {
        next("/login");
      }
    }
  } else {
    next();
  }
});

export default router;
