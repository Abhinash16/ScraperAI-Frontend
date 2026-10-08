<template>
  <v-navigation-drawer
    :value="value"
    app
    right
    temporary
    :width="$vuetify.breakpoint.xsOnly ? '100%' : 420"
    @input="$emit('input', $event)"
  >
    <template v-if="guide">
      <div class="d-flex align-center px-5 py-4">
        <v-avatar size="40" tile color="primary lighten-5" class="rounded-lg mr-3 flex-shrink-0">
          <v-icon size="20" color="primary">{{ guide.icon || "$info" }}</v-icon>
        </v-avatar>
        <div class="flex-grow-1 overflow-hidden">
          <div class="text-caption font-weight-bold text-uppercase grey--text">About this page</div>
          <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4 text-truncate">
            {{ guide.name }}
          </div>
        </div>
        <v-btn icon aria-label="Close help" @click="$emit('input', false)">
          <v-icon>$x</v-icon>
        </v-btn>
      </div>
      <v-divider />

      <div class="pa-5">
        <div class="text-body-2 grey--text text--darken-3 mb-5">{{ guide.summary }}</div>

        <template v-if="guide.steps && guide.steps.length">
          <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">How to use it</div>
          <v-sheet outlined rounded="lg" class="mb-5">
            <template v-for="(step, i) in guide.steps">
              <v-divider v-if="i > 0" :key="`sd-${i}`" />
              <div :key="`s-${i}`" class="d-flex align-start px-4 py-2">
                <v-avatar size="22" color="primary lighten-5" class="mr-3 mt-1 flex-shrink-0">
                  <span class="text-caption font-weight-bold primary--text">{{ i + 1 }}</span>
                </v-avatar>
                <span class="text-body-2 grey--text text--darken-3">{{ step }}</span>
              </div>
            </template>
          </v-sheet>
        </template>

        <template v-if="guide.thingsToKnow && guide.thingsToKnow.length">
          <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">Things to know</div>
          <v-sheet outlined rounded="lg" class="mb-5">
            <template v-for="(point, i) in guide.thingsToKnow">
              <v-divider v-if="i > 0" :key="`pd-${i}`" />
              <div :key="`p-${i}`" class="d-flex align-start px-4 py-2">
                <v-icon size="14" color="primary" class="mr-3 mt-1 flex-shrink-0">$info</v-icon>
                <span class="text-body-2 grey--text text--darken-3">{{ point }}</span>
              </div>
            </template>
          </v-sheet>
        </template>

        <v-btn
          block
          outlined
          color="primary"
          :to="{ path: '/dashboard/documentation', query: { guide: guide.id } }"
          @click="$emit('input', false)"
        >
          <v-icon left size="16">$book-open</v-icon>
          Full guide
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { featureGuide } from "@/content/featureGuides";

// Right-side panel with the help for the page on screen
export default {
  name: "HelpPanel",

  props: {
    value: Boolean,
    // featureGuides.js id
    feature: { type: String, default: "" },
  },

  computed: {
    guide() {
      return this.feature ? featureGuide(this.feature) : null;
    },
  },
};
</script>
