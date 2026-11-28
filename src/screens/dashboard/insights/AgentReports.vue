<template>
  <div>
    <ThingsToKnow feature="agents" />

    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Agents</h1>
        <div class="text-body-2 grey--text text--darken-1">
          What the bot achieved in each of its jobs: selling, and handling service requests. Chats
          customers started only.
        </div>
      </div>
      <v-spacer />
      <v-btn-toggle v-model="days" mandatory dense color="primary" class="mb-2" @change="load">
        <v-btn v-for="d in DAY_CHOICES" :key="d" small :value="d">{{ d }} days</v-btn>
      </v-btn-toggle>
    </div>

    <v-alert v-if="error" type="error" text rounded="lg">
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ error }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="load">Retry</v-btn>
      </div>
    </v-alert>

    <template v-else-if="loading && !report">
      <v-card v-for="n in 2" :key="n" outlined rounded="lg" class="pa-4 mb-4">
        <v-skeleton-loader type="heading, image" />
      </v-card>
    </template>

    <template v-else-if="report">
      <!-- ================= SALES AGENT ================= -->
      <v-card v-if="sales" outlined rounded="lg" class="mb-4">
        <div class="d-flex flex-wrap align-center px-5 py-4">
          <v-avatar size="40" tile color="deep-orange lighten-5" class="rounded-lg mr-3 flex-shrink-0">
            <v-icon size="20" color="deep-orange">$handshake</v-icon>
          </v-avatar>
          <div class="flex-grow-1 mr-4">
            <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">{{ sales.label || "Sales Agent" }}</div>
            <div class="text-body-2 grey--text text--darken-1">
              Helps interested customers choose and book, and scores each chat as a lead.
            </div>
          </div>
          <ActiveChip :active="sales.active" />
          <v-progress-circular v-if="loading" indeterminate size="18" width="2" color="primary" class="ml-3" />
        </div>
        <v-divider />

        <div class="pa-5">
          <NotOnNotice
            v-if="!sales.active"
            text="Sales mode is off, so the bot isn't scoring leads."
            link="/dashboard/bot-profile?tab=sales"
            link-text="Switch on sales mode"
          />
          <v-alert
            v-else-if="!sales.paymentLinks"
            text
            dense
            color="amber darken-3"
            rounded="lg"
            class="text-body-2"
          >
            No payment link action is on, so the bot can't take customers to payment.
            <router-link to="/dashboard/actions">Set one up</router-link>
          </v-alert>

          <!-- KPIs -->
          <v-row dense class="mb-2">
            <v-col v-for="k in salesKpis" :key="k.label" cols="6" md="4" lg>
              <Kpi v-bind="k" />
            </v-col>
          </v-row>

          <v-row>
            <!-- Funnel -->
            <v-col cols="12" md="6">
              <div class="section-title">How far leads got</div>
              <div class="text-caption grey--text text--darken-1 mb-3">
                Each step counts the leads that got at least that far.
              </div>
              <div v-for="f in funnel" :key="f.stage" class="mb-2">
                <div class="d-flex text-body-2">
                  <span :title="f.help">{{ f.label }}</span>
                  <v-spacer />
                  <span class="font-weight-bold">{{ f.reached }}</span>
                  <span class="grey--text ml-2 rate">{{ pct(f.rate) }}</span>
                </div>
                <v-progress-linear :value="f.width" :color="f.color" height="8" rounded background-color="grey lighten-4" />
              </div>
              <div class="text-caption grey--text text--darken-1 mt-3">
                Right now:
                <span v-for="(n, stage) in sales.stageNow || {}" :key="stage" class="mr-2 text-no-wrap">
                  {{ stageLabel(stage) }} {{ n }}
                </span>
              </div>
            </v-col>

            <!-- Rates and links -->
            <v-col cols="12" md="6">
              <div class="section-title mb-3">Conversion</div>
              <div v-for="r in salesRates" :key="r.label" class="d-flex text-body-2 py-1 row-line">
                <span>{{ r.label }}</span>
                <v-spacer />
                <span class="font-weight-bold">{{ r.value }}</span>
              </div>

              <div class="section-title mt-5 mb-2">Payment links that weren't paid</div>
              <div class="d-flex flex-wrap">
                <v-chip v-for="l in linksNotPaid" :key="l.label" small label class="mr-2 mb-2" :title="l.help">
                  {{ l.label }} <span class="font-weight-bold ml-1">{{ l.value }}</span>
                </v-chip>
              </div>
            </v-col>
          </v-row>

          <!-- Per day -->
          <div class="section-title mt-4 mb-1">Day by day</div>
          <apexchart
            v-if="salesDays.length"
            type="bar"
            height="260"
            :options="dayOptions(salesDays, ['#FF7043', '#7E57C2', '#43A047'])"
            :series="salesSeries"
          />
          <div v-else class="text-body-2 grey--text py-4">No activity in this period.</div>

          <v-row class="mt-2">
            <v-col cols="12" md="4">
              <div class="section-title mb-2">By channel</div>
              <table class="kv">
                <tr>
                  <th />
                  <th>Leads</th>
                  <th>Checkout</th>
                  <th>Links</th>
                  <th title="Payments the bot helped with">Paid</th>
                </tr>
                <tr v-for="(p, key) in sales.byPlatform || {}" :key="key">
                  <td>{{ platformLabel(key) }}</td>
                  <td>{{ p.leads || 0 }}</td>
                  <td>{{ p.checkout || 0 }}</td>
                  <td>{{ p.dealsMade || 0 }}</td>
                  <td>{{ p.dealsClosed || 0 }}</td>
                </tr>
              </table>
            </v-col>
            <v-col cols="12" md="4">
              <div class="section-title mb-2">What they asked for</div>
              <div v-if="!(sales.topProducts || []).length" class="text-body-2 grey--text">Nothing yet.</div>
              <table v-else class="kv">
                <tr>
                  <th />
                  <th>Leads</th>
                  <th>Paid</th>
                </tr>
                <tr v-for="p in sales.topProducts" :key="p.product">
                  <td>{{ p.product }}</td>
                  <td>{{ p.leads || 0 }}</td>
                  <td>{{ p.won || 0 }}</td>
                </tr>
              </table>
            </v-col>
            <v-col cols="12" md="4">
              <div class="section-title mb-2">Payments with the bot, by kind</div>
              <table class="kv">
                <tr v-for="(k, key) in closed.byKind || {}" :key="key">
                  <td>{{ kindLabel(key) }}</td>
                  <td>{{ k.count || 0 }}</td>
                  <td class="text-right">{{ money(k.revenue) }}</td>
                </tr>
              </table>
              <v-btn small text color="primary" class="mt-2 px-0" to="/dashboard/deals">
                See all deals
                <v-icon right size="14">$arrow-right</v-icon>
              </v-btn>
            </v-col>
          </v-row>

          <!-- Follow-ups -->
          <template v-if="followUps">
            <v-divider class="my-5" />
            <div class="d-flex align-center mb-1">
              <div class="section-title">Follow-ups</div>
              <v-spacer />
              <v-btn small text color="primary" class="px-0" to="/dashboard/follow-ups">
                See follow-ups
                <v-icon right size="14">$arrow-right</v-icon>
              </v-btn>
            </div>
            <div class="text-caption grey--text text--darken-1 mb-3">
              Messages the bot sent on WhatsApp to customers who were close to buying and went quiet.
            </div>
            <NotOnNotice
              v-if="!followUps.active"
              text="Follow-ups are off, so the bot doesn't get back to quiet customers."
              link="/dashboard/bot-profile?tab=sales"
              link-text="Switch them on in Bot behaviour"
            />
            <v-row dense class="mb-2">
              <v-col v-for="k in followUpKpis" :key="k.label" cols="6" md="3">
                <Kpi v-bind="k" />
              </v-col>
            </v-row>
            <div v-if="holdoutLine" class="text-body-2 grey--text text--darken-3 mb-3">
              <v-icon size="14" class="mr-1">$chart-column</v-icon>
              {{ holdoutLine }}
            </div>
            <v-row>
              <v-col cols="12" md="6">
                <div class="section-title mb-2">Why they were sent</div>
                <div v-if="!(followUps.byTrigger || []).length" class="text-body-2 grey--text">None sent yet.</div>
                <table v-else class="kv">
                  <tr v-for="t in followUps.byTrigger" :key="t.trigger">
                    <td>{{ triggerLabel(t.trigger) }}</td>
                    <td class="text-right">{{ n(t.sent) }}</td>
                  </tr>
                </table>
              </v-col>
              <v-col cols="12" md="6">
                <div class="section-title mb-2">Why they stopped early</div>
                <div v-if="!(followUps.stopped || []).length" class="text-body-2 grey--text">None stopped.</div>
                <table v-else class="kv">
                  <tr v-for="r in followUps.stopped" :key="r.reason">
                    <td>{{ stopLabel(r.reason) }}</td>
                    <td class="text-right">{{ n(r.count) }}</td>
                  </tr>
                </table>
              </v-col>
            </v-row>
          </template>
        </div>
      </v-card>

      <!-- ================= SR AGENT ================= -->
      <v-card v-if="service" outlined rounded="lg" class="mb-4">
        <div class="d-flex flex-wrap align-center px-5 py-4">
          <v-avatar size="40" tile color="blue lighten-5" class="rounded-lg mr-3 flex-shrink-0">
            <v-icon size="20" color="blue darken-1">$headset</v-icon>
          </v-avatar>
          <div class="flex-grow-1 mr-4">
            <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">{{ service.label || "SR Agent" }}</div>
            <div class="text-body-2 grey--text text--darken-1">
              Answers service questions and raises service requests (SRs) in your system.
            </div>
          </div>
          <ActiveChip :active="service.active" />
        </div>
        <v-divider />

        <div class="pa-5">
          <NotOnNotice
            v-if="!service.active"
            text="No service request action is on, so the bot can't raise SRs."
            link="/dashboard/actions"
            link-text="Set up an action"
          />

          <v-row dense class="mb-2">
            <v-col v-for="k in serviceKpis" :key="k.label" cols="6" md="3">
              <Kpi v-bind="k" />
            </v-col>
          </v-row>
          <div class="text-caption grey--text text--darken-1 mb-4">
            A conversation is sorted into sales or service when it ends, so chats still going on aren't
            counted yet.
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <div class="section-title mb-2">How service chats ended</div>
              <div v-for="o in outcomes" :key="o.key" class="d-flex text-body-2 py-1 row-line">
                <span>{{ o.label }}</span>
                <v-spacer />
                <span class="font-weight-bold">{{ o.value }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="section-title mb-2">Service requests</div>
              <div v-for="r in requestRows" :key="r.label" class="d-flex text-body-2 py-1 row-line">
                <span :title="r.help">{{ r.label }}</span>
                <v-spacer />
                <span class="font-weight-bold">{{ r.value }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="section-title mb-2">Requests by type</div>
              <div v-if="!(service.byType || []).length" class="text-body-2 grey--text">None raised.</div>
              <div v-for="t in byType" :key="t.type" class="mb-2">
                <div class="d-flex text-body-2">
                  <span>{{ t.type }}</span>
                  <v-spacer />
                  <span class="font-weight-bold">{{ t.raised }}</span>
                </div>
                <v-progress-linear :value="t.width" color="blue" height="6" rounded background-color="grey lighten-4" />
              </div>
            </v-col>
          </v-row>

          <div class="section-title mt-4 mb-1">Day by day</div>
          <apexchart
            v-if="serviceDays.length"
            type="bar"
            height="260"
            :options="dayOptions(serviceDays, ['#42A5F5', '#26A69A'])"
            :series="serviceSeries"
          />
          <div v-else class="text-body-2 grey--text py-4">No activity in this period.</div>

          <v-row class="mt-2">
            <v-col cols="12" md="6">
              <div class="section-title mb-2">By channel</div>
              <table class="kv">
                <tr>
                  <th />
                  <th>Chats</th>
                  <th>Solved by the bot</th>
                  <th>SRs raised</th>
                </tr>
                <tr v-for="(p, key) in service.byPlatform || {}" :key="key">
                  <td>{{ platformLabel(key) }}</td>
                  <td>{{ p.conversations || 0 }}</td>
                  <td>{{ p.resolvedByBot || 0 }}</td>
                  <td>{{ p.requestsRaised || 0 }}</td>
                </tr>
              </table>
            </v-col>
            <v-col cols="12" md="6">
              <div class="section-title mb-2">Top topics</div>
              <div v-if="!(service.topTopics || []).length" class="text-body-2 grey--text">Nothing yet.</div>
              <v-chip v-for="t in service.topTopics" :key="t.topic" small label class="mr-2 mb-2">
                {{ t.topic }} <span class="font-weight-bold ml-1">{{ t.count }}</span>
              </v-chip>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </template>
  </div>
</template>

<script>
import VueApexCharts from "vue-apexcharts";
import { VAlert, VChip } from "vuetify/lib";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import { apiError } from "@/utils/knowledge";
import { OUTCOMES } from "@/utils/conversations";
import {
  DEAL_KINDS,
  FUNNEL,
  PLATFORMS,
  fetchAgentReports,
  formatMoney,
  stageInfo,
  stopLabel,
  triggerLabel,
} from "@/utils/leads";

const DAY_CHOICES = [7, 30, 90];

const n = (v) => (typeof v === "number" ? v : 0);

// A KPI tile
const Kpi = {
  props: { label: String, value: [String, Number], sub: String, help: String },
  render(h) {
    return h("div", { class: "kpi pa-3 rounded-lg", attrs: { title: this.help || "" } }, [
      h("div", { class: "text-caption grey--text text--darken-1" }, this.label),
      h("div", { class: "text-h6 font-weight-bold grey--text text--darken-4" }, String(this.value ?? "—")),
      this.sub ? h("div", { class: "text-caption grey--text" }, this.sub) : null,
    ]);
  },
};

const ActiveChip = {
  props: { active: Boolean },
  render(h) {
    return h(
      VChip,
      {
        props: {
          small: true,
          label: true,
          color: this.active ? "green lighten-5" : "grey lighten-4",
          textColor: this.active ? "success" : "grey darken-1",
        },
        class: "font-weight-bold",
      },
      this.active ? "On" : "Not switched on",
    );
  },
};

const NotOnNotice = {
  props: { text: String, link: String, linkText: String },
  render(h) {
    return h(
      VAlert,
      { props: { text: true, dense: true, color: "grey darken-1", rounded: "lg" }, class: "text-body-2" },
      [
        h("span", { class: "mr-2" }, this.text),
        h("router-link", { props: { to: this.link } }, this.linkText),
      ],
    );
  },
};

export default {
  name: "AgentReports",

  components: { ThingsToKnow, apexchart: VueApexCharts, Kpi, ActiveChip, NotOnNotice },

  data() {
    return {
      DAY_CHOICES,
      days: 30,
      report: null,
      loading: false,
      error: "",
    };
  },

  computed: {
    agents() {
      return this.report?.agents || [];
    },
    sales() {
      return this.agents.find((a) => a.key === "sales") || null;
    },
    service() {
      return this.agents.find((a) => a.key === "service") || null;
    },
    closed() {
      return this.sales?.dealsClosed || {};
    },

    salesKpis() {
      const s = this.sales;
      const made = s.dealsMade || {};
      const closed = this.closed;
      // dealsClosed is the bot's payments only; add the ones without it for all payments
      const allCount = n(closed.count) + n(closed.withoutBot);
      const allRevenue = n(closed.revenue) + n(closed.revenueWithoutBot);
      return [
        { label: "Leads", value: n(s.leads), sub: `of ${n(s.conversations)} chats`, help: "Chats where the customer showed interest" },
        { label: "Hot leads", value: n(s.hotLeads), sub: `average score ${n(s.averageScore)}` },
        { label: "Payment links sent", value: n(made.count), sub: this.money(made.amount), help: "Payment links the bot sent" },
        {
          label: "Revenue with the bot",
          value: this.money(closed.revenue) || "—",
          sub: `${n(closed.count)} payments`,
          help: "Paid within 30 days of the bot's link or a chat with the bot",
        },
        {
          label: "All payments",
          value: allCount,
          sub: this.money(allRevenue),
          help: "Every payment your system reported, with or without the bot",
        },
      ];
    },

    followUps() {
      return this.sales?.followUps || null;
    },

    followUpKpis() {
      const f = this.followUps;
      return [
        { label: "Customers followed up", value: n(f.conversations), sub: `${n(f.nudges)} messages` },
        { label: "Replied", value: this.pct(f.replyRate), sub: `${n(f.replied)} customers`, help: "Wrote back after a follow-up" },
        { label: "Paid after a follow-up", value: this.pct(f.winRate), sub: `${n(f.won)} customers`, help: "Paid after a follow-up" },
        { label: "Revenue after a follow-up", value: this.money(f.revenue) || "—" },
      ];
    },

    // Only when some customers were held out, to compare with
    holdoutLine() {
      const h = this.followUps?.holdout;
      if (!h || !n(h.conversations)) return "";
      return `Share who paid: ${this.pct(this.followUps.winRate)} with follow-ups vs ${this.pct(h.winRate)} without (${n(h.conversations)} customers held out).`;
    },

    funnel() {
      const rows = this.sales?.funnel || [];
      const top = Math.max(1, ...rows.map((r) => n(r.reached)));
      return FUNNEL.map((stage) => {
        const r = rows.find((x) => x.stage === stage) || {};
        const info = stageInfo(stage);
        return { stage, ...info, reached: n(r.reached), rate: r.rate, width: (n(r.reached) / top) * 100 };
      });
    },

    salesRates() {
      const r = this.sales?.rates || {};
      const closed = this.closed;
      return [
        { label: "Leads that reached checkout", value: this.pct(r.leadToCheckout) },
        { label: "Leads that paid", value: this.pct(r.leadToWon) },
        { label: "Payment links that were paid", value: this.pct(r.linkToPaid) },
        { label: "Share of all payments the bot helped with (by count)", value: this.pct(r.botShareOfPayments) },
        { label: "Paid through the bot's link", value: n(closed.viaBotLink) },
        { label: "Paid after a chat with the bot", value: n(closed.afterBotConversation) },
        { label: "Paid without the bot", value: n(closed.withoutBot) },
        { label: "Lost", value: n(this.sales?.lost) },
        { label: "Handed to your team", value: n(this.sales?.handedOff) },
      ];
    },

    linksNotPaid() {
      const l = this.sales?.linksOffered || {};
      return [
        { label: "Customer said no", value: n(l.declined) },
        { label: "Expired", value: n(l.expired) },
        { label: "Your system refused", value: n(l.refused), help: "Your API didn't create the link" },
        { label: "Failed", value: n(l.failed), help: "Your API couldn't be reached" },
      ];
    },

    salesDays() {
      return this.sales?.perDay || [];
    },
    salesSeries() {
      const d = this.salesDays;
      return [
        { name: "Leads", data: d.map((x) => n(x.leads)) },
        { name: "Payment links", data: d.map((x) => n(x.dealsMade)) },
        { name: "Payments with the bot", data: d.map((x) => n(x.dealsClosed)) },
      ];
    },

    serviceKpis() {
      const s = this.service;
      const r = s.requests || {};
      return [
        { label: "Service chats", value: n(s.conversations) },
        { label: "Solved by the bot", value: this.pct(s.aiResolutionRate), help: "Ended without your team" },
        { label: "SRs raised", value: n(r.raised), sub: `in ${n(r.conversationsWithRequest)} chats` },
        { label: "Handed to your team", value: n(s.handedOff) },
      ];
    },

    outcomes() {
      const o = this.service?.outcomes || {};
      return Object.keys(OUTCOMES).map((key) => ({ key, label: OUTCOMES[key].label, value: n(o[key]) }));
    },

    requestRows() {
      const r = this.service?.requests || {};
      return [
        { label: "Raised", value: n(r.raised) },
        {
          label: "SR chats finished by the bot",
          value: `${n(r.resolvedByBot)} of ${n(r.conversationsWithRequest)}`,
          help: "Of the chats where the bot raised an SR, how many it finished without a person",
        },
        { label: "Customer said no", value: n(r.declinedByCustomer) },
        { label: "Expired before they confirmed", value: n(r.expired) },
        { label: "Your system refused", value: n(r.refused) },
        { label: "Failed", value: n(r.failed), help: "Your API couldn't be reached" },
      ];
    },

    byType() {
      const list = this.service?.byType || [];
      const top = Math.max(1, ...list.map((t) => n(t.raised)));
      return list.map((t) => ({ ...t, width: (n(t.raised) / top) * 100 }));
    },

    serviceDays() {
      return this.service?.perDay || [];
    },
    serviceSeries() {
      const d = this.serviceDays;
      return [
        { name: "Service chats", data: d.map((x) => n(x.conversations)) },
        { name: "SRs raised", data: d.map((x) => n(x.requestsRaised)) },
      ];
    },
  },

  created() {
    this.load();
  },

  methods: {
    n,
    triggerLabel,
    stopLabel,
    stageLabel: (s) => stageInfo(s).label,
    platformLabel: (p) => PLATFORMS[p] || p,
    kindLabel: (k) => DEAL_KINDS[k] || k,
    money: (v) => formatMoney(v),
    pct: (v) => (typeof v === "number" ? `${v}%` : "—"),

    dayOptions(days, colors) {
      return {
        chart: { type: "bar", toolbar: { show: false }, stacked: false },
        plotOptions: { bar: { columnWidth: "70%", borderRadius: 2 } },
        dataLabels: { enabled: false },
        colors,
        xaxis: {
          categories: days.map((d) => d.day),
          type: "datetime",
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: { labels: { formatter: (v) => Math.round(v) } },
        grid: { borderColor: "#E0E0E0", strokeDashArray: 3 },
        legend: { position: "top", horizontalAlign: "left" },
        tooltip: { theme: "light", x: { format: "dd MMM" } },
      };
    },

    async load() {
      this.loading = true;
      this.error = "";
      try {
        this.report = await fetchAgentReports(this.days);
      } catch (err) {
        this.error = apiError(err, "Failed to load the agent reports");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #212121;
}
.rate {
  min-width: 48px;
  text-align: right;
}
.row-line {
  border-bottom: 1px solid #f1f3f6;
}
.kv {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.kv th {
  text-align: left;
  font-weight: 600;
  color: #757575;
  padding: 2px 8px 4px 0;
}
.kv td {
  padding: 4px 8px 4px 0;
  border-bottom: 1px solid #f1f3f6;
}
.kpi {
  background: #f7f8fb;
  height: 100%;
}
</style>
