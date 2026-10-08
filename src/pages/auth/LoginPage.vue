<template>
  <v-sheet min-height="100vh" class="d-flex align-center justify-center px-4 py-10">
    <v-row justify="center" no-gutters class="flex-grow-1">
      <v-col cols="12" sm="8" md="5" lg="4" xl="3">

        <v-card outlined rounded="lg" class="pa-6 pa-sm-8">
          <div class="d-flex align-center mb-6">
            <AppLogo size="48" class="mr-4" />
            <div>
              <h1 class="text-h5 font-weight-bold grey--text text--darken-4">Welcome back</h1>
              <div class="text-body-2 grey--text text--darken-1">Sign in to manage your chatbot.</div>
            </div>
          </div>

          <v-alert
            v-if="snackbar && snackbarColor === 'error'"
            type="error"
            text
            dense
            rounded="lg"
            class="text-body-2 mb-5"
          >
            {{ snackbarText }}
          </v-alert>

          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="submit">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              autocomplete="email"
              autofocus
              outlined
              :rules="[
                (v) => !!v || 'Enter your email',
                (v) => /.+@.+\..+/.test(v) || 'Enter a valid email',
              ]"
            />

            <v-text-field
              v-model="password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              outlined
              :append-icon="showPassword ? '$eye-off' : '$eye'"
              :rules="[(v) => !!v || 'Enter your password']"
              @click:append="showPassword = !showPassword"
            />

            <v-btn
              type="submit"
              color="primary"
              block
              x-large
              depressed
              class="font-weight-bold mt-1"
              :loading="loading"
              :disabled="loading"
            >
              Sign in
            </v-btn>
          </v-form>
        </v-card>

        <div class="text-center text-body-2 mt-6">
          <span class="grey--text text--darken-1">New to scraperAI?</span>
          <router-link to="/signup" class="font-weight-bold primary--text text-decoration-none ml-1">
            Create an account
          </router-link>
        </div>
      </v-col>
    </v-row>

    <v-snackbar
      :value="snackbar && snackbarColor === 'success'"
      color="success"
      timeout="3000"
      top
      right
      @input="snackbar = $event"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-sheet>
</template>

<script>
import AppLogo from "@/components/AppLogo.vue";
import apiClient, { setAuthToken } from "@/service/axios";

export default {

  components: { AppLogo },
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
        const response = await apiClient.post("/clients/login", {
          email: this.email,
          password: this.password,
        });

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
