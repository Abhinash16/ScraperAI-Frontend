<template>
  <div>
    <v-card class="pa-4" outlined rounded="xl">
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon left color="primary">mdi-book-open-variant</v-icon>
        Help & Guide
      </v-card-title>

      <v-divider class="my-3"></v-divider>

      <div>
        <v-expansion-panels multiple hover>
          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-medium">
              <template v-slot:default="{ open }">
                <v-row no-gutters align="center">
                  <v-icon left :color="open ? 'primary' : ''"
                    >mdi-github</v-icon
                  >
                  Connect Your GitHub Repository
                </v-row>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <p class="body-2 text--secondary">
                You can connect your GitHub repository to publish blogs
                automatically.
              </p>

              <v-subheader class="pl-0"
                ><v-icon small left>mdi-clipboard-list-outline</v-icon> What you
                need</v-subheader
              >
              <v-list dense flat>
                <v-list-item>
                  <v-list-item-icon class="mr-3"
                    ><v-icon small
                      >mdi-check-circle-outline</v-icon
                    ></v-list-item-icon
                  >
                  <v-list-item-content
                    >A GitHub repository (Public or
                    Private)</v-list-item-content
                  >
                </v-list-item>
                <v-list-item>
                  <v-list-item-icon class="mr-3"
                    ><v-icon small>mdi-key-variant</v-icon></v-list-item-icon
                  >
                  <v-list-item-content
                    >Personal Access Token (PAT)</v-list-item-content
                  >
                </v-list-item>
              </v-list>

              <v-subheader class="pl-0"
                ><v-icon small left>mdi-ray-start-arrow</v-icon>
                Steps</v-subheader
              >
              <v-list dense>
                <v-list-item
                  v-for="(step, i) in [
                    'Go to Settings → Connect Repository',
                    'Enter Repo URL, Branch, Folder & Token',
                    'Click Connect',
                  ]"
                  :key="i"
                >
                  <v-list-item-avatar
                    color="grey lighten-4"
                    size="24"
                    class="mr-3"
                  >
                    <span class="caption">{{ i + 1 }}</span>
                  </v-list-item-avatar>
                  <v-list-item-content>{{ step }}</v-list-item-content>
                </v-list-item>
              </v-list>

              <v-alert type="info" dense text>
                We verify access, branch, and publishing permissions.
              </v-alert>

              <v-alert type="error" dense text>
                Common issues: invalid repo URL, wrong branch, or token access
                issues.
              </v-alert>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-medium">
              <div class="d-flex align-center">
                <v-icon left>mdi-cloud-upload</v-icon>
                Publishing Your Blog
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-subheader class="pl-0">Publishing Modes</v-subheader>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-card class="pa-3" outlined height="100%">
                    <div class="subtitle-2 d-flex align-center mb-1">
                      <v-icon small left color="green">mdi-earth</v-icon>
                      Internal
                    </div>
                    <div class="caption text--secondary">
                      Publish inside the platform (quick & easy).
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-card class="pa-3" outlined height="100%">
                    <div class="subtitle-2 d-flex align-center mb-1">
                      <v-icon small left>mdi-github</v-icon>
                      GitHub
                    </div>
                    <div class="caption text--secondary">
                      Converts blog to HTML and pushes to your repo.
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-subheader class="pl-0"
                ><v-icon small left>mdi-ray-start-arrow</v-icon>
                Steps</v-subheader
              >
              <v-list dense>
                <v-list-item
                  v-for="(step, i) in [
                    'Open Your Blog',
                    'Fill Title, Meta Title & Description',
                    'Click Publish',
                    'Select mode',
                  ]"
                  :key="i"
                >
                  <v-list-item-avatar
                    color="grey lighten-4"
                    size="24"
                    class="mr-3"
                  >
                    <span class="caption">{{ i + 1 }}</span>
                  </v-list-item-avatar>
                  <v-list-item-content>{{ step }}</v-list-item-content>
                </v-list-item>
              </v-list>

              <v-alert type="info" dense text class="mt-4" icon="mdi-cog-sync">
                Blog is validated, converted to HTML, and published.
              </v-alert>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-medium">
              <div class="d-flex align-center">
                <v-icon left>mdi-link-variant</v-icon> After Publishing
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <p class="body-2">Your blog will be available at:</p>
              <div class="code-block mb-3">
                <code>https://your-site/blog/your-slug.html</code>
              </div>
              <v-alert type="success" dense text icon="mdi-refresh">
                You can update anytime by republishing.
              </v-alert>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-medium">
              <div class="d-flex align-center">
                <v-icon left color="error">mdi-alert-octagon</v-icon>
                Troubleshooting
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list dense>
                <v-list-item
                  v-for="item in [
                    'Missing SEO fields',
                    'Repo not connected',
                    'GitHub access issue',
                    'Network error',
                  ]"
                  :key="item"
                >
                  <v-list-item-icon class="mr-3"
                    ><v-icon color="error" small
                      >mdi-close-circle-outline</v-icon
                    ></v-list-item-icon
                  >
                  <v-list-item-content>{{ item }}</v-list-item-content>
                </v-list-item>
              </v-list>
              <v-alert type="warning" dense text>
                Don’t click publish multiple times while processing.
              </v-alert>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-medium">
              <div class="d-flex align-center">
                <v-icon left color="amber darken-2">mdi-lightbulb-on</v-icon>
                Best Practices
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-list dense flat>
                <v-list-item>
                  <v-list-item-icon class="mr-3">
                    <v-icon color="success" small>mdi-check-decagram</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="body-2"
                      >Use SEO-friendly titles & slugs</v-list-item-title
                    >
                    <v-list-item-subtitle
                      >Keep them short and keyword-rich.</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-icon class="mr-3">
                    <v-icon color="success" small>mdi-check-decagram</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="body-2"
                      >Always fill meta fields</v-list-item-title
                    >
                    <v-list-item-subtitle
                      >Improves social media sharing and Google
                      ranking.</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-icon class="mr-3">
                    <v-icon color="success" small>mdi-check-decagram</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="body-2"
                      >Use GitHub mode for production</v-list-item-title
                    >
                    <v-list-item-subtitle
                      >It ensures your site is fast and
                      version-controlled.</v-list-item-subtitle
                    >
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-header class="font-weight-medium">
              <div class="d-flex align-center">
                <v-icon left color="blue">mdi-lifebuoy</v-icon>
                Need Help?
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <p class="body-2">If something isn’t working, try these steps:</p>
              <v-chip-group>
                <v-chip small outlined color="primary"
                  >Reconnect Your Repository</v-chip
                >
                <v-chip small outlined color="primary"
                  >Check Token Permissions</v-chip
                >
                <v-chip small outlined color="primary"
                  >Try Publishing Again</v-chip
                >
              </v-chip-group>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.code-block {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
code {
  color: #d81b60;
  background: transparent !important;
  font-weight: bold;
}
/* Ensure icons and text are perfectly centered in the expansion header */
.v-expansion-panel-header {
  min-height: 64px;
}
</style>
