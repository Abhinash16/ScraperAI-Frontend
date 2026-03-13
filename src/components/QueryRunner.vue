<template>
  <v-container class="query-runner mt-2">
    <!-- RUN BUTTON -->
    <div>
      <codeblock class="mb-2">
        {{ query }}
      </codeblock>
    </div>
    <v-btn small color="success" @click="openModal"> Run Query </v-btn>

    <!-- RESULT -->
    <div v-if="rows.length" class="mt-3">
      <div class="d-flex justify-space-between mb-2">
        <div class="text-caption grey--text">
          {{ rows.length }} rows returned
        </div>

        <v-btn small text @click="downloadCSV"> Download CSV </v-btn>
      </div>

      <v-data-table
        dense
        :headers="headers"
        :items="rows"
        class="elevation-0"
      />
    </div>

    <div v-else-if="rows.length === 0" class="mt-3">
      <v-alert type="info" border="left" colored-border>
        No results to display
      </v-alert>
    </div>

    <!-- RUN MODAL -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Database Connection</v-card-title>

        <v-card-text>
          <v-text-field v-model="db.host" label="Host" dense outlined />
          <v-text-field v-model="db.database" label="Database" dense outlined />
          <v-text-field v-model="db.username" label="Username" dense outlined />
          <v-text-field
            v-model="db.password"
            label="Password"
            type="password"
            dense
            outlined
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn text @click="dialog = false"> Cancel </v-btn>

          <v-btn color="primary" :loading="loading" @click="runQuery">
            Execute
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
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

      db: {
        host: "localhost",
        database: "",
        username: "",
        password: "",
      },

      sanitizedQuery: "",
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
        alert(err.response?.data?.message || "Query failed");
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
