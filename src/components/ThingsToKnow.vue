<template>
  <v-card v-if="guide" outlined rounded="xl" class="things-to-know mb-4">
    <div class="d-flex align-center px-4 py-2" @click="toggle">
      <v-icon small color="primary" class="mr-2">mdi-information-outline</v-icon>
      <span class="text-subtitle-2 font-weight-bold">Things to know</span>
      <span
        v-if="!open"
        class="text-body-2 grey--text text--darken-1 ml-2 text-truncate"
      >
        {{ guide.summary }}
      </span>
      <v-spacer />
      <v-icon small>{{ open ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
    </div>

    <v-expand-transition>
      <div v-show="open" class="px-4 pb-4">
        <div class="text-body-2 grey--text text--darken-2 mb-3">
          {{ guide.summary }}
        </div>
        <ul class="text-body-2 points">
          <li v-for="point in guide.thingsToKnow" :key="point">{{ point }}</li>
        </ul>
        <v-btn
          text
          small
          rounded
          color="primary"
          class="px-2 mt-1 text-none"
          :to="{ path: '/dashboard/documentation', query: { guide: guide.id } }"
        >
          Full guide
          <v-icon small right>mdi-arrow-right</v-icon>
        </v-btn>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
import { featureGuide } from "@/content/featureGuides";

const STORAGE_KEY = "things-to-know-collapsed";

// Collapsed state is a per-viewer convenience; storage may be unavailable.
function readCollapsed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

export default {
  name: "ThingsToKnow",

  props: {
    feature: { type: String, required: true },
  },

  data() {
    return { open: !readCollapsed()[this.feature] };
  },

  computed: {
    guide() {
      return featureGuide(this.feature);
    },
  },

  methods: {
    toggle() {
      this.open = !this.open;
      try {
        const collapsed = readCollapsed();
        collapsed[this.feature] = !this.open;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
      } catch {
        // ignore
      }
    },
  },
};
</script>

<style scoped>
.things-to-know > div:first-child {
  cursor: pointer;
  min-height: 44px;
}

.points {
  padding-left: 18px;
}

.points li {
  margin-bottom: 6px;
}
</style>
