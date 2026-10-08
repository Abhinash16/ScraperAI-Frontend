<template>
  <v-tooltip right :disabled="!mini" open-delay="150">
    <template #activator="{ on, attrs }">
      <a
        :href="href"
        class="nav-link"
        :class="{ 'nav-link--active': active, 'nav-link--mini': mini }"
        :aria-current="active ? 'page' : null"
        :aria-label="mini ? item.name : null"
        v-bind="attrs"
        v-on="on"
        @click="onClick"
      >
        <v-badge
          v-if="mini && count"
          :content="badgeText"
          color="error"
          overlap
          offset-x="8"
          offset-y="8"
        >
          <v-icon size="20" class="nav-link__icon">{{ item.icon }}</v-icon>
        </v-badge>
        <v-icon v-else :size="mini ? 20 : 18" class="nav-link__icon">{{ item.icon }}</v-icon>

        <template v-if="!mini">
          <span class="nav-link__label">{{ item.name }}</span>
          <span v-if="count" class="nav-link__badge" :title="`${count} ${item.badgeHint || 'to review'}`">
            {{ badgeText }}
          </span>
        </template>
      </a>
    </template>
    <span>
      {{ item.name }}<template v-if="count"> · {{ count }} {{ item.badgeHint || "to review" }}</template>
    </span>
  </v-tooltip>
</template>

<script>
// One sidebar row. A real link (opens in a new tab with ctrl/cmd-click);
// a plain click is handed to the parent so it can also close the drawer.
// In the collapsed sidebar (`mini`) only the icon shows, with the name in a tooltip.
export default {
  name: "NavLink",

  props: {
    item: { type: Object, required: true },
    active: Boolean,
    count: { type: Number, default: 0 },
    mini: Boolean,
  },

  computed: {
    href() {
      return this.$router.resolve(this.item.to).href;
    },

    badgeText() {
      return this.count > 99 ? "99+" : String(this.count);
    },
  },

  methods: {
    onClick(e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      this.$emit("navigate", this.item.to);
    },
  },
};
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 38px;
  margin-bottom: 2px;
  padding: 0 10px;
  border-radius: 8px;
  color: #3d4152;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-link:hover {
  background-color: #f4f5fa;
}

.nav-link:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: -2px;
}

.nav-link--active,
.nav-link--active:hover {
  background-color: #eef0fe;
  color: var(--v-primary-base);
}

/* Collapsed sidebar: a centred square per item */
.nav-link--mini {
  justify-content: center;
  width: 44px;
  height: 44px;
  min-height: 44px;
  padding: 0;
  margin: 0 auto 6px;
}

.nav-link__icon {
  color: inherit !important;
  opacity: 0.85;
}

.nav-link__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-link__badge {
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
