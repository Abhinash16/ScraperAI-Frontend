<template>
  <div>
    <!-- Main listing card -->
    <v-card outlined rounded="xl">
      <div class="d-flex justify-space-between align-center pa-4">
        <!-- Left Content -->
        <div>
          <div class="text-h6 font-weight-bold mr-3">Blog Posts</div>
          <div class="text-body-2 grey--text">
            Manage your blog content – create, edit, and publish posts.
          </div>
        </div>

        <!-- Right Content -->
        <div class="d-flex align-center">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search posts..."
            single-line
            hide-details
            outlined
            dense
            rounded
            class="mr-2"
          ></v-text-field>

          <v-btn class="mr-2" color="primary" outlined depressed rounded>
            Total: {{ posts.length }}
          </v-btn>

          <v-btn color="primary" @click="goToCreate" depressed rounded>
            <v-icon left>mdi-plus</v-icon> New Post
          </v-btn>
        </div>
      </div>

      <v-divider></v-divider>

      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredPosts"
        :loading="loading"
        :items-per-page="10"
        class="elevation-0"
        responsive
      >
        <!-- Status chip -->

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="item.status === 'published' ? 'success' : 'warning'"
            small
            outlined
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Actions -->
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mr-2" @click="editPost(item)">mdi-pencil</v-icon>
          <v-icon small class="mr-2" @click="previewPost(item)">mdi-eye</v-icon>
          <v-icon small @click="confirmDeletePost(item)">mdi-delete</v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog"
      max-width="350"
      rounded="xl"
      overlay-color="#2c3e50"
      overlay-opacity="0.8"
    >
      <v-card class="text-center" rounded="xl">
        <v-card-text>
          <v-avatar color="error lighten-5" size="70" class="my-4">
            <v-icon color="error" size="40">mdi-alert-octagon-outline</v-icon>
          </v-avatar>

          <div class="text-h6 font-weight-bold black--text mb-2">
            Delete Post?
          </div>
          <p class="text-body-2 grey--text text--darken-1">
            Are you sure you want to delete "<strong>{{
              selectedPost?.title
            }}</strong
            >"? This action cannot be undone.
          </p>
        </v-card-text>

        <v-card-actions class="justify-center pb-4">
          <v-btn
            @click="deleteDialog = false"
            text
            rounded
            large
            class="px-6 mr-2 text-none"
          >
            Cancel
          </v-btn>
          <v-btn
            @click="deletePost"
            color="error"
            depressed
            rounded
            large
            class="px-8 text-none font-weight-bold"
            :loading="deleting"
          >
            Yes, Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar" color="success" timeout="2000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script>
// import apiClient from "@/service/axios";

export default {
  data() {
    return {
      search: "",
      loading: false,
      posts: [],
      headers: [
        { text: "Title", value: "title" },
        { text: "Author", value: "author" },
        { text: "Categories", value: "categories" },
        { text: "Status", value: "status" },
        { text: "Date", value: "created_at" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      deleteDialog: false,
      deleting: false,
      selectedPost: null,
      snackbar: false,
      snackbarText: "",
    };
  },

  computed: {
    filteredPosts() {
      if (!this.search) return this.posts;
      const term = this.search.toLowerCase();
      return this.posts.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.author.toLowerCase().includes(term),
      );
    },
  },

  mounted() {
    this.fetchPosts();
  },

  methods: {
    fetchPosts() {
      this.loading = true;
      // Simulate API call – replace with actual apiClient.get('/posts')
      setTimeout(() => {
        this.posts = [
          {
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
          },
          {
            id: 2,
            title: "Best Practices for Chatbots",
            subtitle: "Designing conversational experiences",
            author: "John Smith",
            categories: "Chatbots",
            status: "draft",
            created_at: "2025-02-12",
            slug: "best-practices-chatbots",
            excerpt: "Key principles for effective chatbot design.",
            content:
              "<h2>1. Keep it simple</h2><p>Users appreciate brevity...</p>",
            featured_image_url: "",
            meta_title: "",
            meta_description: "",
          },
          {
            id: 3,
            title: "Integrating Vuetify 2",
            subtitle: "Building beautiful dashboards",
            author: "Alex Lee",
            categories: "UI, Vuetify",
            status: "published",
            created_at: "2025-02-14",
            slug: "integrating-vuetify-2",
            excerpt: "How to use Vuetify 2 in your projects.",
            content: "<p>Vuetify 2 offers a plethora of components...</p>",
            featured_image_url: "https://via.placeholder.com/600x400",
            meta_title: "Vuetify 2 Integration",
            meta_description: "Guide to using Vuetify 2",
          },
        ];
        this.loading = false;
      }, 500);
    },

    goToCreate() {
      this.$router.push({ path: "/blog-create" });
    },

    editPost(post) {
      this.$router.push({ path: `/edit-blog/${post.id}` });
    },

    previewPost(post) {
      window.open(`/blog/preview/${post.id}`, "_blank");
    },

    confirmDeletePost(post) {
      this.selectedPost = post;
      this.deleteDialog = true;
    },

    deletePost() {
      this.deleting = true;
      // Simulate API call – replace with actual apiClient.delete
      setTimeout(() => {
        const index = this.posts.findIndex(
          (p) => p.id === this.selectedPost.id,
        );
        if (index !== -1) this.posts.splice(index, 1);
        this.deleteDialog = false;
        this.deleting = false;
        this.selectedPost = null;
        this.snackbarText = "Post deleted successfully.";
        this.snackbar = true;
      }, 500);
    },
  },
};
</script>
