import axios from "axios";

// Create an Axios instance with a dynamic base URL
const apiClient = axios.create({
  // baseURL: process.env.VUE_APP_API_BASE_URL, // Set from environment variable
  baseURL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000/api"
      : "http://localhost:3000/api",
});

// Function to set the Authorization token
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

// Initialize token from localStorage if present
const token = localStorage.getItem("user-token");
if (token) {
  setAuthToken(token);
}

// Axios interceptor to handle token expiry and other 401 errors
apiClient.interceptors.response.use(
  (response) => {
    // If the response is successful, just return the response
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response && error.response.status === 401) {
      if (error.response.data.message === "Token has expired") {
        // Token has expired - handle it here
        alert("Your session has expired. Please log in again.");

        // Optionally, clear the token from localStorage and reset the auth header
        localStorage.removeItem("user-token");
        setAuthToken(null);

        // Redirect to login page or take any other action
        window.location.href = "/login";
      } else {
        // Handle other 401 errors
        alert("Unauthorized access. Please log in again.");
        localStorage.removeItem("user-token");
        setAuthToken(null);
        window.location.href = "/login";
      }
    }

    // Reject the promise to propagate the error
    return Promise.reject(error);
  },
);
export default apiClient; // Export the instance with a meaningful name
