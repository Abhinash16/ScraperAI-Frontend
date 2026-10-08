<template>
  <AppShell>
    <router-view />
  </AppShell>
</template>

<script>
// Sidebar, top bar and section tabs come from AppShell (shared by all
// dashboard layouts, see utils/navigation.js).
import AppShell from "@/components/layout/AppShell.vue";

export default {
  name: "CallAnalysisLayout",
  components: { AppShell },
};
</script>
