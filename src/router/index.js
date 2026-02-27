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
        path: "chat",
        component: () => import("../screens/dashboard/ChatList.vue"),
      },
      {
        path: "chat/:chatId",
        component: () => import("../screens/dashboard/ChatView.vue"),
      },
      {
        path: "try-chat",
        component: () => import("../screens/dashboard/TryChat.vue"),
      },
    ],
    meta: { requiresAuth: true }, // Indicate that this route requires authentication
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

// Define a function to check if the user is logged in
function isAuthenticated() {
  // Check if a token is present in local storage (or any other logic you use to verify authentication)
  return !!localStorage.getItem("user-token");
}

// Add a global beforeEach guard
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // This route requires authentication, check if logged in
    if (!isAuthenticated()) {
      alert("no");
      // Not logged in, redirect to login page
      next({
        path: "/login",
        query: { redirect: to.fullPath }, // Optionally pass the intended path for later redirection
      });
    } else {
      // Logged in, proceed to the route
      next();
    }
  } else {
    // This route does not require authentication
    next(); // Make sure to always call next()!
  }
});

export default router;
