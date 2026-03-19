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
            hide-details
            class="mr-2"
          />

          <v-btn outlined color="primary" class="mr-2">
            Total: {{ posts.length }}
          </v-btn>

          <v-btn color="primary" @click="goToCreate">
            <v-icon left>mdi-plus</v-icon> New Post
          </v-btn>
        </div>
      </div>

      <v-divider />

      <!-- TABLE -->
      <v-data-table
        :headers="headers"
        :items="filteredPosts"
        :loading="loading"
      >
        <!-- STATUS -->
        <template v-slot:item[`status`]="{ item }">
          <v-chip
            small
            :color="item.status === 'published' ? 'green' : 'orange'"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- CATEGORY -->
        <template v-slot:item[`category`]="{ item }">
          <span>
            {{
              Array.isArray(item.category)
                ? item.category.join(", ")
                : item.category || "-"
            }}
          </span>
        </template>

        <!-- DATE -->
        <template v-slot:item[`createdAt`]="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <!-- ACTIONS -->
        <template v-slot:item[`actions]="{ item }">
          <v-icon small class="mr-2" @click="editPost(item)">
            mdi-pencil
          </v-icon>

          <v-icon small class="mr-2" @click="previewPost(item)">
            mdi-eye
          </v-icon>

          <v-icon
            small
            class="mr-2"
            color="green"
            v-if="item.status !== 'published'"
            @click="publish(item)"
          >
            mdi-upload
          </v-icon>

          <v-icon
            small
            class="mr-2"
            color="blue"
            v-if="item.status === 'published'"
            @click="republish(item)"
          >
            mdi-refresh
          </v-icon>

          <v-icon small color="red" @click="confirmDeletePost(item)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- DELETE DIALOG -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete Post?</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ selectedPost?.title }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red" @click="deletePost" :loading="deleting">
            Delete
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

export default {
  data() {
    return {
      search: "",
      loading: false,
      posts: [],

      headers: [
        { text: "Title", value: "title" },
        { text: "Category", value: "category" },
        { text: "Status", value: "status" },
        { text: "Created", value: "createdAt" },
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
          p.title?.toLowerCase().includes(term) ||
          p.slug?.toLowerCase().includes(term),
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
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    goToCreate() {
      this.$router.push("/blog-create");
    },

    editPost(post) {
      this.$router.push(`/edit-blog/${post._id}`);
    },

    previewPost(post) {
      window.open(`/api/blogs/preview/${post._id}`, "_blank");
    },

    async publish(post) {
      try {
        await apiClient.post(`/api/blogs/${post._id}/publish`, {
          publishMode: "github", // or "internal"
        });

        this.snackbarText = "Published successfully";
        this.snackbar = true;

        this.fetchPosts();
      } catch (err) {
        console.error(err);
      }
    },

    async republish(post) {
      try {
        await apiClient.post(`/api/blogs/${post._id}/republish`);

        this.snackbarText = "Republished successfully";
        this.snackbar = true;
      } catch (err) {
        console.error(err);
      }
    },

    confirmDeletePost(post) {
      this.selectedPost = post;
      this.deleteDialog = true;
    },

    async deletePost() {
      try {
        this.deleting = true;

        await apiClient.delete(`/api/blogs/${this.selectedPost._id}`);

        this.snackbarText = "Deleted successfully";
        this.snackbar = true;

        this.fetchPosts();
      } catch (err) {
        console.error(err);
      } finally {
        this.deleting = false;
        this.deleteDialog = false;
      }
    },

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString();
    },
  },
};
</script>
