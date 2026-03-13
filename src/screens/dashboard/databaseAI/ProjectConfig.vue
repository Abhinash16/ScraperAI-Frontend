<template>
  <div>
    <!-- HEADER -->
    <v-row>
      <v-col cols="12">
        <div class="text-h5 font-weight-bold">Database Schema</div>
        <div class="grey--text">
          Configure tables and relationships for AI query generation
        </div>
      </v-col>
    </v-row>

    <!-- LOADING -->
    <v-row v-if="loading" class="mt-4">
      <v-col cols="12">
        <v-card class="pa-6 rounded-xl" elevation="0">
          <v-skeleton-loader
            type="card, list-item, list-item"
          ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="!loading">
      <!-- SCHEMA UPLOAD -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-6 rounded-xl" elevation="0">
            <div class="text-h6 font-weight-bold mb-3">Upload SQL Schema</div>

            <v-textarea v-model="ddl" outlined rows="6" label="Paste SQL DDL" />

            <v-btn color="primary" class="mt-3" @click="uploadSchema">
              Upload Schema
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- TABLES -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-6 rounded-xl" elevation="0">
            <div class="text-h6 font-weight-bold mb-4">Tables</div>

            <v-expansion-panels>
              <v-expansion-panel v-for="t in tables" :key="t._id">
                <v-expansion-panel-header>
                  {{ t.name }}
                </v-expansion-panel-header>

                <v-expansion-panel-content>
                  <v-simple-table dense>
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Type</th>
                        <th>Primary</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="c in t.columns" :key="c._id">
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
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card>
        </v-col>
      </v-row>

      <!-- RELATIONSHIPS -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-6 rounded-xl" elevation="0">
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-h6 font-weight-bold">Relationships</div>

              <v-btn small color="primary" @click="dialog = true">
                Add Relationship
              </v-btn>
            </div>

            <v-simple-table dense>
              <thead>
                <tr>
                  <th>From Table</th>
                  <th>From Column</th>
                  <th>To Table</th>
                  <th>To Column</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="r in relationships" :key="r._id">
                  <td>{{ r.fromTable }}</td>
                  <td>{{ r.fromColumn }}</td>
                  <td>{{ r.toTable }}</td>
                  <td>{{ r.toColumn }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- RELATIONSHIP DIALOG -->
      <v-dialog v-model="dialog" max-width="500">
        <v-card class="pa-6 rounded-xl">
          <div class="text-h6 font-weight-bold mb-4">Add Relationship</div>

          <v-text-field v-model="rel.fromTable" label="From Table" />

          <v-text-field v-model="rel.fromColumn" label="From Column" />

          <v-text-field v-model="rel.toTable" label="To Table" />

          <v-text-field v-model="rel.toColumn" label="To Column" />

          <div class="d-flex justify-end mt-4">
            <v-btn text @click="dialog = false"> Cancel </v-btn>

            <v-btn color="primary" @click="addRelationship"> Save </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      ddl: "",
      tables: [],
      relationships: [],

      rel: {},
      dialog: false,

      loading: false,
    };
  },

  mounted() {
    this.loadSchema();
  },

  methods: {
    async loadSchema() {
      this.loading = true;

      try {
        const res = await apiClient.get(
          `/database-ai/schema/${this.$route.params.id}`,
        );

        this.tables = res.data.tables;
        this.relationships = res.data.relationships;
      } catch (err) {
        console.error("Schema load error", err);
      }

      this.loading = false;
    },

    async uploadSchema() {
      try {
        await apiClient.post("/database-ai/schema/upload", {
          projectId: this.$route.params.id,
          ddl: this.ddl,
        });

        this.ddl = "";

        this.loadSchema();
      } catch (err) {
        console.error("Upload schema error", err);
      }
    },

    async addRelationship() {
      try {
        await apiClient.post("/database-ai/relationship", {
          projectId: this.$route.params.id,
          ...this.rel,
        });

        this.rel = {};
        this.dialog = false;

        this.loadSchema();
      } catch (err) {
        console.error("Relationship error", err);
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  transition: all 0.25s ease;
}

.v-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}
</style>
