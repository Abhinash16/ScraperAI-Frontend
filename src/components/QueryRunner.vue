<template>
  <div class="query-runner pa-4">
    <!-- SQL PREVIEW -->
    <v-card outlined rounded="xl" class="pa-4 mb-4">
      <div class="d-flex justify-space-between align-center mb-2">
        <div class="text-caption grey--text">Generated SQL</div>

        <v-btn small color="success" rounded depressed @click="openModal">
          <v-icon left small>mdi-play</v-icon>
          Run Query
        </v-btn>
      </div>

      <pre class="sql-box">{{ sanitizedQuery }}</pre>
    </v-card>

    <!-- RESULTS -->
    <v-card v-if="rows.length" outlined rounded="xl" class="pa-4">
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="text-caption grey--text">
          {{ rows.length }} rows returned
        </div>

        <v-btn small text color="primary" @click="downloadCSV">
          <v-icon left small>mdi-download</v-icon>
          Download CSV
        </v-btn>
      </div>

      <v-data-table
        dense
        :headers="headers"
        :items="rows"
        class="elevation-0"
      />
    </v-card>

    <!-- EMPTY RESULT -->
    <v-card
      v-else-if="rows.length === 0 && executed"
      outlined
      rounded="xl"
      class="pa-6 text-center"
    >
      <v-icon large color="grey lighten-1">
        mdi-database-search-outline
      </v-icon>

      <div class="grey--text mt-2">No results</div>
    </v-card>

    <!-- RUN QUERY DIALOG -->

    <v-dialog
      v-model="dialog"
      max-width="520"
      rounded="xl"
      persistent
      overlay-opacity="0.8"
      overlay-color="#2c3e50"
    >
      <v-card rounded="xl">
        <!-- HEADER -->
        <div class="pa-6 pb-0 d-flex align-center">
          <v-avatar color="#eff2fb" rounded="xl" size="48" class="mr-4">
            <v-icon color="black">mdi-database</v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold">Database Connection</div>

            <div class="text-caption grey--text">
              Provide database credentials to execute the query
            </div>
          </div>

          <v-spacer />

          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider class="mt-4"></v-divider>

        <!-- FORM -->
        <v-card-text class="pa-6">
          <v-text-field
            v-model="db.host"
            label="Host"
            outlined
            dense
            placeholder="localhost"
            class="mb-3"
          />

          <v-text-field
            v-model="db.database"
            label="Database"
            outlined
            dense
            class="mb-3"
          />

          <v-text-field
            v-model="db.username"
            label="Username"
            outlined
            dense
            class="mb-3"
          />

          <v-text-field
            v-model="db.password"
            label="Password"
            type="password"
            outlined
            dense
          />
        </v-card-text>

        <!-- ACTIONS -->
        <div class="px-6 pb-6 d-flex justify-end">
          <v-btn text rounded class="mr-2" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            rounded
            depressed
            :loading="loading"
            @click="runQuery"
          >
            Execute Query
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" color="error" timeout="4000" top right>
      {{ errorMessage }}

      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  props: {
    query: String,
  },

  data() {
    return {
      dialog: false,
      loading: false,

      rows: [],
      headers: [],

      executed: false,

      db: {
        host: "localhost",
        database: "",
        username: "",
        password: "",
      },

      sanitizedQuery: "",

      snackbar: false,
      errorMessage: "",
    };
  },
  mounted() {
    this.sanitizedQuery = this.cleanSQL(this.query);
  },

  methods: {
    openModal() {
      this.dialog = true;
    },

    cleanSQL(sql) {
      return sql
        .replace(/```sql/gi, "")
        .replace(/```/g, "")
        .trim()
        .replace(/;+\s*$/, "");
    },

    async runQuery() {
      this.loading = true;
      this.executed = true;

      try {
        const res = await apiClient.post("/database-ai/run-query", {
          ...this.db,
          query: this.sanitizedQuery,
        });

        this.rows = res.data.rows || [];

        if (this.rows.length) {
          this.headers = Object.keys(this.rows[0]).map((k) => ({
            text: k,
            value: k,
          }));
        }

        this.dialog = false;
      } catch (err) {
        this.errorMessage =
          err.response?.data?.message || "Query execution failed";
        this.dialog = false;

        this.snackbar = true;
      }

      this.loading = false;
    },
    downloadCSV() {
      if (!this.rows.length) return;

      const keys = Object.keys(this.rows[0]);

      const csv = [
        keys.join(","),
        ...this.rows.map((r) => keys.map((k) => `"${r[k] ?? ""}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "query-results.csv";
      link.click();
    },
  },
};
</script>

<style scoped>
.query-runner {
  border-top: 1px dashed #e0e0e0;
  padding-top: 12px;
}
</style>
