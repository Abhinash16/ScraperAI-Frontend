<template>
  <div>
    <!-- Greeting -->
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold grey--text text--darken-4 mb-1">
        {{ greeting }}<template v-if="firstName">, {{ firstName }}</template>
      </h1>
      <div class="text-body-2 grey--text text--darken-1">
        What needs you first, then everything else in one place.
      </div>
    </div>

    <!-- Before go-live the setup checklist comes first -->
    <v-card
      v-if="setupState && setupState.setup"
      outlined
      rounded="lg"
      class="setup-card pa-5 mb-6"
    >
      <div class="d-flex flex-column flex-sm-row align-sm-center">
        <v-avatar color="primary lighten-5" size="44" class="rounded-lg mr-sm-4 mb-3 mb-sm-0">
          <v-icon color="primary" size="22">$rocket</v-icon>
        </v-avatar>
        <div class="flex-grow-1 mr-sm-4 mb-3 mb-sm-0">
          <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">
            Setup in progress
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            {{ setupProgress.done }} of {{ setupProgress.total }} steps done. Customers keep
            getting your current answers until you switch over.
          </div>
          <v-progress-linear
            :value="setupPercent"
            color="primary"
            background-color="primary lighten-4"
            height="6"
            rounded
            class="mt-3"
            :aria-label="`Setup ${setupPercent}% done`"
          />
        </div>
        <v-btn depressed rounded color="primary" to="/dashboard/setup">
          Continue setup
          <v-icon right size="16">$arrow-right</v-icon>
        </v-btn>
      </div>
    </v-card>

    <ActiveNoticeStrip
      v-if="perms && (can(perms, 'knowledge:read') || can(perms, 'notices:manage'))"
      class="mb-6"
    />

    <KnowledgeHealthCard
      v-if="perms && can(perms, 'knowledge:read')"
      :permissions="perms"
      compact
      class="mb-6"
    />

    <!-- Needs you -->
    <v-card v-if="showNeedsYou" outlined rounded="lg" class="mb-8">
      <div class="d-flex align-center px-5 pt-4 pb-3">
        <v-icon size="18" color="amber darken-3" class="mr-2">$triangle-alert</v-icon>
        <span class="section-label">Needs you</span>
      </div>
      <v-divider />

      <div v-if="counts === null" class="px-5 py-4">
        <v-skeleton-loader v-for="n in 2" :key="n" type="list-item" />
      </div>

      <div v-else-if="needsYou.length" role="list">
        <div
          v-for="(row, i) in needsYou"
          :key="row.id"
          role="listitem"
          class="needs-row px-5 py-3"
          :class="{ 'needs-row--border': i > 0 }"
        >
          <span class="needs-dot" :class="`needs-dot--${row.tone}`" aria-hidden="true" />
          <div class="flex-grow-1 min-w-0 mr-3">
            <div class="text-body-2 font-weight-bold grey--text text--darken-4">{{ row.title }}</div>
            <div class="text-caption grey--text text--darken-1">{{ row.hint }}</div>
          </div>
          <v-btn small text rounded color="primary" class="flex-shrink-0" :to="row.to">
            {{ row.action }}
            <v-icon right size="14">$arrow-right</v-icon>
          </v-btn>
        </div>
      </div>

      <div v-else class="d-flex align-center px-5 py-5">
        <v-avatar color="success lighten-5" size="36" class="mr-3">
          <v-icon color="success" size="18">$circle-check</v-icon>
        </v-avatar>
        <div>
          <div class="text-body-2 font-weight-bold grey--text text--darken-4">All clear</div>
          <div class="text-caption grey--text text--darken-1">
            The bot is handling everything. New problems will show up here.
          </div>
        </div>
      </div>
    </v-card>

    <!-- Everything else, grouped like the sidebar -->
    <div v-if="perms === null">
      <v-skeleton-loader type="heading" class="mb-4" />
      <v-row>
        <v-col v-for="n in 6" :key="n" cols="12" sm="6" lg="4">
          <v-skeleton-loader type="list-item-avatar-two-line" />
        </v-col>
      </v-row>
    </div>

    <template v-else>
      <section v-for="group in groups" :key="group.id" class="mb-8">
        <h2 class="section-label mb-3">{{ group.label }}</h2>
        <v-row dense>
          <v-col v-for="item in group.items" :key="item.id" cols="12" sm="6" lg="4">
            <v-card outlined rounded="lg" class="pa-4 fill-height" :to="item.to">
              <div class="d-flex align-center">
                <v-avatar :color="`${group.color} lighten-5`" size="40" class="rounded-lg mr-3 flex-shrink-0">
                  <v-icon :color="group.color" size="20">{{ item.icon }}</v-icon>
                </v-avatar>
                <div class="flex-grow-1 min-w-0">
                  <div class="text-body-2 font-weight-bold grey--text text--darken-4">
                    {{ item.name }}
                  </div>
                  <div class="text-caption grey--text text--darken-1 text-truncate">
                    {{ item.description }}
                  </div>
                </div>
                <span
                  v-if="badgeFor(item)"
                  class="shortcut__badge ml-2"
                  :title="`${badgeFor(item)} ${item.badgeHint}`"
                >
                  {{ badgeFor(item) }}
                </span>
                <v-icon color="grey lighten-1" size="18" class="ml-1">$chevron-right</v-icon>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import { can } from "@/utils/knowledge";
import { BADGE, loadAttentionCounts, visibleGroups } from "@/utils/navigation";
import { checklistProgress, loadSetup } from "@/utils/setup";
import KnowledgeHealthCard from "@/components/knowledge/KnowledgeHealthCard.vue";
import ActiveNoticeStrip from "@/components/knowledge/ActiveNoticeStrip.vue";

const GROUP_STYLE = {
  operate: { label: "Operate", color: "indigo" },
  improve: { label: "Improve", color: "deep-orange" },
  connect: { label: "Connect", color: "teal" },
};

export default {
  name: "DashboardHome",

  components: { KnowledgeHealthCard, ActiveNoticeStrip },

  data() {
    return {
      // Null until loaded; shortcuts with a permission stay hidden until then
      perms: null,
      user: null,
      setupState: null,
      // Null while loading
      counts: null,
    };
  },

  computed: {
    greeting() {
      const h = new Date().getHours();
      if (h < 12) return "Good morning";
      if (h < 17) return "Good afternoon";
      return "Good evening";
    },

    firstName() {
      return (this.user?.name || "").trim().split(/\s+/)[0] || "";
    },

    setupProgress() {
      return checklistProgress(this.setupState?.checklist);
    },

    setupPercent() {
      const { done, total } = this.setupProgress;
      return total ? Math.round((done / total) * 100) : 0;
    },

    groups() {
      return visibleGroups(this.perms)
        .map((g) => ({
          ...g,
          ...GROUP_STYLE[g.id],
          items: g.items.filter((i) => i.id !== "home"),
        }))
        .filter((g) => g.items.length);
    },

    // Only things this user can act on, so hide the block without knowledge access
    showNeedsYou() {
      return this.perms !== null && can(this.perms, "knowledge:read");
    },

    // Sorted by urgency; rows with nothing pending are left out
    needsYou() {
      const c = this.counts || {};
      const rows = [];
      const blockers = c[BADGE.knowledgeBlockers];
      if (blockers) {
        rows.push({
          id: "blockers",
          tone: "error",
          title: `${blockers} knowledge ${blockers === 1 ? "item is" : "items are"} blocked`,
          hint: "Not live until someone reviews the problem found on publish.",
          action: "Review",
          to: "/dashboard/knowledge/issues",
        });
      }
      const gaps = c[BADGE.unanswered];
      if (gaps) {
        rows.push({
          id: "unanswered",
          tone: "warning",
          title: `${gaps} ${gaps === 1 ? "question" : "questions"} the bot couldn't answer`,
          hint: "Answer once and the bot learns it as an FAQ.",
          action: "Answer",
          to: "/dashboard/knowledge-gap",
        });
      }
      return rows;
    },
  },

  async created() {
    loadSetup().then((s) => (this.setupState = s));
    try {
      const { data } = await apiClient.get("/clients/currentUser");
      this.user = data.data?.user || null;
      this.perms = this.user?.roleId?.permissions || [];
    } catch {
      this.perms = [];
    }
    this.counts = this.showNeedsYou ? await loadAttentionCounts(this.perms) : {};
  },

  methods: {
    can,

    badgeFor(item) {
      return (item.badge && this.counts && this.counts[item.badge]) || 0;
    },
  },
};
</script>

<style scoped>
.min-w-0 {
  min-width: 0;
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7085;
}

.setup-card {
  border-color: #d9dbfb !important;
  background-color: #fafaff !important;
}

.needs-row {
  display: flex;
  align-items: center;
}

.needs-row--border {
  border-top: 1px solid #f0f1f6;
}

.needs-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-right: 14px;
  border-radius: 50%;
}

.needs-dot--error {
  background-color: var(--v-error-base);
}

.needs-dot--warning {
  background-color: #f59e0b;
}

.shortcut__badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background-color: var(--v-error-base);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
}
</style>
