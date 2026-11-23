<template>
  <v-tooltip bottom max-width="300" :disabled="!lead">
    <template #activator="{ on, attrs }">
      <span v-if="lead" class="lead-badge d-inline-flex align-center" v-bind="attrs" v-on="on">
        <v-chip x-small label :color="stage.color" text-color="white" class="font-weight-bold">
          <v-icon v-if="lead.hotAt" left size="10">$flame</v-icon>
          {{ stage.label }}
        </v-chip>
        <v-chip
          x-small
          label
          outlined
          :color="scoreColor(lead.score)"
          class="font-weight-bold ml-1"
        >
          {{ lead.score || 0 }}
        </v-chip>
        <span v-if="!compact && wants" class="text-caption grey--text text--darken-2 ml-2 text-truncate">
          {{ wants }}
        </span>
      </span>
    </template>
    <div v-if="lead" class="text-caption">
      <div class="font-weight-bold">
        Lead: {{ stage.label }}, score {{ lead.score || 0 }} / 100<template v-if="lead.hotAt"> (hot)</template>
      </div>
      <div v-if="wants">Wants: {{ wants }}</div>
      <div v-if="lead.nextStep">Next step: {{ lead.nextStep }}</div>
      <div v-if="lead.peakStage && lead.peakStage !== lead.stage">
        Got as far as: {{ stageLabel(lead.peakStage) }}
      </div>
      <div v-if="lead.linkSentAt">
        Payment link sent<template v-if="lead.linkAmount"> for {{ formatMoney(lead.linkAmount) }}</template>
      </div>
    </div>
  </v-tooltip>
</template>

<script>
import { formatMoney, leadWants, scoreColor, stageInfo } from "@/utils/leads";

// A conversation's lead: stage, score and (unless compact) what they want
export default {
  name: "LeadBadge",

  props: {
    lead: { type: Object, default: null },
    compact: { type: Boolean, default: false },
  },

  computed: {
    stage() {
      return stageInfo(this.lead?.stage);
    },
    wants() {
      return leadWants(this.lead);
    },
  },

  methods: {
    formatMoney,
    scoreColor,
    stageLabel: (s) => stageInfo(s).label,
  },
};
</script>

<style scoped>
.lead-badge {
  max-width: 100%;
  cursor: default;
}
</style>
