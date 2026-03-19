<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex align-center mb-6">
      <v-btn icon class="mr-2" @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <h3 class="text-h5 font-weight-bold">{{ pageTitle }}</h3>

      <v-spacer></v-spacer>

      <template v-if="step === 'edit'">
        <v-btn text @click="step = 'template'">Change Template</v-btn>

        <v-btn class="ml-2" @click="blogPreview">Preview</v-btn>

        <v-btn class="ml-2" @click="savePost" :loading="saving">
          Save Draft
        </v-btn>

        <v-btn color="primary" class="ml-2" @click="publishBlog">
          Publish
        </v-btn>

        <v-btn
          v-if="editMode"
          color="secondary"
          class="ml-2"
          @click="republishBlog"
        >
          Republish
        </v-btn>
      </template>
    </div>

    <!-- TEMPLATE SELECT -->
    <v-card v-if="step === 'template'" outlined class="pa-4">
      <div class="text-h6 mb-4">Choose Template</div>

      <v-row>
        <v-col v-for="t in templates" :key="t.id" cols="12" md="4">
          <v-card @click="selectTemplate(t)" class="pa-2" hover>
            <v-img :src="t.preview" height="150" />
            <div class="mt-2 font-weight-bold">{{ t.name }}</div>
            <div class="text-caption grey--text">
              {{ t.description }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- EDITOR -->
    <v-row v-else>
      <v-col cols="12" md="8">
        <v-card outlined class="pa-4">
          <v-form ref="form">
            <v-text-field v-model="form.title" label="Title" outlined dense />
            <v-text-field v-model="form.slug" label="Slug" outlined dense />

            <v-textarea v-model="form.excerpt" label="Excerpt" outlined dense />

            <quill-editor v-model="form.content" />

            <v-text-field
              v-model="form.meta_title"
              label="Meta Title"
              outlined
              dense
            />

            <v-textarea
              v-model="form.meta_description"
              label="Meta Description"
              outlined
              dense
            />
          </v-form>
        </v-card>
      </v-col>
    </v-row>

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
      step: "template",
      editMode: false,
      saving: false,

      templates: [],

      form: {
        id: null,
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        meta_title: "",
        meta_description: "",
        templateId: 1,
      },

      snackbar: false,
      snackbarText: "",
    };
  },

  computed: {
    pageTitle() {
      return this.step === "template"
        ? "Choose Template"
        : this.editMode
        ? "Edit Blog"
        : "Create Blog";
    },
  },

  async mounted() {
    await this.loadTemplates();

    const id = this.$route.params.id;

    if (id) {
      this.editMode = true;
      this.step = "edit";
      this.fetchPost(id);
    }
  },

  methods: {
    goBack() {
      this.$router.push("/blogs");
    },

    /* ===============================
       LOAD TEMPLATES
    =============================== */
    async loadTemplates() {
      try {
        const { data } = await apiClient.get("/blog/templates");
        this.templates = data.templates;
      } catch (err) {
        console.error(err);
      }
    },

    /* ===============================
       SELECT TEMPLATE → CREATE BLOG
    =============================== */
    async selectTemplate(template) {
      try {
        const { data } = await apiClient.post("/blogs", {
          title: template.name,
          templateId: template.id,
        });

        this.$router.push(`/blogs/${data._id}`);
      } catch (err) {
        console.error(err);
      }
    },

    /* ===============================
       FETCH BLOG
    =============================== */
    async fetchPost(id) {
      try {
        const { data } = await apiClient.get(`/blogs/${id}`);

        const blog = data.blog;

        this.form = {
          id: blog._id,
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          excerpt: blog.excerpt,
          meta_title: blog.metaTitle,
          meta_description: blog.metaDescription,
          templateId: blog.templateId,
        };
      } catch (err) {
        console.error(err);
      }
    },

    /* ===============================
       SAVE
    =============================== */
    async savePost() {
      this.saving = true;

      try {
        await apiClient.put(`/blogs/${this.form.id}`, {
          title: this.form.title,
          content: this.form.content,
          excerpt: this.form.excerpt,
          metaTitle: this.form.meta_title,
          metaDescription: this.form.meta_description,
          templateId: this.form.templateId,
        });

        this.snackbarText = "Saved ✅";
        this.snackbar = true;
      } catch (err) {
        console.error(err);
      } finally {
        this.saving = false;
      }
    },

    /* ===============================
       PREVIEW
    =============================== */
    async blogPreview() {
      try {
        const res = await apiClient.get(`/blogs/${this.form.id}/preview`, {
          responseType: "text",
        });

        const win = window.open("", "_blank");
        win.document.write(res.data);
        win.document.close();
      } catch (err) {
        console.error(err);
      }
    },

    /* ===============================
       PUBLISH
    =============================== */
    async publishBlog() {
      try {
        await apiClient.post(`/blogs/${this.form.id}/publish`, {
          publishMode: "github",
        });

        this.snackbarText = "Published 🚀";
        this.snackbar = true;
      } catch (err) {
        console.error(err);
      }
    },

    /* ===============================
       REPUBLISH
    =============================== */
    async republishBlog() {
      try {
        await apiClient.post(`/blogs/${this.form.id}/republish`);

        this.snackbarText = "Republished 🔄";
        this.snackbar = true;
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
