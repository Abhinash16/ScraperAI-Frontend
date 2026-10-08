<script>
import { registerHelp, unregisterHelp, updateHelp } from "@/utils/pageHelp";

// Declares this page's help topic (an id from content/featureGuides.js).
// It draws nothing in the page: the shell shows an "About this page" button
// in the breadcrumb strip that opens the topic in a side panel.
export default {
  name: "ThingsToKnow",

  props: {
    feature: { type: String, default: "" },
  },

  data: () => ({ helpId: null }),

  watch: {
    feature(value) {
      updateHelp(this.helpId, value);
    },
  },

  created() {
    this.helpId = registerHelp(this.feature);
  },

  beforeDestroy() {
    unregisterHelp(this.helpId);
  },

  render() {
    return null;
  },
};
</script>
