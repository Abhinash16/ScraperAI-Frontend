<template>
  <v-alert
    v-if="notices.length"
    border="left"
    colored-border
    :color="type.color"
    elevation="0"
    outlined
    rounded="lg"
    class="text-body-2"
  >
    <div class="d-flex align-center flex-wrap">
      <div class="mr-4">
        <strong>Active notice:</strong> {{ first.title }}
        <span class="grey--text text--darken-1">({{ whereLabel(first) }})</span>
        <span v-if="notices.length > 1" class="grey--text text--darken-1">
          and {{ notices.length - 1 }} more
        </span>
      </div>
      <v-spacer />
      <v-btn small text rounded color="primary" class="text-none" to="/dashboard/knowledge/notices">
        Notices
      </v-btn>
    </div>
  </v-alert>
</template>

<script>
import { fetchNotices, noticeType, whereLabel } from "@/utils/notices";

// "Active notice: …" with a link to Notices. Shows nothing when there's none
// (or when notices can't be read).
export default {
  name: "ActiveNoticeStrip",

  data: () => ({ notices: [] }),

  computed: {
    first() {
      return this.notices[0];
    },
    type() {
      return noticeType(this.first?.type);
    },
  },

  async created() {
    try {
      this.notices = await fetchNotices("active");
    } catch {
      this.notices = [];
    }
  },

  methods: { whereLabel },
};
</script>
