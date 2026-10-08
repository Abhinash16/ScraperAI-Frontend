<template>
  <a
    :href="href"
    class="nav-link"
    :class="{ 'nav-link--active': active }"
    :aria-current="active ? 'page' : null"
    @click="onClick"
  >
    <v-icon size="18" class="nav-link__icon">{{ item.icon }}</v-icon>
    <span class="nav-link__label">{{ item.name }}</span>
    <span v-if="count" class="nav-link__badge" :title="`${count} ${item.badgeHint || 'to review'}`">
      {{ count > 99 ? "99+" : count }}
    </span>
  </a>
</template>

<script>
// One sidebar row. A real link (opens in a new tab with ctrl/cmd-click);
// a plain click is handed to the parent so it can also close the drawer.
export default {
  name: "NavLink",

  props: {
    item: { type: Object, required: true },
    active: Boolean,
    count: { type: Number, default: 0 },
  },

  computed: {
    href() {
      return this.$router.resolve(this.item.to).href;
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
