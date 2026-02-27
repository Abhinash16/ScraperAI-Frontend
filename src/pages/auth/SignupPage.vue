<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" md="7" lg="7">
        <v-card rounded="xl" outlined>
          <v-row no-gutters>
            <!-- LEFT SIDE -->
            <v-col
              cols="12"
              md="5"
              class="pa-8 grey lighten-4"
              style="
                border-top-left-radius: 15px;
                border-bottom-left-radius: 15px;
              "
            >
              <v-avatar
                size="140"
                color="primary"
                tile
                class="mr-2 mb-4 rounded-lg"
              >
                <v-img
                  src="../../assets/13.png"
                  max-height="140"
                  max-width="140"
                  class="mx-auto"
                ></v-img>
              </v-avatar>

              <div class="mb-10">
                <v-chip
                  color="primary lighten-4"
                  text-color="primary"
                  small
                  class="font-weight-bold mb-4"
                >
                  TRUSTED BY 500+ TEAMS
                </v-chip>
                <h2
                  class="text-h4 font-weight-black secondary--text line-height-1 mb-4"
                >
                  Turn your website into a
                  <span class="primary--text">Brain.</span>
                </h2>
                <p class="body-1 grey--text text--darken-1">
                  scraperAI uses your existing content to power a custom GPT
                  tailored to your customers' needs.
                </p>
              </div>

              <v-list color="transparent" dense>
                <v-list-item class="px-0">
                  <v-list-item-icon class="mr-3"
                    ><v-icon color="success"
                      >mdi-check-circle</v-icon
                    ></v-list-item-icon
                  >
                  <v-list-item-content class="body-2 font-weight-medium"
                    >Zero-code installation</v-list-item-content
                  >
                </v-list-item>
                <v-list-item class="px-0">
                  <v-list-item-icon class="mr-3"
                    ><v-icon color="success"
                      >mdi-check-circle</v-icon
                    ></v-list-item-icon
                  >
                  <v-list-item-content class="body-2 font-weight-medium"
                    >Real-time sitemap syncing</v-list-item-content
                  >
                </v-list-item>
              </v-list>
            </v-col>

            <!-- RIGHT SIDE -->
            <v-col cols="12" md="7" class="pa-8">
              <div class="d-flex justify-space-between align-center mb-8">
                <h3 class="text-h5 font-weight-bold">Sign Up</h3>
                <v-btn
                  text
                  color="primary"
                  class="text-capitalize font-weight-bold"
                  href="/login"
                >
                  Log In instead
                </v-btn>
              </div>

              <v-form ref="form" v-model="valid" lazy-validation>
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="name"
                      label="Full Name"
                      outlined
                      flat
                      dense
                      class="rounded-lg"
                      :rules="[(v) => !!v || 'Required']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="company"
                      label="Company"
                      outlined
                      flat
                      dense
                      class="rounded-lg"
                      :rules="[(v) => !!v || 'Required']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="email"
                      label="Email Address"
                      outlined
                      flat
                      dense
                      class="rounded-lg"
                      :rules="[(v) => /.+@.+\..+/.test(v) || 'Invalid Email']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="password"
                      label="Create Password"
                      type="password"
                      outlined
                      flat
                      dense
                      class="rounded-lg"
                      :rules="[(v) => !!v || 'Required']"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="4" sm="3">
                    <v-select
                      v-model="countryCode"
                      :items="countryCodes"
                      outlined
                      flat
                      dense
                      hide-details
                      class="rounded-lg"
                    ></v-select>
                  </v-col>
                 <v-col cols="8" sm="9">
  <v-text-field
    v-model="phone"
    label="Phone"
    outlined
    flat
    dense
    class="rounded-lg"
    type="tel"
    maxlength="10"
    :rules="phoneRules"
    @input="phone = phone.replace(/\D/g, '')"
  />
</v-col>
                </v-row>

                <v-btn
                  block
                  x-large
                  depressed
                  :loading="loading"
                  color="primary"
                  class="mt-6 rounded-lg font-weight-bold text-capitalize"
                  @click="submit"
                >
                  Create Free Account
                  <v-icon right size="18">mdi-sparkles</v-icon>
                </v-btn>

                <p
                  class="text-center mt-6 caption grey--text font-weight-medium"
                >
                  By signing up, you agree to our
                  <a href="#" class="text-decoration-none primary--text"
                    >Privacy Policy</a
                  >
                </p>
              </v-form>
            </v-col>
          </v-row>
        </v-card>
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
import axios from "axios";

export default {
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
      v => !!v || 'Phone number is required',
      v => /^\d{10}$/.test(v) || 'Phone number must be exactly 10 digits',
    ],
      countryCode: "+91",

      countryCodes: ["+91", "+1", "+44", "+61", "+81", "+86", "+49", "+33"],

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
        await axios.post("http://localhost:3000/api/clients/signup", {
          name: this.name,
          company: this.company,
          email: this.email,
          password: this.password,
          phone: `${this.countryCode}${this.phone}`,
        });

        this.snackbarText = "Signuup successful! Please log in.";
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
