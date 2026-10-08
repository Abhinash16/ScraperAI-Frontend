<template>
  <v-sheet min-height="100vh" class="d-flex align-center justify-center px-4 py-10">
    <v-row justify="center" no-gutters class="flex-grow-1">
      <v-col cols="12" sm="10" md="7" lg="5" xl="4">

        <v-card outlined rounded="lg" class="pa-6 pa-sm-8">
          <div class="d-flex align-center mb-6">
            <AppLogo size="48" class="mr-4" />
            <div>
              <h1 class="text-h5 font-weight-bold grey--text text--darken-4">Create your account</h1>
              <div class="text-body-2 grey--text text--darken-1">Set up your AI assistant in a few minutes.</div>
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
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="name"
                  label="Full name"
                  autocomplete="name"
                  autofocus
                  outlined
                  :rules="[(v) => !!v || 'Enter your name']"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="company"
                  label="Company"
                  autocomplete="organization"
                  outlined
                  :rules="[(v) => !!v || 'Enter your company']"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="email"
                  label="Work email"
                  type="email"
                  autocomplete="email"
                  outlined
                  :rules="[(v) => /.+@.+\..+/.test(v) || 'Enter a valid email']"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  hint="We recommend 8 or more characters with letters and numbers."
                  outlined
                  :append-icon="showPassword ? '$eye-off' : '$eye'"
                  :rules="[(v) => !!v || 'Create a password']"
                  @click:append="showPassword = !showPassword"
                />
              </v-col>
              <v-col cols="4" sm="3">
                <v-select
                  v-model="countryCode"
                  :items="countryCodes"
                  label="Code"
                  outlined
                  aria-label="Country code"
                />
              </v-col>
              <v-col cols="8" sm="9">
                <v-text-field
                  v-model="phone"
                  label="Phone"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="tel-national"
                  maxlength="10"
                  outlined
                  :rules="phoneRules"
                  @input="phone = phone.replace(/\D/g, '')"
                />
              </v-col>
            </v-row>

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
              Create account
            </v-btn>

            <div class="text-center text-caption grey--text text--darken-1 mt-4">
              By creating an account, you agree to our
              <a href="#" class="primary--text text-decoration-none" @click.prevent>Privacy Policy</a>.
            </div>
          </v-form>
        </v-card>

        <div class="text-center text-body-2 mt-6">
          <span class="grey--text text--darken-1">Already have an account?</span>
          <router-link to="/login" class="font-weight-bold primary--text text-decoration-none ml-1">
            Sign in
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
import apiClient from "@/service/axios";

export default {

  components: { AppLogo },
  data() {
    return {
      valid: false,
      loading: false,

      name: "",
      company: "",
      email: "",
      password: "",
      phone: "",
      phoneRules: [
        (v) => !!v || "Phone number is required",
        (v) => /^\d{10}$/.test(v) || "Phone number must be exactly 10 digits",
      ],
      countryCode: "+91",

      countryCodes: ["+91", "+1", "+44", "+61", "+81", "+86", "+49", "+33"],

      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",

      showPassword: false,
    };
  },

  methods: {
    async submit() {
      if (!this.$refs.form.validate()) return;

      this.loading = true;

      try {
        await apiClient.post("/clients/signup", {
          name: this.name,
          company: this.company,
          email: this.email,
          password: this.password,
          phone: `${this.countryCode}${this.phone}`,
        });

        this.snackbarText = "Account created. Please sign in.";
        this.snackbarColor = "success";
        this.snackbar = true;
        this.$router.push("/login");

        this.$refs.form.reset();
      } catch (error) {
        this.snackbarText =
          error.response?.data?.message || "Signup failed. Try again.";
        this.snackbarColor = "error";
        this.snackbar = true;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
