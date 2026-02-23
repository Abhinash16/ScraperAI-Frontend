<template>
  <v-app>
    <v-container>
      <v-card max-width="400" class="mx-auto pa-5">
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="name"
            label="Name"
            :rules="[(v) => !!v || 'Name is required']"
            required
          ></v-text-field>

          <v-text-field
            v-model="company"
            label="Company"
            :rules="[(v) => !!v || 'Company is required']"
            required
          ></v-text-field>

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

          <v-select
            v-model="countryCode"
            :items="countryCodes"
            label="Country Code"
            required
          ></v-select>

          <v-text-field
            v-model="phone"
            label="Phone Number"
            :rules="[(v) => !!v || 'Phone number is required']"
            required
          ></v-text-field>

          <v-btn color="primary" block @click="submit">Sign Up</v-btn>

          <div class="my-5 text-center">
            Already have an account ? <a href="/login">login</a>
          </div>
        </v-form>
      </v-card>
    </v-container>
  </v-app>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      valid: false,
      name: "",
      company: "",
      email: "",
      password: "",
      phone: "",
      countryCode: "+91", // Default to India
      countryCodes: ["+91", "+1", "+44", "+61", "+81", "+86", "+49", "+33"], // Example list
    };
  },
  methods: {
    async submit() {
      if (this.$refs.form.validate()) {
        try {
          const response = await axios.post(
            "http://localhost:3000/api/clients/signup",
            {
              name: this.name,
              company: this.company,
              email: this.email,
              password: this.password,
              phone: `${this.countryCode}${this.phone}`,
            },
          );
          alert("Signup successful!");
          console.log("Response:", response.data);
          // Reset form fields after successful submission
          this.name = "";
          this.company = "";
          this.email = "";
          this.password = "";
          this.phone = "";
          this.countryCode = "+91"; // Reset to default
        } catch (error) {
          console.error("Error during signup:", error);
          alert("An error occurred during signup.");
        }
      }
    },
  },
};
</script>

<style scoped>
.v-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
