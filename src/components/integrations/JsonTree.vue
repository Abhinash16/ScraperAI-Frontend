<template>
  <div class="json-node">
    <template v-if="isContainer">
      <span class="json-toggle" @click="open = !open">
        <v-icon x-small class="json-chevron">
          {{ open ? "mdi-chevron-down" : "mdi-chevron-right" }}
        </v-icon>
        <span v-if="name !== null" class="json-key">{{ name }}: </span>
        <span class="json-bracket">{{ openBracket }}</span>
        <span v-if="!open" class="json-summary">
          {{ summary }}{{ closeBracket }}
        </span>
      </span>
      <template v-if="open">
        <div class="json-children">
          <JsonTree
            v-for="(child, key) in value"
            :key="key"
            :value="child"
            :name="isArray ? null : key"
            :depth="depth + 1"
            :expand-depth="expandDepth"
          />
        </div>
        <span class="json-bracket">{{ closeBracket }}</span>
      </template>
    </template>

    <template v-else>
      <span v-if="name !== null" class="json-key">{{ name }}: </span>
      <span :class="['json-value', valueClass]">{{ display }}</span>
    </template>
  </div>
</template>

<script>
// Collapsible JSON viewer. Nodes deeper than `expandDepth` start collapsed.
export default {
  name: "JsonTree",

  props: {
    value: { default: null },
    name: { type: [String, Number], default: null },
    depth: { type: Number, default: 0 },
    expandDepth: { type: Number, default: 2 },
  },

  data() {
    return { open: this.depth < this.expandDepth };
  },

  computed: {
    isArray() {
      return Array.isArray(this.value);
    },
    isContainer() {
      return this.value !== null && typeof this.value === "object";
    },
    openBracket() {
      return this.isArray ? "[" : "{";
    },
    closeBracket() {
      return this.isArray ? "]" : "}";
    },
    summary() {
      const n = this.isArray ? this.value.length : Object.keys(this.value).length;
      if (!n) return "";
      return this.isArray ? ` ${n} items ` : ` ${n} keys `;
    },
    display() {
      return typeof this.value === "string"
        ? JSON.stringify(this.value)
        : String(this.value);
    },
    valueClass() {
      if (this.value === null) return "is-null";
      return `is-${typeof this.value}`;
    },
  },
};
</script>

<style scoped>
.json-node {
  font-family: monospace;
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.json-children {
  padding-left: 16px;
  border-left: 1px dashed rgba(148, 163, 184, 0.25);
  margin-left: 5px;
}

.json-toggle {
  cursor: pointer;
}

.json-chevron {
  color: #94a3b8 !important;
  margin-left: -4px;
}

.json-key {
  color: #93c5fd;
}

.json-bracket,
.json-summary {
  color: #94a3b8;
}

.json-value.is-string {
  color: #86efac;
}

.json-value.is-number {
  color: #fcd34d;
}

.json-value.is-boolean,
.json-value.is-null {
  color: #f9a8d4;
}
</style>
