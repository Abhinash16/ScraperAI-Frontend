<template>
  <div>
    <!-- Trigger: icon on phones, a search pill in the top bar otherwise -->
    <v-btn v-if="compact" icon aria-label="Search pages" @click="open">
      <v-icon size="20">$search</v-icon>
    </v-btn>
    <v-sheet
      v-else
      color="grey lighten-4"
      rounded="lg"
      class="d-flex align-center px-3 py-2"
      role="button"
      tabindex="0"
      aria-label="Search pages"
      aria-haspopup="dialog"
      @click="open"
      @keydown.enter.prevent="open"
    >
      <v-icon size="18" color="grey darken-1" class="mr-3">$search</v-icon>
      <span
        class="flex-grow-1 text-body-2 grey--text text--darken-1 text-truncate"
      >
        Search pages: knowledge, issues, WhatsApp, team…
      </span>
      <v-sheet
        outlined
        rounded
        class="px-2 ml-2 text-caption grey--text text--darken-1"
        >/</v-sheet
      >
    </v-sheet>

    <!-- Palette -->
    <v-dialog
      v-model="dialog"
      :fullscreen="fullscreen"
      :max-width="fullscreen ? undefined : 720"
      transition="dialog-bottom-transition"
      scrollable
      :content-class="fullscreen ? '' : 'align-self-start mt-12 rounded-xl'"
    >
      <v-card
        :rounded="fullscreen ? '0' : 'xl'"
        :tile="fullscreen"
        class="overflow-hidden"
      >
        <!-- Search input -->
        <v-sheet color="green lighten-5" class="d-flex align-center px-5 py-3">
          <v-icon size="22" color="grey darken-1" class="mr-3">$search</v-icon>
          <input
            ref="input"
            v-model="query"
            type="text"
            autocomplete="off"
            placeholder="Search pages: knowledge, issues, WhatsApp, team…"
            aria-label="Search pages"
            class="flex-grow-1 text-subtitle-1 grey--text text--darken-4"
            @keydown.down.prevent="move(1)"
            @keydown.up.prevent="move(-1)"
            @keydown.enter.prevent="choose(results[cursor])"
            @keydown.esc.prevent="close"
          />
          <v-btn
            v-if="query"
            icon
            small
            aria-label="Clear search"
            class="ml-1"
            @click="clear"
          >
            <v-icon size="16">$x</v-icon>
          </v-btn>
          <v-btn v-if="fullscreen" text small class="ml-1" @click="close"
            >Cancel</v-btn
          >
          <v-sheet
            v-else
            outlined
            rounded
            color="transparent"
            class="px-2 ml-2 text-caption grey--text text--darken-1"
          >
            Esc
          </v-sheet>
        </v-sheet>

        <!-- Section filter -->
        <div class="px-5 pt-3">
          <v-chip-group
            v-model="category"
            mandatory
            show-arrows
            active-class="green lighten-5 green--text text--darken-2"
          >
            <v-chip
              v-for="c in categories"
              :key="c"
              :value="c"
              small
              outlined
              class="font-weight-bold"
            >
              {{ c }}
            </v-chip>
          </v-chip-group>
        </div>
        <v-divider class="mx-5" />

        <!-- Results -->
        <v-card-text
          ref="list"
          class="px-3 pt-2 pb-3"
          :class="fullscreen ? '' : 'search-results'"
        >
          <div
            class="text-caption font-weight-bold text-uppercase grey--text px-2 py-2"
          >
            Pages
            <span v-if="query" class="text-none font-weight-regular"
              >· {{ results.length }}</span
            >
          </div>

          <div
            v-if="!results.length"
            class="d-flex flex-column align-center text-center py-10"
          >
            <v-avatar color="grey lighten-4" size="56" class="mb-3">
              <v-icon size="24" color="grey">$search</v-icon>
            </v-avatar>
            <div class="text-body-2 font-weight-bold grey--text text--darken-3">
              No pages match
            </div>
            <div class="text-caption grey--text">
              Try another word, or pick a different section.
            </div>
          </div>

          <v-card
            v-for="(item, i) in results"
            :key="item.key"
            :ref="`row-${i}`"
            flat
            rounded="lg"
            :color="i === cursor ? 'green lighten-5' : 'transparent'"
            class="d-flex align-center px-3 py-3 mb-1"
            @click="choose(item)"
            @mouseenter="cursor = i"
          >
            <v-icon
              size="20"
              color="green darken-1"
              class="mr-4 flex-shrink-0"
              >{{ item.icon }}</v-icon
            >
            <div class="flex-grow-1 overflow-hidden mr-3">
              <div class="text-body-1 grey--text text--darken-4 text-truncate">
                {{ item.text }}
              </div>
              <div class="text-caption grey--text text--darken-1 text-truncate">
                {{ item.caption }}
              </div>
            </div>
            <v-chip small label color="grey lighten-4" class="flex-shrink-0">{{
              item.section
            }}</v-chip>
          </v-card>
        </v-card-text>

        <!-- Footer hints (desktop) -->
        <template v-if="!fullscreen">
          <v-divider />
          <div
            class="d-flex align-center text-caption grey--text text--darken-1 px-5 py-2"
          >
            <span class="mr-4">↑ ↓ to move</span>
            <span class="mr-4">Enter to open</span>
            <span>Esc to close</span>
          </div>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
const ALL = "All";

// Typing in a field shouldn't trigger the "/" shortcut
const isTyping = (el) =>
  !!el &&
  (el.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

// Command palette over the pages this user can open (from the sidebar config).
// Opens with a click, "/" or Cmd/Ctrl+K. Full screen on phones.
export default {
  name: "GlobalSearch",

  props: {
    // [{ key, text, caption, section, group, icon, to, search }]
    items: { type: Array, default: () => [] },
    compact: Boolean,
  },

  data: () => ({ dialog: false, query: "", category: ALL, cursor: 0 }),

  computed: {
    fullscreen() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    categories() {
      return [ALL, ...new Set(this.items.map((i) => i.group))];
    },

    results() {
      const words = this.query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      return this.items.filter(
        (i) =>
          (this.category === ALL || i.group === this.category) &&
          words.every((w) => i.search.includes(w)),
      );
    },
  },

  watch: {
    query() {
      this.cursor = 0;
    },
    category() {
      this.cursor = 0;
    },
    dialog(open) {
      if (open)
        this.$nextTick(() =>
          setTimeout(() => this.$refs.input && this.$refs.input.focus(), 50),
        );
    },
  },

  mounted() {
    window.addEventListener("keydown", this.onKey);
  },

  beforeDestroy() {
    window.removeEventListener("keydown", this.onKey);
  },

  methods: {
    onKey(e) {
      if (this.dialog) return;
      const slash = e.key === "/" && !isTyping(e.target);
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (!slash && !cmdK) return;
      e.preventDefault();
      this.open();
    },

    open() {
      this.query = "";
      this.category = ALL;
      this.cursor = 0;
      this.dialog = true;
    },

    close() {
      this.dialog = false;
    },

    clear() {
      this.query = "";
      this.$refs.input && this.$refs.input.focus();
    },

    move(step) {
      const n = this.results.length;
      if (!n) return;
      this.cursor = (this.cursor + step + n) % n;
      this.$nextTick(() => {
        const row = this.$refs[`row-${this.cursor}`];
        const el = row && (row[0] ? row[0].$el : row.$el);
        if (el) el.scrollIntoView({ block: "nearest" });
      });
    },

    choose(item) {
      if (!item) return;
      this.dialog = false;
      this.$emit("navigate", item.to);
    },
  },
};
</script>

<style scoped>
/* Bare input inside the palette header */
input {
  outline: none;
  min-width: 0;
}

/* Desktop palette: the list scrolls, the header stays */
.search-results {
  max-height: 60vh;
}
</style>
