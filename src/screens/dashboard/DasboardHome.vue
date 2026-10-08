<template>
  <div>
    <v-alert
      v-if="setupState && setupState.setup"
      type="info"
      outlined
      rounded="xl"
      class="text-body-2 mb-8"
    >
      <div class="d-flex align-center flex-wrap">
        <div class="mr-4">
          <strong>Setup in progress:</strong>
          {{ setupProgress.done }} of {{ setupProgress.total }} steps done. Customers
          keep getting your current answers until you switch over.
        </div>
        <v-spacer />
        <v-btn small depressed rounded color="primary" class="text-none" to="/dashboard/setup">
          Continue setup
        </v-btn>
      </div>
    </v-alert>

    <div v-for="(section, title) in dashboardData" :key="title" class="mb-12">
      <div class="d-flex align-center mb-6">
        <h2 class="text-h5 font-weight-bold grey--text text--darken-3">
          {{ title.replace("(BETA)", "") }}
        </h2>
        <v-chip
          v-if="title.includes('BETA')"
          small
          label
          color="green"
          class="ml-3 font-weight-bold"
          outlined
        >
          BETA
        </v-chip>
      </div>

      <v-row>
        <v-col
          v-for="item in visibleItems(section)"
          :key="item.name"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            outlined
            class="pa-6 rounded-lg transition-swing hover-card"
            @click="navigate(item.link)"
          >
            <div class="d-flex align-center">
              <v-avatar
                :color="section.color + ' lighten-5'"
                size="48"
                class="rounded-lg mr-4"
              >
                <v-icon :color="section.color" size="28">
                  {{ item.icon || "$layout-grid" }}
                </v-icon>
              </v-avatar>

              <div style="flex: 1">
                <div
                  class="text-body-1 font-weight-bold grey--text text--darken-4 mb-1"
                >
                  {{ item.name }}
                </div>
                <div
                  class="text-caption grey--text text--darken-1 font-weight-medium"
                >
                  {{ item.description || "Manage and configure settings" }}
                </div>
              </div>

              <v-chip
                v-if="badges[item.link]"
                small
                color="error"
                text-color="white"
                class="mr-2"
                :title="`${badges[item.link]} knowledge problems need attention`"
              >
                {{ badges[item.link] }}
              </v-chip>
              <v-icon color="grey lighten-1">$chevron-right</v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="mt-10 grey lighten-3"></v-divider>
    </div>
  </div>
</template>

<script>
import { can, loadIssueSummary, loadMyPermissions } from "@/utils/knowledge";
import { checklistProgress, loadSetup } from "@/utils/setup";

export default {
  name: "DashboardHome",

  data() {
    return {
      // Counts shown on tiles, by link
      badges: {},
      // Null until loaded; tiles with a `permission` stay hidden until then
      perms: null,
      setupState: null,
      dashboardData: {
        Products: {
          color: "indigo",
          items: [
            {
              name: "Chat",
              link: "/dashboard/chat",
              icon: "$message-square-text",
              description: "Real-time AI assistance",
            },
            {
              name: "Sandbox",
              link: "/dashboard/sandbox",
              icon: "$flask-conical",
              description: "Test your bot as a customer",
            },
            {
              name: "Bot Health",
              link: "/dashboard/bot-health",
              icon: "$activity",
              description: "Errors, speed and AI cost",
              permission: "analytics:view",
            },
            // {
            //   name: "WhatsApp Bot",
            //   link: "/dashboard/whatsapp-bot",
            //   icon: "$whatsapp",
            //   description: "Automated messaging",
            // },
            {
              name: "Call Analysis",
              link: "/dashboard/call-batches",
              icon: "$phone",
              description: "Speech-to-text insights",
            },
          ],
        },
        "AI Configuration": {
          color: "orange",
          items: [
            {
              name: "Knowledge",
              link: "/dashboard/knowledge",
              icon: "$folder-open",
              description: "Website pages and notes",
            },
            {
              name: "Bot Profile",
              link: "/dashboard/bot-profile",
              icon: "$user-cog",
              description: "Tone, facts and rules",
            },
            {
              name: "Setup",
              link: "/dashboard/setup",
              icon: "$rocket",
              description: "Build, test and go live",
              permission: "settings:manage",
            },
            {
              name: "Quality",
              link: "/dashboard/quality",
              icon: "$circle-check",
              description: "Test your bot's answers",
              permission: "settings:manage",
            },
            {
              name: "Knowledge Gap",
              link: "/dashboard/knowledge-gap/",
              icon: "$lightbulb",
              description: "Missing information",
            },
          ],
        },
        // Settings: {
        //   color: "blue-grey",
        //   items: [
        //     {
        //       name: "Integration",
        //       link: "/dashboard/integration",
        //       icon: "$puzzle",
        //       description: "API and Webhooks",
        //     },
        //     {
        //       name: "Security",
        //       link: "/dashboard/security",
        //       icon: "$shield-check",
        //       description: "Access and Auth",
        //     },
        //   ],
        // },
      },
    };
  },

  computed: {
    setupProgress() {
      return checklistProgress(this.setupState?.checklist);
    },
  },

  async created() {
    loadSetup().then((s) => (this.setupState = s));
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => (this.perms = []));
    // Open blockers: knowledge that isn't live until someone looks at it
    const summary = await loadIssueSummary();
    if (summary && summary.blocker) {
      this.badges = { ...this.badges, "/dashboard/knowledge": summary.blocker };
    }
  },

  methods: {
    visibleItems(section) {
      return section.items.filter((i) => !i.permission || can(this.perms, i.permission));
    },

    navigate(link) {
      this.$router.push(link).catch(() => {});
    },
  },
};
</script>

<style scoped>
.hover-card:hover {
  transform: translateY(-5px);
  background-color: #ffffff !important;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(0, 0, 0, 0.05) !important;
}
</style>
