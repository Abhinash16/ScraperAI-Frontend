<template>
  <v-container fluid fill-height>
    <v-row justify="center">
      <v-col cols="12" md="4">
        <div class="text-center mb-8">
          <v-avatar size="60" color="primary" tile class="mr-2 mb-0 rounded-lg">
            <v-img
              src="../../assets/13.png"
              max-height="60"
              max-width="60"
              class="mx-auto"
            ></v-img>
          </v-avatar>

          <h1 class="text-h4 font-weight-black secondary--text">
            Welcome Back
          </h1>
          <p class="grey--text text--darken-1 font-weight-medium">
            Enter your details to access your dashboard
          </p>
        </div>

        <v-card class="pa-6" rounded="xl" outlined>
          <h3 class="text-h5 font-weight-bold mb-6">Login</h3>

          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="email"
              label="Email Address"
              outlined
              dense
              color="primary"
              :rules="[
                (v) => !!v || 'E-mail is required',
                (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
              ]"
            />

            <v-text-field
              v-model="password"
              label="Password"
              outlined
              dense
              type="password"
              color="primary"
              :rules="[(v) => !!v || 'Password is required']"
            />

            <div class="d-flex justify-end">
              <p class="caption grey--text font-weight-medium">
                <a href="#" class="text-decoration-none primary--text">
                  Forgot Password?
                </a>
              </p>
            </div>

            <!-- BUTTON WITH LOADING -->
            <v-btn
              color="primary"
              block
              x-large
              depressed
              class="font-weight-bold text-capitalize"
              :loading="loading"
              :disabled="loading"
              @click="submit"
            >
              Sign In
            </v-btn>
          </v-form>
        </v-card>

        <div class="text-center mt-8">
          <span class="grey--text font-weight-medium">
            Don't have an account?
          </span>
          <v-btn
            text
            color="primary"
            class="font-weight-bold text-capitalize px-1"
            href="/signup"
          >
            Sign Up
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- SNACKBAR -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      top
      right
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { setAuthToken } from "@/service/axios";
import axios from "axios";

export default {
  data() {
    return {
      valid: false,
      email: "",
      password: "",
      loading: false,

      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
    };
  },

  methods: {
    async submit() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;

      try {
        const response = await axios.post(
          "http://localhost:3000/api/clients/login",
          {
            email: this.email,
            password: this.password,
          },
        );

        const token = response.data.token;

        setAuthToken(token);
        localStorage.setItem("user-token", token);

        this.snackbarText = "Login successfully!";
        this.snackbarColor = "success";
        this.snackbar = true;

        // Small delay for better UX
        setTimeout(() => {
          this.$router.push("/dashboard");
        }, 700);
      } catch (error) {
        this.snackbarText =
          error.response?.data?.message ||
          "Invalid credentials. Please try again.";
        this.snackbarColor = "error";
        this.snackbar = true;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
