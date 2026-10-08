<template>
  <div class="text-body-2 grey--text text--darken-3">
    <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">How ScraperAI calls your API</div>
    <div class="mb-2">One URL, two kinds of requests:</div>
    <v-sheet outlined rounded="lg" class="mb-5">
      <template v-for="(c, i) in format.calls">
        <v-divider v-if="i > 0" :key="`d-${c.title}`" />
        <div :key="c.title" class="d-flex align-start px-4 py-3">
          <v-avatar size="22" color="primary lighten-5" class="mr-3 mt-1 flex-shrink-0">
            <span class="text-caption font-weight-bold primary--text">{{ i + 1 }}</span>
          </v-avatar>
          <div class="overflow-hidden">
            <div><strong class="grey--text text--darken-4">{{ c.title }}.</strong> {{ c.when }}</div>
            <div class="my-1"><code class="text-break">{{ c.request }}</code></div>
            <div class="text-caption grey--text text--darken-1">{{ c.note }}</div>
          </div>
        </div>
      </template>
    </v-sheet>

    <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">Response</div>
    <div class="mb-2">{{ format.response }} Each item:</div>
    <v-sheet color="grey darken-4" dark rounded="lg" class="overflow-x-auto pa-4 mb-5">
      <pre class="ma-0 text-caption">{{ format.example }}</pre>
    </v-sheet>

    <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">Using your own field names</div>
    <div class="mb-2">{{ format.mapping.intro }}</div>
    <v-sheet color="grey darken-4" dark rounded="lg" class="overflow-x-auto pa-4 mb-2">
      <pre class="ma-0 text-caption">{{ format.mapping.theirs }}</pre>
    </v-sheet>
    <div class="mb-2">{{ format.mapping.map }}</div>
    <v-sheet color="grey darken-4" dark rounded="lg" class="overflow-x-auto pa-4 mb-2">
      <pre class="ma-0 text-caption">{{ format.mapping.ours }}</pre>
    </v-sheet>
    <div class="mb-5">{{ format.mapping.stock }}</div>

    <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">Notes</div>
    <v-sheet outlined rounded="lg">
      <template v-for="(n, i) in format.notes">
        <v-divider v-if="i > 0" :key="`d-${i}`" />
        <div :key="i" class="d-flex align-start px-4 py-2">
          <v-icon size="14" color="grey" class="mr-2 mt-1 flex-shrink-0">$info</v-icon>
          <span>{{ n }}</span>
        </div>
      </template>
    </v-sheet>
  </div>
</template>

<script>
import { PRODUCT_API_FORMAT } from "@/content/featureGuides";

export default {
  name: "ProductApiFormat",

  data() {
    return { format: PRODUCT_API_FORMAT };
  },
};
</script>
