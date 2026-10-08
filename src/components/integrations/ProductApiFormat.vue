<template>
  <div class="text-body-2">
    <div class="field-title">How ScraperAI calls your API</div>
    <div class="mb-2">One URL, two kinds of requests:</div>
    <ol class="list mb-4">
      <li v-for="c in format.calls" :key="c.title">
        <strong>{{ c.title }}.</strong> {{ c.when }}
        <div><code>{{ c.request }}</code></div>
        <div class="grey--text text--darken-1">{{ c.note }}</div>
      </li>
    </ol>

    <div class="field-title">Response</div>
    <div class="mb-2">{{ format.response }} Each item:</div>
    <pre class="format-example mb-4">{{ format.example }}</pre>

    <div class="field-title">Using your own field names</div>
    <div class="mb-2">{{ format.mapping.intro }}</div>
    <pre class="format-example mb-2">{{ format.mapping.theirs }}</pre>
    <div class="mb-2">{{ format.mapping.map }}</div>
    <pre class="format-example mb-2">{{ format.mapping.ours }}</pre>
    <div class="mb-4">{{ format.mapping.stock }}</div>

    <div class="field-title">Notes</div>
    <ul class="list mb-0">
      <li v-for="n in format.notes" :key="n">{{ n }}</li>
    </ul>
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

<style scoped>
.field-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 8px;
}

.list {
  padding-left: 18px;
}

.list li {
  margin-bottom: 6px;
}

.format-example {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre;
}
</style>
