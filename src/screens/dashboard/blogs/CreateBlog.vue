<template>
  <div>
    <!-- Header with back button and title -->
    <div class="d-flex align-center mb-6">
      <v-btn icon class="mr-2" @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h3 class="text-h5 font-weight-bold">
        {{ pageTitle }}
      </h3>
      <v-spacer></v-spacer>
      <template v-if="step === 'edit'">
        <v-btn text class="mr-2" @click="step = 'template'">
          Change Template
        </v-btn>
        <v-btn
          color="primary"
          @click="savePost"
          :loading="saving"
          :disabled="!valid"
          depressed
          rounded
        >
          {{ editMode ? "Update" : "Publish" }}
        </v-btn>
      </template>
    </div>

    <!-- Template Selection Step -->
    <v-card v-if="step === 'template'" outlined rounded="xl" class="pa-4">
      <div class="text-h6 mb-4">Choose a Template</div>
      <v-row>
        <v-col
          v-for="template in templates"
          :key="template.id"
          cols="12"
          md="4"
        >
          <v-card
            outlined
            rounded="lg"
            hover
            @click="selectTemplate(template)"
            class="template-card"
          >
            <v-img
              :src="
                template.thumbnail ||
                'https://via.placeholder.com/300x200?text=No+Image'
              "
              height="150"
              class="mb-2"
            ></v-img>
            <v-card-title class="py-1 text-subtitle-1">
              {{ template.name }}
            </v-card-title>
            <v-card-text class="text-caption grey--text">
              {{ template.description }}
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Editor Step (shows when template selected or in edit mode) -->
    <template v-else>
      <v-row>
        <!-- LEFT COLUMN: FORM -->
        <v-col cols="12" md="7" class="pr-md-4">
          <v-card outlined rounded="xl" class="pa-4">
            <v-form ref="form" v-model="valid">
              <!-- Title -->
              <div class="mb-4">
                <label
                  class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                >
                  Title <span class="error--text">*</span>
                </label>
                <v-text-field
                  v-model="form.title"
                  :rules="[(v) => !!v || 'Title is required']"
                  placeholder="e.g. Getting Started with AI Support"
                  outlined
                  dense
                  hide-details="auto"
                  color="primary"
                  background-color="#f8fafc"
                ></v-text-field>
              </div>

              <!-- Subtitle -->
              <div class="mb-4">
                <label
                  class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                >
                  Subtitle
                </label>
                <v-text-field
                  v-model="form.subtitle"
                  placeholder="Optional subtitle"
                  outlined
                  dense
                  hide-details="auto"
                  color="primary"
                  background-color="#f8fafc"
                ></v-text-field>
              </div>

              <!-- Slug and Status row -->
              <v-row>
                <v-col cols="8">
                  <div class="mb-4">
                    <label
                      class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                    >
                      Slug <span class="error--text">*</span>
                    </label>
                    <v-text-field
                      v-model="form.slug"
                      :rules="[(v) => !!v || 'Slug is required']"
                      placeholder="getting-started-ai-support"
                      outlined
                      dense
                      hide-details="auto"
                      color="primary"
                      background-color="#f8fafc"
                    ></v-text-field>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="mb-4">
                    <label
                      class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                    >
                      Status
                    </label>
                    <v-select
                      v-model="form.status"
                      :items="['draft', 'published', 'archived']"
                      outlined
                      dense
                      hide-details="auto"
                      color="primary"
                      background-color="#f8fafc"
                    ></v-select>
                  </div>
                </v-col>
              </v-row>

              <!-- Publish Date -->
              <div class="mb-4">
                <label
                  class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                >
                  Publish Date
                </label>
                <v-menu
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="form.published_at"
                      label=""
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      outlined
                      dense
                      background-color="#f8fafc"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="form.published_at"
                    @input="dateMenu = false"
                  ></v-date-picker>
                </v-menu>
              </div>

              <!-- Excerpt -->
              <div class="mb-4">
                <label
                  class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                >
                  Excerpt
                </label>
                <v-textarea
                  v-model="form.excerpt"
                  placeholder="Short summary of the post"
                  rows="2"
                  outlined
                  dense
                  hide-details="auto"
                  color="primary"
                  background-color="#f8fafc"
                ></v-textarea>
              </div>

              <!-- Content with Quill -->
              <div class="mb-4">
                <label
                  class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                >
                  Content
                </label>
                <quill-editor
                  ref="quillEditor"
                  v-model="form.content"
                  :options="editorOptions"
                  class="quill-editor-custom"
                />
              </div>

              <!-- Categories and Tags -->
              <v-row>
                <v-col cols="6">
                  <div class="mb-4">
                    <label
                      class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                    >
                      Categories
                    </label>
                    <v-combobox
                      v-model="form.categories"
                      :items="categoryOptions"
                      multiple
                      chips
                      small-chips
                      outlined
                      dense
                      hide-details="auto"
                      color="primary"
                      background-color="#f8fafc"
                    ></v-combobox>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="mb-4">
                    <label
                      class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                    >
                      Tags
                    </label>
                    <v-combobox
                      v-model="form.tags"
                      :items="tagOptions"
                      multiple
                      chips
                      small-chips
                      outlined
                      dense
                      hide-details="auto"
                      color="primary"
                      background-color="#f8fafc"
                    ></v-combobox>
                  </div>
                </v-col>
              </v-row>

              <!-- Featured Image -->
              <div class="mb-4">
                <label
                  class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                >
                  Featured Image
                </label>
                <v-file-input
                  v-model="featuredImage"
                  label="Choose image"
                  accept="image/*"
                  outlined
                  dense
                  hide-details="auto"
                  background-color="#f8fafc"
                  @change="onFeaturedImageChange"
                ></v-file-input>
                <v-img
                  v-if="form.featured_image_url"
                  :src="form.featured_image_url"
                  max-height="80"
                  contain
                  class="mt-2"
                ></v-img>
              </div>

              <!-- SEO Fields (collapsible) -->
              <div class="mb-4">
                <v-btn text small color="primary" @click="showSeo = !showSeo">
                  <v-icon left small>mdi-cog</v-icon>
                  {{ showSeo ? "Hide" : "Show" }} SEO Settings
                </v-btn>
              </div>
              <v-expand-transition>
                <div v-if="showSeo">
                  <div class="mb-4">
                    <label
                      class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                    >
                      Meta Title
                    </label>
                    <v-text-field
                      v-model="form.meta_title"
                      placeholder="SEO title"
                      outlined
                      dense
                      hide-details="auto"
                      color="primary"
                      background-color="#f8fafc"
                    ></v-text-field>
                  </div>
                  <div class="mb-4">
                    <label
                      class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
                    >
                      Meta Description
                    </label>
                    <v-textarea
                      v-model="form.meta_description"
                      placeholder="SEO description"
                      rows="2"
                      outlined
                      dense
                      hide-details="auto"
                      color="primary"
                      background-color="#f8fafc"
                    ></v-textarea>
                  </div>
                </div>
              </v-expand-transition>
            </v-form>
          </v-card>
        </v-col>

        <!-- RIGHT COLUMN: LIVE PREVIEW -->
        <v-col cols="12" md="5" class="pl-md-4">
          <v-card outlined rounded="xl" class="pa-4" color="#EFF2FB">
            <div class="d-flex align-center mb-3">
              <v-icon left color="primary">mdi-eye</v-icon>
              <span class="text-subtitle-2 font-weight-bold">Live Preview</span>
            </div>
            <v-divider class="mb-4"></v-divider>

            <!-- Preview content -->
            <div class="preview-content">
              <!-- Title -->
              <h1 class="text-h4 font-weight-bold mb-2">
                {{ form.title || "Untitled" }}
              </h1>

              <!-- Subtitle -->
              <h2
                v-if="form.subtitle"
                class="text-h6 grey--text text--darken-1 mb-3"
              >
                {{ form.subtitle }}
              </h2>

              <!-- Featured Image -->
              <v-img
                v-if="form.featured_image_url"
                :src="form.featured_image_url"
                max-height="200"
                contain
                class="mb-4"
              ></v-img>

              <!-- Metadata (date, categories, tags) -->
              <div class="d-flex flex-wrap align-center mb-4">
                <v-icon small left class="mr-1">mdi-calendar</v-icon>
                <span class="text-caption mr-4">{{
                  form.published_at || "Not set"
                }}</span>

                <v-icon small left class="mr-1">mdi-folder</v-icon>
                <span class="text-caption mr-4">{{
                  form.categories.join(", ") || "Uncategorized"
                }}</span>

                <v-icon small left class="mr-1">mdi-tag</v-icon>
                <span class="text-caption">{{
                  form.tags.join(", ") || "No tags"
                }}</span>
              </div>

              <!-- Excerpt (if any) -->
              <div v-if="form.excerpt" class="mb-4">
                <v-divider class="mb-2"></v-divider>
                <p class="text-body-2 font-italic grey--text">
                  {{ form.excerpt }}
                </p>
                <v-divider class="mt-2"></v-divider>
              </div>

              <!-- Rendered Content (HTML from Quill) -->
              <div class="mt-4">
                <div
                  v-if="form.content"
                  class="ql-editor"
                  v-html="form.content"
                ></div>
                <p v-else class="grey--text">No content yet.</p>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Image Upload Modal (for inserting images into content) -->
    <v-dialog v-model="showUploadModal" max-width="500" persistent>
      <v-card>
        <v-card-title>Upload Image</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="selectedFile"
            label="Choose an image..."
            accept="image/*"
            prepend-icon="mdi-camera"
            outlined
            dense
            hide-details
          ></v-file-input>
          <v-btn
            color="primary"
            class="mt-4"
            @click="uploadImage"
            :disabled="!selectedFile"
            :loading="uploading"
          >
            Upload
          </v-btn>
          <v-alert
            v-if="uploadStatus"
            :type="uploadStatusVariant"
            class="mt-4"
            dense
            text
          >
            {{ uploadStatus }}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" color="success" timeout="2000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios"; // adjust path
import "quill/dist/quill.snow.css";
import { quillEditor } from "vue-quill-editor";

export default {
  components: { quillEditor },
  data() {
    return {
      step: "template", // 'template' or 'edit'
      editMode: false,
      saving: false,
      valid: false,
      dateMenu: false,
      showSeo: false,
      form: {
        id: null,
        title: "",
        subtitle: "",
        slug: "",
        status: "draft",
        published_at: new Date().toISOString().substr(0, 10),
        excerpt: "",
        content: "",
        categories: [],
        tags: [],
        featured_image_url: "",
        meta_title: "",
        meta_description: "",
      },
      templates: [
        {
          id: 1,
          name: "Standard Blog",
          description: "A clean, minimal template for blog posts.",
          thumbnail: "https://via.placeholder.com/300x200?text=Standard",
          title: "My New Blog Post",
          subtitle: "Insights and updates",
          content: "<h2>Introduction</h2><p>Start writing here...</p>",
          categories: ["Tech"],
          tags: ["blog"],
          excerpt: "A brief introduction to the topic.",
        },
        {
          id: 2,
          name: "Tutorial Guide",
          description: "Step-by-step tutorial layout with code blocks.",
          thumbnail: "https://via.placeholder.com/300x200?text=Tutorial",
          title: "How to Build Something",
          subtitle: "A comprehensive guide",
          content:
            "<h2>Prerequisites</h2><p>What you need before starting.</p><h2>Step 1</h2><p>First step...</p>",
          categories: ["Tutorial"],
          tags: ["guide"],
          excerpt: "Follow these steps to master the topic.",
        },
        {
          id: 3,
          name: "News/Announcement",
          description: "For product updates and company news.",
          thumbnail: "https://via.placeholder.com/300x200?text=News",
          title: "Announcing Something New",
          subtitle: "What's changing and why",
          content:
            "<p>We are excited to announce...</p><h3>Key Highlights</h3><ul><li>Feature one</li><li>Feature two</li></ul>",
          categories: ["News"],
          tags: ["announcement"],
          excerpt: "Latest updates from our team.",
        },
      ],
      editorOptions: {
        modules: {
          toolbar: {
            container: [
              [{ header: "1" }, { header: "2" }],
              ["bold", "italic", "underline", "strike", "blockquote"],
              [{ script: "sub" }, { script: "super" }],
              [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
              ],
              ["link"],
              ["clean"],
            ],
            handlers: {
              image: this.imageHandler,
            },
          },
        },
        placeholder: "Write your post content here...",
        theme: "snow",
      },
      categoryOptions: ["AI", "Support", "Tech", "News", "Tutorial"],
      tagOptions: ["Vue", "Vuetify", "Dashboard", "Tutorial", "Guide"],
      featuredImage: null,
      showUploadModal: false,
      selectedFile: null,
      uploading: false,
      uploadStatus: "",
      uploadStatusVariant: "info",
      snackbar: false,
      snackbarText: "",
      quill: null,
      quillRange: null,
    };
  },

  computed: {
    pageTitle() {
      if (this.step === "template") return "Choose a Template";
      return this.editMode ? "Edit Post" : "Create New Post";
    },
  },

  mounted() {
    const id = this.$route.params.id;
    if (id) {
      this.editMode = true;
      this.step = "edit"; // skip template selection for editing
      this.fetchPost(id);
    }
    this.$nextTick(() => {
      if (this.$refs.quillEditor) {
        this.quill = this.$refs.quillEditor.quill;
      }
    });
  },

  methods: {
    goBack() {
      this.$router.push({ name: "blog-list" });
    },

    fetchPost() {
      // Simulate API call – replace with actual apiClient.get(`/posts/${id}`)
      setTimeout(() => {
        // Dummy data for demo
        const post = {
          id: 1,
          title: "Getting Started with AI Support",
          subtitle: "A beginner’s guide",
          author: "Jane Doe",
          categories: "AI, Support",
          status: "published",
          created_at: "2025-02-10",
          slug: "getting-started-ai-support",
          excerpt:
            "Learn the basics of integrating AI into your support workflow.",
          content:
            "<h2>Introduction</h2><p>AI is transforming customer support...</p>",
          featured_image_url: "https://via.placeholder.com/600x400",
          meta_title: "AI Support Guide",
          meta_description: "Beginner guide to AI support",
        };
        this.form = JSON.parse(JSON.stringify(post));
        if (typeof this.form.categories === "string") {
          this.form.categories = this.form.categories
            .split(", ")
            .filter((c) => c);
        }
        if (typeof this.form.tags === "string") {
          this.form.tags = this.form.tags.split(", ").filter((t) => t);
        }
      }, 500);
    },

    selectTemplate(template) {
      // Populate form with template data
      this.form.title = template.title || "";
      this.form.subtitle = template.subtitle || "";
      this.form.content = template.content || "";
      this.form.categories = template.categories || [];
      this.form.tags = template.tags || [];
      this.form.excerpt = template.excerpt || "";
      this.form.featured_image_url = template.featured_image_url || "";
      this.step = "edit";
    },

    savePost() {
      if (!this.$refs.form.validate()) return;
      this.saving = true;

      // Simulate save – replace with actual API call
      setTimeout(() => {
        this.saving = false;
        this.snackbarText = this.editMode
          ? "Post updated successfully."
          : "Post created successfully.";
        this.snackbar = true;
        this.goBack();
      }, 500);
    },

    onFeaturedImageChange(file) {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.form.featured_image_url = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.form.featured_image_url = "";
      }
    },

    imageHandler() {
      if (this.quill) {
        this.quillRange = this.quill.getSelection();
      }
      this.showUploadModal = true;
    },

    async uploadImage() {
      if (!this.selectedFile) {
        this.uploadStatus = "Please select an image.";
        this.uploadStatusVariant = "warning";
        return;
      }
      this.uploading = true;
      this.uploadStatus = "";
      const formData = new FormData();
      formData.append("image", this.selectedFile);

      try {
        const { data } = await apiClient.post("add/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.uploadStatus = "Upload successful!";
        this.uploadStatusVariant = "success";

        if (this.quill && this.quillRange) {
          this.quill.insertEmbed(this.quillRange.index, "image", data.imageUrl);
        }

        this.showUploadModal = false;
        this.selectedFile = null;
      } catch (error) {
        this.uploadStatus = "Upload failed.";
        this.uploadStatusVariant = "error";
        console.error(error);
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped>
.template-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.template-card:hover {
  transform: translateY(-4px);
}
.quill-editor-custom ::v-deep .ql-container {
  min-height: 250px;
  background-color: #f8fafc;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
.quill-editor-custom ::v-deep .ql-toolbar {
  background-color: #fff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
</style>
