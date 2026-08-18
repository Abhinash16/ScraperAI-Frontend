import Vue from "vue";
import VueRouter from "vue-router";
import ScrapedPages from "../components/ScrapedPages.vue";
import SitemapForm from "@/components/SitemapForm.vue";
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
      { path: "sitemap", component: SitemapForm, meta: { tab: 0 } },
      {
        path: "page-list",
        component: () => import("../screens/dashboard/PageList.vue"),
        meta: { tab: 1 },
      },
      { path: "scraped-pages", component: ScrapedPages, meta: { tab: 2 } },
      {
        path: "integration",
        component: () => import("../screens/dashboard/IntegrationPage.vue"),
        meta: { hideTab: true },
      },
      {
        path: "security",
        component: () => import("../screens/dashboard/SecurityPage.vue"),
        meta: { hideTab: true },
      },

      {
        path: "try-chat",
        component: () => import("../screens/dashboard/TryChat.vue"),
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
        path: "content-chunks",
        name: "ContentChunksList",
        component: () => import("../screens/dashboard/ContentChunksList.vue"),
      },

      {
        path: "whatsapp-bot",
        name: "whatsapp-bot",
        component: () => import("../screens/dashboard/WhatsappBot.vue"),
      },
      {
        path: "documentation",
        name: "documentation",
        component: () => import("../screens/dashboard/DocumentationPage.vue"),
      },
      {
        path: "chat-analytics",
        name: "Chat Analytics",
        component: () => import("../screens/dashboard/AnalyticsDashboard.vue"),
      },
      {
        path: "user-list",
        name: "User List",
        component: () => import("../screens/dashboard/TeamManagement.vue"),
        meta: {
          permission: "user:manage",
        },
      },
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
        component: () => import("../screens/dashboard/WhatsappBot.vue"),
      },
      {
        path: ":chatId",
        component: () => import("../screens/dashboard/ChatView.vue"),
      },
    ],
  },

  // forms dashboard
  {
    path: "/dashboard/forms",
    component: () => import("../layouts/FormsDashboardLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "FormsList",
        component: () => import("../screens/dashboard/forms/FormList.vue"),
      },
      {
        path: "create",
        name: "CreateForm",
        component: () => import("../screens/dashboard/forms/FormBuilder.vue"),
      },
      {
        path: ":id/edit",
        name: "EditForm",
        component: () => import("../screens/dashboard/forms/FormBuilder.vue"),
      },
      {
        path: ":id/submissions",
        name: "FormSubmissions",
        component: () =>
          import("../screens/dashboard/forms/FormSubmissions.vue"),
      },
      {
        path: ":id/analytics",
        name: "FormAnalytics",
        component: () => import("../screens/dashboard/forms/FormAnalytics.vue"),
      },
    ],
  },

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

  // {
  //   path: "/dashboard/forms/create",
  //   name: "/dashboardCreateForm",
  //   component: () => import("../screens/dashboard/forms/FormBuilder.vue"),
  // },

  // {
  //   path: "/dashboard/forms/:id/edit",
  //   name: "EditForm",
  //   component: () => import("../screens/dashboard/forms/FormBuilder.vue"),
  // },

  // {
  //   path: "/dashboard/forms/:id/submissions",
  //   name: "FormSubmissions",
  //   component: () => import("../screens/dashboard/forms/FormSubmissions.vue"),
  // },
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

          const hasAccess =
            permissions.includes("*") ||
            permissions.includes(to.meta.permission);

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
