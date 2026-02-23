<template>
  <v-app>
    <v-container>
      <v-card max-width="400" class="mx-auto pa-5">
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="email"
            label="Email"
            :rules="[
              (v) => !!v || 'E-mail is required',
              (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
            ]"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            :rules="[(v) => !!v || 'Password is required']"
            type="password"
            required
          ></v-text-field>

          <v-btn color="primary" depressed block @click="submit">Login</v-btn>
        </v-form>
        <div class="my-5 text-center">
          Don't have an account ? <a href="/signup">Signup</a>
        </div>
      </v-card>
    </v-container>
  </v-app>
</template>

<script>
import { setAuthToken } from "@/service/axios"; // Import the named Axios instance
import axios from "axios";

export default {
  data() {
    return {
      valid: false,
      email: "",
      password: "",
    };
  },
  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        try {
          const response = await axios.post(
            "http://localhost:3000/api/clients/login",
            {
              email: this.email,
              password: this.password,
            },
          );

          // Assuming the token is in response.data.token
          const token = response.data.token;
          setAuthToken(token); // Set the token in the Axios instance

          alert("Login successful!");
          console.log("Response:", response.data);

          // Handle post-login actions here
          // For example, save the token in local storage if needed
          localStorage.setItem("user-token", token);

          // Redirect to a protected route or dashboard
          this.$router.push("/dashboard"); // Adjust the route as needed
        } catch (error) {
          console.error("Error during login:", error);
          alert("Login failed. Please check your credentials and try again.");
        }
      }
    },
  },
};
</script>

<style scoped>
.v-container {
  max-width: 400px;
  margin: 0 auto;
}
</style>
