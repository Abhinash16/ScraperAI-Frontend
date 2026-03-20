/**
 * Blog API Service
 * Handles all communication with the blog backend endpoints
 */

const API_BASE = process.env.VUE_APP_API_URL || "/api";

export default {
  // List all blogs
  async listBlogs() {
    const response = await fetch(`${API_BASE}/blogs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch blogs");
    return response.json();
  },

  // Get single blog
  async getBlog(blogId) {
    const response = await fetch(`${API_BASE}/blogs/${blogId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Blog not found");
    return response.json();
  },

  // Create new blog
  async createBlog(data) {
    const response = await fetch(`${API_BASE}/blogs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create blog");
    return response.json();
  },

  // Update blog
  async updateBlog(blogId, data) {
    const response = await fetch(`${API_BASE}/blogs/${blogId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update blog");
    return response.json();
  },

  // Preview blog
  async previewBlog(blogId) {
    const response = await fetch(`${API_BASE}/blogs/preview/${blogId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
    });
    if (!response.ok) throw new Error("Failed to preview blog");
    return response.text();
  },

  // Publish blog
  async publishBlog(blogId, publishMode = "internal") {
    const response = await fetch(`${API_BASE}/blogs/publish/${blogId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publishMode }),
    });
    if (!response.ok) throw new Error("Failed to publish blog");
    return response.json();
  },

  // Republish blog
  async republishBlog(blogId) {
    const response = await fetch(`${API_BASE}/blogs/republish/${blogId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to republish blog");
    return response.json();
  },

  // Get templates
  async getTemplates() {
    const response = await fetch(`${API_BASE}/blogs/templates/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch templates");
    return response.json();
  },

  // Helper: Get token from storage
  getToken() {
    return localStorage.getItem("authToken") || "";
  },
};
