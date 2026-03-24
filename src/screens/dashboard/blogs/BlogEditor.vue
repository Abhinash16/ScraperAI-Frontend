<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex align-center mb-4">
      <v-btn icon @click="$router.back(-1)">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <h3 class="ml-2">{{ form.id ? "Edit Blog" : "Create Blog" }}</h3>

      <v-spacer />

      <!-- SAVE -->
      <v-btn
        outlined
        class="mr-2"
        :loading="saving"
        :disabled="saving"
        @click="save"
        rounded
      >
        <v-icon left>mdi-content-save</v-icon>
        Save
      </v-btn>

      <!-- PREVIEW -->
      <v-btn outlined rounded class="mr-2" @click="preview"> Preview </v-btn>

      <!-- PUBLISH -->
      <v-btn color="primary" depressed rounded @click="openPublish">
        Publish
      </v-btn>
    </div>

    <!-- TEMPLATE -->
    <v-card v-if="!selectedTemplate" class="pa-4" rounded="xl" outlined>
      <div class="text-subtitle-1 font-weight-bold mb-4">Select Template</div>

      <v-row>
        <v-col v-for="template in templates" :key="template.id" cols="4">
          <v-card
            outlined
            rounded="xl"
            class="hover-card"
            @click="selectTemplate(template)"
          >
            <!-- <v-img
              v-if="template.preview"
              :src="template.preview"
              height="180"
              class="grey lighten-2"
            /> -->
            <v-card-text>
              <p class="font-weight-bold text-body-1 mb-1">
                {{ template.name }}
              </p>
              <p class="text-body-2 grey--text mb-2">
                {{ template.description || "No description" }}
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn
                small
                text
                color="primary"
                @click.stop="selectTemplate(template)"
              >
                Use Template
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- EDITOR -->
    <v-card v-else class="pa-6" rounded="xl" outlined>
      <v-row dense>
        <!-- TITLE -->
        <v-col cols="12">
          <v-text-field v-model="form.title" label="Title" outlined dense />
        </v-col>

        <!-- CONTENT -->
        <v-col cols="12">
          <div class="editor-wrapper mb-5">
            <quill-editor v-model="form.content" />
          </div>
        </v-col>

        <!-- EXCERPT -->
        <v-col cols="12">
          <v-textarea
            v-model="form.excerpt"
            label="Excerpt"
            outlined
            dense
            rows="2"
          />
        </v-col>

        <!-- COVER + CATEGORY -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.coverImage"
            label="Cover Image URL"
            outlined
            dense
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.category"
            label="Category"
            outlined
            dense
          />
        </v-col>

        <!-- TAGS -->
        <v-col cols="12">
          <v-combobox
            v-model="form.tags"
            multiple
            chips
            small-chips
            label="Tags"
            outlined
            dense
          />
        </v-col>

        <!-- SEO SECTION -->
        <v-col cols="12">
          <div class="text-subtitle-2 font-weight-bold mb-2">SEO Settings</div>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="form.metaTitle"
            label="Meta Title"
            outlined
            dense
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-textarea
            v-model="form.metaDescription"
            label="Meta Description"
            outlined
            dense
            rows="2"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- PUBLISH -->
    <v-dialog
      v-model="publishDialog"
      max-width="450"
      persistent
      rounded="xl"
      overlay-color="#2c3e50"
      overlay-opacity="0.8"
    >
      <v-card rounded="xl" :loading="loading">
        <!-- Header -->
        <v-card-title class="d-flex align-center pb-0">
          <v-avatar color="#eff2fb" rounded="xl" size="50" class="mr-4">
            <v-icon color="black">mdi-cloud-upload-outline</v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold black--text">Publish Blog</div>
            <div class="text-caption grey--text text--darken-1">
              Choose how you want to publish your post
            </div>
          </div>

          <v-spacer></v-spacer>

          <v-btn icon @click="publishDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Content -->
        <v-card-text class="pt-6">
          <!-- Internal Option -->
          <v-card
            outlined
            rounded="lg"
            class="pa-4 mb-4 d-flex align-center justify-space-between hover-card"
            @click="publish('internal')"
            style="cursor: pointer"
          >
            <div class="d-flex align-center">
              <v-avatar color="blue lighten-5" size="45" class="mr-3">
                <v-icon color="blue">mdi-file-document-outline</v-icon>
              </v-avatar>

              <div>
                <div class="font-weight-bold">Internal Publish</div>
                <div class="text-caption grey--text">
                  Publish inside your platform
                </div>
              </div>
            </div>
          </v-card>

          <!-- GitHub Option -->
          <v-card
            outlined
            rounded="lg"
            class="pa-4 d-flex align-center justify-space-between hover-card"
            @click="publish('github')"
            style="cursor: pointer"
          >
            <div class="d-flex align-center">
              <v-avatar color="grey lighten-4" size="45" class="mr-3">
                <v-icon>mdi-github</v-icon>
              </v-avatar>

              <div>
                <div class="font-weight-bold">Publish to GitHub</div>
                <div class="text-caption grey--text">
                  Push blog as markdown/code to repo
                </div>
              </div>
            </div>
          </v-card>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="justify-end px-4 pb-4">
          <v-btn text rounded class="text-none" @click="publishDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR -->
    <v-snackbar v-model="snackbar">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.snow.css";

export default {
  components: { quillEditor },

  data() {
    return {
      templates: [],
      selectedTemplate: null,
      publishDialog: false,

      saving: false,
      snackbar: false,
      snackbarText: "",

      form: {
        id: null,
        title: "",
        content: "",
        excerpt: "",
        coverImage: "",
        metaTitle: "",
        metaDescription: "",
        tags: [],
        category: "",
      },
      loading: false,
    };
  },

  async mounted() {
    try {
      const { data } = await apiClient.get("/blogs/templates/list");
      this.templates = data.templates;

      if (this.$route.params.id) {
        this.fetchBlog(this.$route.params.id);
      }
    } catch {
      this.show("Failed to load templates");
    }
  },

  methods: {
    /* SELECT TEMPLATE */
    selectTemplate(t) {
      this.selectedTemplate = t;
    },

    /* FETCH BLOG */
    async fetchBlog(id) {
      try {
        const { data } = await apiClient.get(`/blogs/${id}`);
        const b = data.blog;

        this.selectedTemplate = { id: b.templateId };

        this.form = {
          id: b._id,
          title: b.title,
          content: b.content,
          excerpt: b.excerpt,
          coverImage: b.coverImage,
          metaTitle: b.metaTitle,
          metaDescription: b.metaDescription,
          tags: b.tags || [],
          category: b.category || "",
        };
      } catch {
        this.show("Failed to load blog");
        this.$router.push("/blogs");
      }
    },

    /* SAVE */
    async save() {
      if (!this.form.title) {
        this.show("Title is required");
        return;
      }

      if (!this.selectedTemplate) {
        this.show("Select a template first");
        return;
      }

      try {
        this.saving = true;

        if (!this.form.id) {
          const { data } = await apiClient.post("/blogs", {
            ...this.form,
            templateId: this.selectedTemplate.id,
          });

          this.form.id = data._id;

          this.show("Saved successfully");
        } else {
          await apiClient.put(`/blogs/${this.form.id}`, this.form);
          this.show("Updated successfully");
        }
      } catch {
        this.show("Save failed");
      } finally {
        this.saving = false;
      }
    },

    /* PREVIEW */
    async preview() {
      if (!this.form.id) {
        this.show("Save first to preview");
        return;
      }

      try {
        const res = await apiClient.get(`/blogs/preview/${this.form.id}`, {
          responseType: "text", // important for HTML
        });

        const previewWindow = window.open("", "_blank");
        previewWindow.document.open();
        previewWindow.document.write(res.data);
        previewWindow.document.close();
      } catch (err) {
        console.error(err);
        this.show("Preview failed");
      }
    },

    /* PUBLISH */
    openPublish() {
      if (!this.form.id) {
        this.show("Save before publishing");
        return;
      }

      this.publishDialog = true;
    },

    async publish(mode) {
      this.loading = true;
      try {
        await apiClient.post(`/blogs/publish/${this.form.id}`, {
          publishMode: mode,
        });

        this.show("Published successfully");
        this.$router.push("/blogs");
      } catch (error) {
        const errMsg = error.response?.data?.error;
        this.show(`Publish failed${errMsg ? `: ${errMsg}` : ""}`);
      } finally {
        this.loading = false;
      }
    },

    /* SNACKBAR */
    show(msg) {
      this.snackbarText = msg;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
.hover-card {
  cursor: pointer;
  transition: 0.3s;
}
.hover-card:hover {
  transform: scale(1.03);
}

.editor-wrapper .ql-container {
  height: 500px;
}
</style>
