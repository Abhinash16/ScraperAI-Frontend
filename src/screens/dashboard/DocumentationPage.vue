<template>
  <div>
    <!-- HEADER -->
    <v-row class="mb-6">
      <v-col>
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">Documentation</h1>
          <p class="text-subtitle-2 grey--text mb-0">
            Complete guide to integrate chatbot and enable AI features
          </p>
        </div>
      </v-col>

      <!-- DOWNLOAD BUTTON -->
      <v-col cols="auto">
        <v-btn color="primary" rounded depressed @click="downloadDocs">
          <v-icon left>mdi-download</v-icon>
          Download Docs
        </v-btn>
      </v-col>
    </v-row>

    <!-- ================= USER INFO ================= -->
    <v-card outlined rounded="xl" class="mb-6">
      <div class="pa-4">
        <div class="text-h6 font-weight-bold">Getting Started</div>
        <div class="text-caption grey--text">
          Understand how ScraperAI works before integrating
        </div>
      </div>

      <v-divider />

      <v-card-text>
        <div class="mb-3">
          ScraperAI allows you to add an AI-powered chatbot to your website that
          can:
        </div>

        <v-list dense>
          <v-list-item>
            <v-list-item-content>
              Answer customer queries automatically
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              Fetch data from your database (via DB AI)
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              Integrate with external APIs (like customer APIs)
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <div class="mt-3 text-caption grey--text">
          To get started, you need:
          <br />
          1. Your API Key (already generated for you)
          <br />
          2. Add chatbot script to your website
          <br />
          3. (Optional) Configure database AI for advanced queries
        </div>
      </v-card-text>
    </v-card>

    <!-- ================= CHAT INTEGRATION ================= -->
    <v-card outlined rounded="xl" class="mb-6">
      <div class="pa-4">
        <div class="text-h6 font-weight-bold">Chat Integration</div>
        <div class="text-caption grey--text">
          Add AI chatbot to your website
        </div>
      </div>

      <v-divider />

      <v-card-text>
        <!-- EXPLANATION -->
        <div class="mb-4 text-caption grey--text">
          This script connects your website to ScraperAI servers using your
          unique API key. The chatbot will automatically load and start
          responding to users.
        </div>

        <!-- STEP 1 -->
        <div class="mb-4">
          <div class="font-weight-medium mb-2">Step 1: Copy Script</div>

          <div class="code-box d-flex justify-space-between">
            <pre class="ma-0">{{ scriptCode }}</pre>

            <v-btn icon small @click="copyScript">
              <v-icon small>mdi-content-copy</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- STEP 2 -->
        <div class="mb-4">
          <div class="font-weight-medium mb-1">Step 2: Add to Website</div>

          <div class="text-caption grey--text">
            Paste the script inside your <b>&lt;body&gt;</b> or before the
            closing <b>&lt;/body&gt;</b> tag in your HTML file.
          </div>
        </div>

        <!-- STEP 3 -->
        <div>
          <div class="font-weight-medium mb-1">Step 3: Verify</div>

          <div class="text-caption grey--text">
            Open your website → chatbot should appear at bottom-right corner.
          </div>
        </div>

        <!-- IMPORTANT NOTE -->
        <v-alert dense outlined type="info" class="mt-4">
          Make sure your API key is active. If chatbot doesn't appear, check
          browser console.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- ================= DB QUERY ================= -->
    <v-card outlined rounded="xl" class="mb-6">
      <div class="pa-4">
        <div class="text-h6 font-weight-bold">Database AI Setup</div>
        <div class="text-caption grey--text">
          Configure schema for AI query generation
        </div>
      </div>

      <v-divider />

      <v-card-text>
        <div class="mb-4 text-caption grey--text">
          Database AI allows the chatbot to understand your database and
          generate queries automatically. This is useful for dynamic data like
          users, orders, bookings, etc.
        </div>

        <v-timeline dense>
          <v-timeline-item small>
            <b>Step 1:</b> Go to "DB Query Generator" and create a new project
          </v-timeline-item>

          <v-timeline-item small>
            <b>Step 2:</b> Select your database type (MySQL / PostgreSQL)
          </v-timeline-item>

          <v-timeline-item small>
            <b>Step 3:</b> Click <b>Configure</b> to open schema builder
          </v-timeline-item>

          <v-timeline-item small>
            <b>Step 4:</b> Upload your SQL schema (DDL)
            <div class="text-caption grey--text">
              Example: CREATE TABLE users (...)
            </div>
          </v-timeline-item>

          <v-timeline-item small>
            <b>Step 5:</b> Add relationships between tables
            <div class="text-caption grey--text">
              This helps AI understand joins between tables
            </div>
          </v-timeline-item>

          <v-timeline-item small>
            <b>Step 6:</b> Start asking questions in natural language
          </v-timeline-item>
        </v-timeline>

        <v-alert dense outlined type="success" class="mt-4">
          Once configured, your chatbot can answer questions like:
          <br />
          "Show all users created last week"
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      user: {},
    };
  },

  computed: {
    scriptCode() {
      const open = "<" + "script";
      const close = "</" + "script>";

      return `${open} src="https://scraper.ai/chatpanel.js" id="chatPanelScript" data-api-key="${
        this.user.apiKey || "YOUR_API_KEY"
      }">${close}`;
    },
  },

  mounted() {
    this.currentLoggedInUserInfo();
  },

  methods: {
    async currentLoggedInUserInfo() {
      try {
        const { data } = await apiClient.get("/clients/currentUser");
        this.user = data.data;
      } catch {
        console.log("error loading user");
      }
    },

    copyScript() {
      const open = "<" + "script";
      const close = "</" + "script>";

      const raw = `${open} src="https://scraper.ai/chatpanel.js" id="chatPanelScript" data-api-key="${this.user.apiKey}">${close}`;

      navigator.clipboard.writeText(raw);
    },

    downloadDocs() {
      const open = "<" + "script";
      const close = "</" + "script>";

      const scriptTag = `${open} src="https://scraper.ai/chatpanel.js" id="chatPanelScript" data-api-key="${this.user.apiKey}">${close}`;

      const content = `
ScraperAI Documentation

Website: ${this.user.company_website}
API Key: ${this.user.apiKey}

CHAT INTEGRATION:
Add this script:

${scriptTag}

DB QUERY SETUP:
1. Create Project
2. Select DB Version
3. Upload Schema
4. Add Relationships

Customer API:
${this.user.customerApi?.url}
  `;

      const blob = new Blob([content], { type: "text/plain" });
      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);
      link.download = "scraperai-docs.txt";
      link.click();
    },
  },
};
</script>

<style scoped>
.code-box {
  background: #0f172a;
  color: #fff;
  padding: 14px;
  border-radius: 10px;
  font-size: 13px;
  overflow-x: auto;
}
</style>
