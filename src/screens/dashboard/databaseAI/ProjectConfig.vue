<template>
  <div>
    <v-row class="mb-6">
      <!-- Back Button -->
      <v-col cols="auto">
        <v-btn icon text color="primary" @click="$router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>

      <!-- Title + Description -->
      <v-col>
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">Database Schema Builder</h1>

          <p class="text-subtitle-2 grey--text mb-0">
            Configure tables, columns, and relationships for AI query generation
          </p>
        </div>
      </v-col>
    </v-row>
    <!-- Loader -->
    <v-overlay :value="loading" opacity="0.25">
      <v-progress-circular indeterminate size="70" width="6" color="primary" />
    </v-overlay>

    <!-- Header -->
    <v-card outlined rounded="xl">
      <div class="d-flex justify-space-between align-center pa-4">
        <div>
          <div class="text-h6 font-weight-bold">Database Schema</div>
          <div class="text-body-2 grey--text">
            {{ tables.length }} tables configured
          </div>
        </div>

        <v-btn color="primary" rounded depressed @click="schemaDialog = true">
          Upload Schema
        </v-btn>
      </div>

      <v-divider />

      <!-- Tables -->
      <v-simple-table>
        <thead>
          <tr>
            <th>Table</th>
            <th>Columns</th>
            <th>Primary Keys</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="table in tables" :key="table._id">
            <td class="font-weight-medium">{{ table.name }}</td>

            <td>{{ table.columns.length }}</td>

            <td>
              <v-chip
                v-for="c in table.columns.filter((col) => col.isPrimary)"
                :key="c.name"
                small
                outlined
                color="primary"
                class="mr-1"
              >
                {{ c.name }}
              </v-chip>
            </td>

            <td class="text-right">
              <v-btn
                small
                color="primary"
                rounded
                outlined
                depressed
                @click="viewTable(table)"
              >
                View Columns
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>

    <!-- Relationships -->
    <v-card outlined rounded="xl" class="mt-6">
      <div class="d-flex justify-space-between align-center pa-4">
        <div>
          <div class="text-h6 font-weight-bold">Relationships</div>
          <div class="text-body-2 grey--text">
            {{ relationships.length }} relationships defined
          </div>
        </div>

        <v-btn color="primary" rounded depressed @click="dialog = true">
          Add Relationship
        </v-btn>
      </div>

      <v-divider />

      <v-simple-table>
        <thead>
          <tr>
            <th>From Table</th>
            <th>From Column</th>
            <th>To Table</th>
            <th>To Column</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="r in relationships" :key="r._id">
            <td>{{ r.fromTable }}</td>
            <td>{{ r.fromColumn }}</td>
            <td>{{ r.toTable }}</td>
            <td>{{ r.toColumn }}</td>
            <td>
              <v-btn icon small @click="deleteRelationship(r._id)">
                <v-icon small color="red">mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>

    <!-- Upload Schema Dialog -->
    <v-dialog
      v-model="schemaDialog"
      max-width="650"
      rounded="xl"
      persistent
      overlay-opacity="0.8"
      overlay-color="#2c3e50"
    >
      <v-card rounded="xl">
        <!-- Header -->
        <div class="pa-6 pb-0 d-flex align-center">
          <v-avatar color="#eff2fb" rounded="xl" size="48" class="mr-4">
            <v-icon color="black">mdi-database-plus</v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold black--text">
              Upload Database Schema
            </div>

            <div class="text-caption grey--text">
              Paste SQL DDL to generate tables automatically
            </div>
          </div>

          <v-spacer />

          <v-btn icon @click="schemaDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider class="mt-4" />

        <v-card-text class="pa-6">
          <v-textarea
            v-model="ddl"
            outlined
            rows="8"
            label="Paste SQL Schema"
            placeholder="CREATE TABLE users ( id INT PRIMARY KEY, name VARCHAR(100) );"
          />
        </v-card-text>

        <div class="px-6 pb-6 d-flex justify-end">
          <v-btn text rounded class="mr-2" @click="schemaDialog = false">
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            rounded
            depressed
            :loading="loading"
            :disabled="!ddl"
            @click="uploadSchema"
          >
            Upload Schema
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Relationship Dialog -->
    <v-dialog v-model="dialog" max-width="500" rounded="xl">
      <v-card rounded="xl">
        <div class="pa-6 pb-0">
          <div class="text-h6 font-weight-bold">Add Relationship</div>
          <div class="text-caption grey--text">
            Define foreign key relationships between tables
          </div>
        </div>

        <v-divider class="mt-4" />

        <v-card-text class="mt-2">
          <!-- FROM TABLE -->
          <v-select
            v-model="rel.fromTable"
            :items="tableNames"
            label="From Table"
            outlined
            dense
            @change="updateFromColumns"
          />

          <!-- FROM COLUMN -->
          <v-select
            v-model="rel.fromColumn"
            :items="fromColumns"
            label="From Column"
            outlined
            dense
          />

          <!-- TO TABLE -->
          <v-select
            v-model="rel.toTable"
            :items="tableNames"
            label="To Table"
            outlined
            dense
            @change="updateToColumns"
          />

          <!-- TO COLUMN -->
          <v-select
            v-model="rel.toColumn"
            :items="toColumns"
            label="To Column"
            outlined
            dense
          />
        </v-card-text>

        <div class="px-6 pb-6 d-flex justify-end">
          <v-btn text rounded class="mr-2" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary" rounded depressed @click="addRelationship">
            Save Relationship
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Column Viewer Dialog -->
    <v-dialog v-model="tableDialog" max-width="700" rounded="xl">
      <v-card rounded="xl">
        <div class="pa-6 pb-0">
          <div class="text-h6 font-weight-bold text-capitalize">
            {{ selectedTable.name }} Columns
          </div>
        </div>

        <v-divider class="mt-4" />

        <v-card-text>
          <v-simple-table dense>
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Primary</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="c in selectedTable.columns" :key="c.name">
                <td>{{ c.name }}</td>
                <td>{{ c.type }}</td>
                <td>
                  <v-icon v-if="c.isPrimary" small color="primary">
                    mdi-key
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      loading: false,

      ddl: "",
      tables: [],
      relationships: [],

      dialog: false,
      schemaDialog: false,
      tableDialog: false,

      selectedTable: {},

      rel: {},

      fromColumns: [],
      toColumns: [],
    };
  },

  computed: {
    tableNames() {
      return this.tables.map((t) => t.name);
    },
  },
  watch: {
    dialog(val) {
      if (val) {
        this.rel = {};
        this.fromColumns = [];
        this.toColumns = [];
      }
    },
  },

  mounted() {
    this.loadSchema();
  },

  methods: {
    viewTable(table) {
      this.selectedTable = table;
      this.tableDialog = true;
    },

    updateFromColumns(tableName) {
      const table = this.tables.find((t) => t.name === tableName);

      if (table) {
        this.fromColumns = table.columns.map((c) => c.name);
      }

      this.rel.fromColumn = null;
    },

    updateToColumns(tableName) {
      const table = this.tables.find((t) => t.name === tableName);

      if (table) {
        this.toColumns = table.columns.map((c) => c.name);
      }

      this.rel.toColumn = null;
    },

    async loadSchema() {
      this.loading = true;

      try {
        const res = await apiClient.get(
          `/database-ai/schema/${this.$route.params.id}`,
        );

        this.tables = res.data.tables;
        this.relationships = res.data.relationships;
      } catch (err) {
        console.error(err);
      }

      this.loading = false;
    },

    async uploadSchema() {
      try {
        if (!this.ddl) {
          alert("Paste SQL schema first");
          return;
        }

        const tables = [];
        const relationships = [];

        // Split CREATE TABLE blocks
        const tableBlocks = this.ddl.split(/CREATE TABLE/i).slice(1);

        tableBlocks.forEach((block) => {
          const lines = block.trim().split("\n");

          const tableName = lines[0].replace("(", "").trim();

          const columns = [];

          lines.slice(1).forEach((line) => {
            line = line.trim().replace(",", "");

            if (!line || line.startsWith(")")) return;

            const parts = line.split(/\s+/);

            const name = parts[0];
            const type = parts[1];

            const isPrimary = line.toLowerCase().includes("primary key");

            columns.push({
              name,
              type,
              isPrimary,
            });
          });

          tables.push({
            name: tableName,
            columns,
          });
        });

        this.loading = true;

        await apiClient.post("/database-ai/schema/upload", {
          projectId: this.$route.params.id,
          tables,
          relationships,
        });

        this.schemaDialog = false;
        this.ddl = "";

        this.loadSchema();
      } catch (err) {
        console.error(err);
        alert("Invalid SQL schema");
      } finally {
        this.loading = false;
      }
    },

    async addRelationship() {
      try {
        await apiClient.post("/database-ai/relationship", {
          projectId: this.$route.params.id,
          fromTable: this.rel.fromTable,
          fromColumn: this.rel.fromColumn,
          toTable: this.rel.toTable,
          toColumn: this.rel.toColumn,
        });

        this.rel = {};
        this.dialog = false;

        this.loadSchema();
      } catch (err) {
        console.error("Relationship error", err);
      }
    },
    async deleteRelationship(id) {
      try {
        await apiClient.delete(`/database-ai/relationship/${id}`);

        this.loadSchema();
      } catch (err) {
        console.error("Delete relationship error", err);
      }
    },
  },
};
</script>
