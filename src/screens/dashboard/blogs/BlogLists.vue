<template>
  <div>
    <v-card outlined rounded="xl">
      <!-- HEADER -->
      <div class="d-flex justify-space-between align-center pa-4">
        <div>
          <div class="text-h6 font-weight-bold">Blog Posts</div>
          <div class="text-body-2 grey--text">
            Manage your blog content – create, edit, and publish posts.
          </div>
        </div>

        <div class="d-flex align-center">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search..."
            outlined
            dense
            rounded
            hide-details
            class="mr-2"
          />

          <v-btn rounded outlined color="primary" class="mr-2">
            Total: {{ filteredPosts.length }}
          </v-btn>

          <v-btn
            rounded
            depressed
            color="primary"
            @click="$router.push('blogs/create')"
          >
            <v-icon left>mdi-plus</v-icon> New Post
          </v-btn>
        </div>
      </div>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="filteredPosts"
        :loading="loading"
      >
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.status="{ item }">
          <v-chip small outlined :color="statusColor(item.status)">
            {{ item.status }}
          </v-chip>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <v-icon small @click="editPost(item)">mdi-pencil</v-icon>

          <v-icon small class="ml-2" @click="preview(item)"> mdi-eye </v-icon>

          <v-icon
            small
            class="ml-2"
            color="green"
            v-if="item.status !== 'published'"
            @click="openPublish(item)"
          >
            mdi-upload
          </v-icon>

          <v-icon
            small
            class="ml-2"
            color="blue"
            v-if="item.status === 'published'"
            @click="republish(item)"
          >
            mdi-refresh
          </v-icon>

          <v-icon small class="ml-2" color="red" @click="confirmDelete(item)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Publish -->
    <v-dialog
      v-model="publishDialog"
      max-width="450"
      persistent
      rounded="xl"
      overlay-color="#2c3e50"
      overlay-opacity="0.8"
    >
      <v-card rounded="xl">
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

    <!-- Delete -->
    <v-dialog
      v-model="deleteDialog"
      max-width="350"
      rounded="xl"
      overlay-color="#2c3e50"
      overlay-opacity="0.8"
    >
      <v-card class="text-center" rounded="xl">
        <v-card-text>
          <!-- Icon -->
          <v-avatar color="error lighten-5" size="70" class="my-4">
            <v-icon color="error" size="40"> mdi-alert-octagon-outline </v-icon>
          </v-avatar>

          <!-- Title -->
          <div class="text-h6 font-weight-bold black--text mb-2">
            Delete Post?
          </div>

          <!-- Description -->
          <p class="text-body-2 grey--text text--darken-1">
            This action will permanently delete the post. You won’t be able to
            recover it later.
          </p>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="justify-center pb-4">
          <v-btn
            text
            rounded
            large
            class="px-6 mr-2 text-none"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="error"
            depressed
            rounded
            large
            class="px-8 text-none font-weight-bold"
            @click="deletePost"
          >
            Yes, Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar">{{ snackbarText }}</v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      search: "",
      loading: false,
      posts: [],
      publishDialog: false,
      deleteDialog: false,
      selectedPost: null,
      snackbar: false,
      snackbarText: "",

      headers: [
        { text: "Title", value: "title" },
        { text: "Status", value: "status" },
        { text: "Created", value: "createdAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },

  computed: {
    filteredPosts() {
      return this.posts.filter((p) =>
        p.title?.toLowerCase().includes(this.search.toLowerCase()),
      );
    },
  },

  mounted() {
    this.fetchPosts();
  },

  methods: {
    async fetchPosts() {
      try {
        this.loading = true;
        const { data } = await apiClient.get("/blogs");
        this.posts = data;
      } catch {
        this.show("Failed to load blogs");
      } finally {
        this.loading = false;
      }
    },

    editPost(post) {
      this.$router.push(`blogs/${post._id}`);
    },

    async preview(post) {
      if (!post?._id) {
        this.show("Invalid blog");
        return;
      }

      // Open tab first (prevents popup blocking)
      const previewWindow = window.open("", "_blank");

      try {
        const res = await apiClient.get(`/blogs/preview/${post._id}`, {
          responseType: "text",
        });

        previewWindow.document.open();
        previewWindow.document.write(res.data);
        previewWindow.document.close();
      } catch (err) {
        console.error(err);
        previewWindow.close();
        this.show("Preview failed");
      }
    },

    openPublish(post) {
      this.selectedPost = post;
      this.publishDialog = true;
    },

    async publish(mode) {
      try {
        await apiClient.post(`/blogs/publish/${this.selectedPost._id}`, {
          publishMode: mode,
        });
        this.show("Published Successfully!");
        this.fetchPosts();
      } catch (error) {
        const errMsg = error.response?.data?.error;
        this.show(`Publish failed${errMsg ? `: ${errMsg}` : ""}`);
      } finally {
        this.publishDialog = false;
      }
    },

    async republish(post) {
      try {
        await apiClient.post(`/blogs/republish/${post._id}`);
        this.show("Republished Successfully!");
      } catch (error) {
        const errMsg = error.response?.data?.error;
        this.show(`Republish failed${errMsg ? `: ${errMsg}` : ""}`);
      }
    },

    confirmDelete(post) {
      this.selectedPost = post;
      this.deleteDialog = true;
    },

    async deletePost() {
      try {
        await apiClient.delete(`/blogs/${this.selectedPost._id}`);
        this.show("Deleted Successfully!");
        this.fetchPosts();
      } catch (error) {
        const errMsg = error.response?.data?.error;
        this.show(`Delete failed${errMsg ? `: ${errMsg}` : ""}`);
      } finally {
        this.deleteDialog = false;
      }
    },

    show(msg) {
      this.snackbarText = msg;
      this.snackbar = true;
    },

    statusColor(status) {
      return { draft: "orange", published: "green" }[status] || "grey";
    },

    formatDate(d) {
      return new Date(d).toLocaleDateString();
    },
  },
};
</script>
