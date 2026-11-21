<template>
  <div class="customer-panel px-4 py-3">
    <!-- HEADER -->
    <div class="d-flex align-center mb-2">
      <v-icon size="16" color="primary" class="mr-2">$user-search</v-icon>
      <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Customer</span>
      <span v-if="data && data.available" class="text-caption grey--text ml-2 text-truncate">
        Looked up by {{ sourceLabel }}<template v-if="data.fetchedAt">
          · {{ data.cached ? "saved" : "fetched" }} at {{ time(data.fetchedAt) }}</template>
      </span>
      <v-spacer />
      <v-btn
        x-small
        text
        color="primary"
        :loading="loading === 'refresh'"
        :disabled="!!loading"
        title="Ask your customer API again now"
        @click="load(true)"
      >
        <v-icon left size="12">$refresh-cw</v-icon>
        Refresh
      </v-btn>
    </div>

    <div v-if="loading === 'load'" class="py-4 text-center">
      <v-progress-circular indeterminate size="22" width="2" color="primary" />
    </div>

    <v-alert v-else-if="error" type="error" text dense rounded="lg" class="text-body-2 mb-0">
      {{ error }}
    </v-alert>

    <!-- NOT AVAILABLE -->
    <v-sheet
      v-else-if="data && !data.available"
      color="grey lighten-5"
      rounded="lg"
      class="pa-3 text-body-2 grey--text text--darken-2"
    >
      {{ data.message || unavailableText(data.reason) }}
      <router-link
        v-if="data.reason === 'not_configured'"
        to="/dashboard/integration?section=api-config&tab=customer-api"
        class="ml-1"
      >
        Set it up
      </router-link>
    </v-sheet>

    <!-- LEGACY RESPONSE -->
    <div v-else-if="data && data.legacy">
      <div class="text-caption grey--text mb-1">
        Your customer API uses the older format, so it's shown as it came back.
      </div>
      <JsonTree :value="data.raw" />
    </div>

    <!-- NO ACCOUNT -->
    <v-sheet
      v-else-if="data && data.found === false"
      color="grey lighten-5"
      rounded="lg"
      class="pa-3 text-body-2 grey--text text--darken-2"
    >
      No account for {{ data.phone || "this phone" }}. The bot treats them as a new customer.
    </v-sheet>

    <div v-else-if="data" class="sections">
      <!-- WHO -->
      <div v-if="data.customer" class="mb-3">
        <div class="text-body-2 font-weight-bold">{{ data.customer.name || "No name" }}</div>
        <div class="text-caption grey--text text--darken-1">
          {{ [data.customer.phone || data.phone, data.customer.email, data.customer.id && `ID ${data.customer.id}`]
            .filter(Boolean)
            .join(" · ") }}
          <template v-if="data.customer.since"> · customer since {{ day(data.customer.since) }}</template>
        </div>
        <div v-if="(data.customer.tags || []).length" class="mt-1">
          <v-chip v-for="t in data.customer.tags" :key="t" x-small label class="mr-1">{{ t }}</v-chip>
        </div>
      </div>

      <!-- SERVICE REQUESTS -->
      <section v-if="data.service_requests !== undefined" class="mb-3">
        <SectionHead icon="$wrench" title="Service requests" :count="openRequests" count-label="open" />
        <div v-if="!data.service_requests || !data.service_requests.length" class="text-caption grey--text">
          None open or closed in the last 30 days.
        </div>
        <v-sheet
          v-for="sr in requests"
          :key="sr.id"
          outlined
          rounded="lg"
          class="pa-2 mb-2"
          :class="{ 'item-closed': isClosedRequest(sr) }"
        >
          <div class="d-flex align-center flex-wrap">
            <code class="mr-2">{{ sr.id }}</code>
            <span class="text-body-2 font-weight-medium mr-2">{{ sr.type_description || sr.type }}</span>
            <v-spacer />
            <v-chip
              x-small
              label
              :color="isClosedRequest(sr) ? 'grey' : 'orange darken-1'"
              text-color="white"
              class="text-capitalize"
            >
              {{ sr.status || "open" }}
            </v-chip>
            <v-chip v-if="sr.waiting_on_customer" x-small label outlined color="error" class="ml-1">
              Waiting on customer
            </v-chip>
          </div>
          <div v-if="sr.stage" class="text-caption mt-1">
            <span class="font-weight-bold">{{ sr.stage }}</span>
            <span v-if="sr.stage_meaning" class="grey--text text--darken-1"> · {{ sr.stage_meaning }}</span>
          </div>
          <div class="text-caption grey--text text--darken-1">
            {{ [
              sr.opened_at && `Opened ${day(sr.opened_at)}`,
              sr.closed_at && `closed ${day(sr.closed_at)}`,
              sr.booking_id && `booking ${sr.booking_id}`,
              sr.vehicle_no,
            ]
              .filter(Boolean)
              .join(" · ") }}
          </div>
          <div v-if="sr.title" class="internal text-caption mt-1">
            <span class="internal-tag">Internal</span> {{ sr.title }}
          </div>
          <div v-if="sr.resolution" class="internal text-caption mt-1">
            <span class="internal-tag">Internal · resolution</span> {{ sr.resolution }}
          </div>
        </v-sheet>
      </section>

      <!-- UPCOMING -->
      <section v-if="data.upcoming !== undefined" class="mb-3">
        <SectionHead icon="$calendar-clock" title="Coming up" />
        <div v-if="!data.upcoming || !data.upcoming.length" class="text-caption grey--text">Nothing coming up.</div>
        <div v-for="(u, i) in data.upcoming || []" :key="`up-${i}`" class="row-line">
          <div class="d-flex align-center flex-wrap">
            <v-chip x-small label outlined :color="upcomingType(u.type).color" class="mr-2">
              {{ upcomingType(u.type).label }}
            </v-chip>
            <span class="text-body-2 mr-2">{{ u.label }}</span>
            <v-spacer />
            <span class="text-body-2 font-weight-medium">
              {{ u.amount == null ? "Amount not known yet" : money(u.amount, u.currency) }}
            </span>
          </div>
          <div class="text-caption grey--text text--darken-1">
            <template v-if="u.due_date">Due {{ day(u.due_date) }}</template>
            <template v-if="u.booking_id"> · booking {{ u.booking_id }}</template>
            <template v-if="u.explanation"> · {{ u.explanation }}</template>
            <a v-if="u.pay_url" :href="u.pay_url" target="_blank" rel="noopener" class="ml-1">Pay link</a>
          </div>
        </div>
      </section>

      <!-- PAYMENTS -->
      <section v-if="data.payments !== undefined" class="mb-3">
        <SectionHead icon="$wallet" title="Payments" />
        <div v-if="data.payments === null" class="text-caption grey--text">Couldn't load payments.</div>
        <template v-else>
          <div v-if="summary" class="d-flex flex-wrap text-caption mb-1">
            <span class="mr-3">Paid <b>{{ money(summary.total_paid, summary.currency) || "—" }}</b></span>
            <span class="mr-3">Refunded <b>{{ money(summary.total_refunded, summary.currency) || "—" }}</b></span>
            <span v-if="summary.refund_pending" class="mr-3 orange--text text--darken-3">
              Refund pending <b>{{ money(summary.refund_pending, summary.currency) }}</b>
            </span>
            <span v-if="summary.count != null" class="grey--text">{{ summary.count }} payments</span>
          </div>
          <div v-if="!data.payments.length" class="text-caption grey--text">No payments.</div>
          <div v-for="p in payments" :key="p.id || `${p.date}-${p.amount}`" class="row-line">
            <div class="d-flex align-center">
              <span class="text-caption grey--text text-no-wrap mr-2">{{ day(p.date) }}</span>
              <span class="text-body-2 text-truncate mr-2">{{ p.label || (p.direction === "refund" ? "Refund" : "Payment") }}</span>
              <v-spacer />
              <span
                class="text-body-2 font-weight-medium text-no-wrap"
                :class="p.direction === 'refund' ? 'green--text text--darken-2' : ''"
              >
                {{ p.direction === "refund" ? "Refund " : "" }}{{ money(p.amount, p.currency) }}
              </span>
            </div>
            <div class="text-caption grey--text text--darken-1">
              {{ [p.method, p.reference && `ref ${p.reference}`, p.booking_id && `booking ${p.booking_id}`]
                .filter(Boolean)
                .join(" · ") }}
              <v-chip
                v-if="p.refund_status"
                x-small
                label
                :color="p.refund_status === 'pending' ? 'orange darken-1' : 'green'"
                text-color="white"
                class="ml-1 text-capitalize"
              >
                {{ p.refund_status === "pending" ? "Refund pending" : "Refunded" }}
              </v-chip>
            </div>
          </div>
        </template>
      </section>

      <!-- BOOKINGS -->
      <section v-if="data.records !== undefined" class="mb-3">
        <SectionHead icon="$receipt" title="Bookings" />
        <div v-if="!data.records || !data.records.length" class="text-caption grey--text">No bookings.</div>
        <div
          v-for="r in records"
          :key="r.id"
          class="row-line"
          :class="{ 'item-closed': !isCurrentRecord(r) }"
        >
          <div class="d-flex align-center flex-wrap">
            <code class="mr-2">{{ r.id }}</code>
            <span class="text-body-2 text-truncate mr-2">{{ r.title }}</span>
            <v-spacer />
            <v-chip x-small label outlined class="text-capitalize">{{ r.status_label || r.status }}</v-chip>
          </div>
          <div class="text-caption grey--text text--darken-1">
            <template v-if="r.start_at">{{ day(r.start_at) }}</template>
            <template v-if="r.end_at"> – {{ day(r.end_at) }}</template>
            <template v-if="r.amount && r.amount.due">
              · due <b>{{ money(r.amount.due, r.amount.currency) }}</b>
            </template>
            <template v-else-if="r.amount && r.amount.total">
              · {{ money(r.amount.total, r.amount.currency) }}
            </template>
          </div>
        </div>
      </section>

      <!-- DUES -->
      <section v-if="data.dues !== undefined && data.dues && data.dues.length" class="mb-3">
        <SectionHead icon="$credit-card" title="Owed now" />
        <div v-for="(d, i) in data.dues" :key="d.id || `due-${i}`" class="row-line d-flex align-center">
          <span class="text-body-2 text-truncate mr-2">{{ d.label }}</span>
          <span v-if="d.due_date" class="text-caption grey--text mr-2">due {{ day(d.due_date) }}</span>
          <v-spacer />
          <span class="text-body-2 font-weight-medium">{{ money(d.amount, d.currency) }}</span>
        </div>
      </section>

      <!-- NOTES -->
      <section v-if="(data.notes || []).length" class="mb-1">
        <SectionHead icon="$notebook-pen" title="Notes" />
        <div v-for="(n, i) in data.notes" :key="`note-${i}`" class="text-caption">{{ n }}</div>
      </section>

      <div class="text-caption grey--text mt-2">
        This is what the bot can see about this customer. Internal notes are never quoted to them.
      </div>
    </div>
  </div>
</template>

<script>
import { VIcon } from "vuetify/lib";
import JsonTree from "@/components/integrations/JsonTree.vue";
import { apiError } from "@/utils/knowledge";
import {
  SOURCES,
  UNAVAILABLE,
  day,
  getChatCustomer,
  isClosedRequest,
  isCurrentRecord,
  money,
  newestPayments,
  sortRecords,
  sortRequests,
  time,
  upcomingType,
} from "@/utils/customer";

const SectionHead = {
  name: "SectionHead",
  functional: true,
  props: { icon: String, title: String, count: Number, countLabel: String },
  render(h, { props }) {
    return h("div", { class: "d-flex align-center mb-1" }, [
      h(VIcon, { props: { size: 14, color: "grey darken-1" }, class: "mr-1" }, props.icon),
      h("span", { class: "text-caption font-weight-bold text-uppercase grey--text text--darken-1" }, props.title),
      props.count
        ? h("span", { class: "text-caption orange--text text--darken-2 ml-2 font-weight-bold" }, `${props.count} ${props.countLabel}`)
        : null,
    ]);
  },
};

export default {
  name: "CustomerPanel",

  components: { JsonTree, SectionHead },

  props: {
    chatId: { type: String, required: true },
  },

  data: () => ({
    data: null,
    loading: "",
    error: "",
  }),

  computed: {
    sourceLabel() {
      return SOURCES[this.data?.source] || "their phone";
    },
    requests() {
      return sortRequests(this.data?.service_requests);
    },
    openRequests() {
      return (this.data?.service_requests || []).filter((sr) => !isClosedRequest(sr)).length;
    },
    payments() {
      return newestPayments(this.data?.payments);
    },
    summary() {
      return this.data?.payment_summary || null;
    },
    records() {
      return sortRecords(this.data?.records);
    },
  },

  watch: {
    chatId: { immediate: true, handler: "reset" },
  },

  methods: {
    day,
    time,
    money,
    isClosedRequest,
    isCurrentRecord,
    upcomingType,

    unavailableText(reason) {
      return UNAVAILABLE[reason] || "Customer data isn't available for this chat.";
    },

    reset() {
      this.data = null;
      this.load(false);
    },

    async load(refresh) {
      const chatId = this.chatId;
      this.loading = refresh ? "refresh" : "load";
      this.error = "";
      try {
        const data = await getChatCustomer(chatId, refresh);
        if (chatId === this.chatId) this.data = data;
      } catch (err) {
        if (chatId !== this.chatId) return;
        this.error =
          err.response?.status === 404
            ? "Customer data isn't available for this chat yet."
            : apiError(err, "Couldn't load the customer's data.");
      } finally {
        if (chatId === this.chatId) this.loading = "";
      }
    },
  },
};
</script>

<style scoped>
.customer-panel {
  max-height: 360px;
  overflow-y: auto;
  background: #fff;
}
.row-line {
  padding: 4px 0;
}
.row-line + .row-line {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.item-closed {
  opacity: 0.7;
}
.internal {
  background: #fff8e1;
  border-radius: 6px;
  padding: 4px 6px;
  white-space: pre-wrap;
  word-break: break-word;
}
.internal-tag {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.65rem;
  color: #8d6e00;
  margin-right: 4px;
}
</style>
