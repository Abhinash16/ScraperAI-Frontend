<template>
  <div>
    <!-- ================= HEADER ================= -->
    <v-card outlined rounded="lg" class="d-flex align-center flex-wrap pa-4 mb-4">
      <v-avatar size="56" color="primary" class="mr-4 flex-shrink-0">
        <span class="white--text text-h6 font-weight-bold">{{ initials }}</span>
      </v-avatar>
      <div class="flex-grow-1 overflow-hidden mr-4">
        <v-skeleton-loader v-if="loading && !account" type="heading" width="240" />
        <template v-else>
          <h1 class="text-h6 font-weight-bold grey--text text--darken-4 text-truncate">
            {{ user.name || "Your profile" }}
          </h1>
          <div class="d-flex flex-wrap align-center text-body-2 grey--text text--darken-1">
            <span class="d-inline-flex align-center mr-3">
              <v-icon size="14" class="mr-1">$message-square</v-icon>
              {{ user.email }}
            </span>
            <span v-if="account && account.company_name" class="d-inline-flex align-center">
              <v-icon size="14" class="mr-1">$building-2</v-icon>
              {{ account.company_name }}
            </span>
          </div>
        </template>
      </div>
      <v-chip
        v-if="roleName"
        small
        label
        color="green lighten-5"
        text-color="green darken-2"
        class="font-weight-bold my-1"
      >
        <v-icon left size="14">$shield-user</v-icon>
        {{ roleName }}
      </v-chip>
    </v-card>

    <v-row>
      <!-- ================= SECTION NAV ================= -->
      <v-col cols="12" md="3">
        <v-card outlined rounded="lg" class="pa-2 profile-nav">
          <v-list dense nav class="py-0">
            <v-list-item
              v-for="item in sections"
              :key="item.id"
              :class="section === item.id ? 'green lighten-5' : ''"
              class="rounded-lg mb-1"
              @click="setSection(item.id)"
            >
              <v-icon
                size="18"
                class="mr-3 flex-grow-0"
                :color="section === item.id ? 'green darken-1' : 'grey darken-1'"
              >
                {{ item.icon }}
              </v-icon>
              <v-list-item-content>
                <v-list-item-title
                  :class="
                    section === item.id
                      ? 'green--text text--darken-2 font-weight-bold'
                      : 'grey--text text--darken-3 font-weight-medium'
                  "
                >
                  {{ item.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- ================= CONTENT ================= -->
      <v-col cols="12" md="9">
        <div class="profile-content">
          <v-alert v-if="loadError" type="error" text rounded="lg" class="text-body-2">
            <div class="d-flex align-center flex-wrap">
              <span class="mr-4">{{ loadError }}</span>
              <v-spacer />
              <v-btn small outlined color="error" @click="load">
                <v-icon left size="14">$refresh-cw</v-icon>
                Retry
              </v-btn>
            </div>
          </v-alert>

          <v-card v-else-if="!account" outlined rounded="lg" class="pa-4">
            <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
          </v-card>

          <!-- ================= YOUR ACCOUNT ================= -->
          <v-card v-else-if="section === 'account'" outlined rounded="lg">
            <div class="d-flex align-center px-5 py-4">
              <v-avatar size="40" tile color="primary lighten-5" class="rounded-lg mr-3 flex-shrink-0">
                <v-icon size="20" color="primary">$user</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Your login</div>
                <div class="text-caption grey--text text--darken-1">
                  The user you're signed in as. Ask an admin to change these details or your role.
                </div>
              </div>
            </div>
            <v-divider />
            <v-row no-gutters>
              <v-col v-for="field in accountFields" :key="field.label" cols="12" sm="6">
                <div class="px-5 py-3">
                  <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">
                    {{ field.label }}
                  </div>
                  <div class="text-body-1 grey--text text--darken-4 text-break">
                    <v-chip v-if="field.chip" x-small label outlined :color="field.chip" class="font-weight-bold">
                      {{ field.value }}
                    </v-chip>
                    <template v-else>{{ field.value || "—" }}</template>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <!-- ================= COMPANY ================= -->
          <v-form v-else-if="section === 'company'" ref="companyForm" @submit.prevent="saveCompany">
            <v-card outlined rounded="lg" class="mb-4">
              <div class="d-flex align-center px-5 py-4">
                <v-avatar size="40" tile color="indigo lighten-5" class="rounded-lg mr-3 flex-shrink-0">
                  <v-icon size="20" color="indigo">$building-2</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Company details</div>
                  <div class="text-caption grey--text text--darken-1">
                    Shared by everyone in your company account.
                  </div>
                </div>
              </div>
              <v-divider />
              <v-row dense class="pa-5">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.trim="company.company_name"
                    label="Company name"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.trim="company.name"
                    label="Account owner name"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    :value="account.email"
                    label="Account email"
                    outlined
                    dense
                    disabled
                    persistent-hint
                    hint="Contact support to change"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    :value="account.phone"
                    label="Account phone"
                    outlined
                    dense
                    disabled
                    persistent-hint
                    hint="Contact support to change"
                  />
                </v-col>
              </v-row>
            </v-card>

            <v-card outlined rounded="lg">
              <div class="d-flex align-center px-5 py-4">
                <v-avatar size="40" tile color="green lighten-5" class="rounded-lg mr-3 flex-shrink-0">
                  <v-icon size="20" color="green darken-1">$globe</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
                    Website and policies
                  </div>
                  <div class="text-caption grey--text text--darken-1">
                    Links the assistant can share with customers.
                  </div>
                </div>
              </div>
              <v-divider />
              <v-row dense class="pa-5">
                <v-col v-for="link in linkFields" :key="link.key" cols="12">
                  <v-text-field
                    v-model.trim="company[link.key]"
                    :label="link.label"
                    :placeholder="link.placeholder"
                    :rules="[urlRule]"
                    outlined
                    dense
                  />
                </v-col>
              </v-row>
              <v-divider />
              <div class="d-flex align-center px-5 py-3">
                <span v-if="companyDirty" class="text-caption amber--text text--darken-3 font-weight-bold">
                  Unsaved changes
                </span>
                <v-spacer />
                <v-btn v-if="companyDirty" text class="mr-2" :disabled="saving" @click="resetCompany">
                  Discard
                </v-btn>
                <v-btn color="primary" depressed type="submit" :loading="saving" :disabled="!companyDirty">
                  <v-icon left size="16">$check</v-icon>
                  Save changes
                </v-btn>
              </div>
            </v-card>
          </v-form>

          <!-- ================= SECURITY ================= -->
          <template v-else-if="section === 'security'">
            <v-card outlined rounded="lg" class="mb-4">
              <div class="d-flex align-center flex-wrap px-5 py-4">
                <v-avatar size="40" tile color="primary lighten-5" class="rounded-lg mr-3 flex-shrink-0">
                  <v-icon size="20" color="primary">$key-round</v-icon>
                </v-avatar>
                <div class="flex-grow-1 mr-4 my-1">
                  <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Password</div>
                  <div class="text-caption grey--text text--darken-1">
                    <template v-if="canResetPassword">Change the password you sign in with.</template>
                    <template v-else>Ask an admin to reset your password.</template>
                  </div>
                </div>
                <v-btn v-if="canResetPassword" outlined color="primary" class="my-1" @click="resetDialog = true">
                  <v-icon left size="16">$rotate-ccw-key</v-icon>
                  Change password
                </v-btn>
              </div>
            </v-card>

            <v-card outlined rounded="lg" class="mb-4">
              <div class="d-flex align-center px-5 py-4">
                <v-avatar size="40" tile color="grey lighten-4" class="rounded-lg mr-3 flex-shrink-0">
                  <v-icon size="20" color="grey">$shield-check</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="d-flex align-center">
                    <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">
                      Two-factor authentication
                    </span>
                    <v-chip x-small label color="grey lighten-4" class="font-weight-bold">Coming soon</v-chip>
                  </div>
                  <div class="text-caption grey--text text--darken-1">Add a second step when signing in.</div>
                </div>
              </div>
            </v-card>

            <IpAllowlist
              v-if="hasPermission('ip:read') || hasPermission('ip:manage')"
              :can-manage="hasPermission('ip:manage')"
              class="mb-4"
            />

            <v-card outlined rounded="lg">
              <div class="d-flex align-center flex-wrap px-5 py-4">
                <v-avatar size="40" tile color="red lighten-5" class="rounded-lg mr-3 flex-shrink-0">
                  <v-icon size="20" color="error">$log-out</v-icon>
                </v-avatar>
                <div class="flex-grow-1 mr-4 my-1">
                  <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Sign out</div>
                  <div class="text-caption grey--text text--darken-1">
                    Sign out of the dashboard on this browser.
                  </div>
                </div>
                <v-btn color="error" outlined class="my-1" @click="logout">
                  <v-icon left size="16">$log-out</v-icon>
                  Sign out
                </v-btn>
              </div>
            </v-card>
          </template>
        </div>
      </v-col>
    </v-row>

    <ResetPasswordDialog
      v-if="user._id"
      v-model="resetDialog"
      :userId="user._id"
      title="Change Password"
      @success="$toast.success('Password updated')"
    />
  </div>
</template>

<script>
import apiClient, { setAuthToken } from "@/service/axios";
import ResetPasswordDialog from "@/components/ResetPasswordDialog.vue";
import IpAllowlist from "@/components/profile/IpAllowlist.vue";

const SECTIONS = [
  { id: "account", name: "Your account", icon: "$user" },
  { id: "company", name: "Company", icon: "$building-2" },
  { id: "security", name: "Security", icon: "$shield-check" },
];

// Old links used ?tab=0..3
const LEGACY_TABS = ["account", "company", "security"];

const COMPANY_FIELDS = [
  "name",
  "company_name",
  "company_website",
  "company_termsandconditions_url",
  "company_privacypolicy_url",
  "company_aboutus_url",
];

export default {
  components: { ResetPasswordDialog, IpAllowlist },

  data() {
    return {
      sections: SECTIONS,
      linkFields: [
        {
          key: "company_website",
          label: "Website",
          placeholder: "https://example.com",
          icon: "$globe",
        },
        {
          key: "company_aboutus_url",
          label: "About us page",
          placeholder: "https://example.com/about",
          icon: "$info",
        },
        {
          key: "company_termsandconditions_url",
          label: "Terms and conditions",
          placeholder: "https://example.com/terms",
          icon: "$file-text",
        },
        {
          key: "company_privacypolicy_url",
          label: "Privacy policy",
          placeholder: "https://example.com/privacy",
          icon: "$shield",
        },
      ],

      account: null,
      company: {},
      savedCompany: {},
      loading: false,
      loadError: "",
      saving: false,
      resetDialog: false,
    };
  },

  computed: {
    section() {
      const { section, tab } = this.$route.query;
      if (SECTIONS.some((s) => s.id === section)) return section;
      return LEGACY_TABS[parseInt(tab, 10)] || "account";
    },

    user() {
      return this.account?.user || {};
    },

    role() {
      return this.account?.role || this.user.roleId || null;
    },

    roleName() {
      return this.role?.name || "";
    },

    permissions() {
      return this.role?.permissions || [];
    },

    canResetPassword() {
      return this.hasPermission("user:reset-password");
    },

    initials() {
      const name = (this.user.name || this.user.email || "").trim();
      const parts = name.split(/[\s@.]+/).filter(Boolean);
      return (
        parts
          .slice(0, 2)
          .map((p) => p[0].toUpperCase())
          .join("") || "?"
      );
    },

    accountFields() {
      const active = this.user.status === 1;
      return [
        { label: "Name", value: this.user.name },
        { label: "Email", value: this.user.email },
        { label: "Phone", value: this.user.phone },
        { label: "Role", value: this.roleName },
        {
          label: "Status",
          value: active ? "Active" : "Inactive",
          chip: active ? "success" : "grey",
        },
        {
          label: "Member since",
          value: this.user.createdAt
            ? this.$moment(this.user.createdAt).format("D MMM YYYY")
            : "",
        },
      ];
    },

    companyDirty() {
      return COMPANY_FIELDS.some(
        (f) => (this.company[f] || "") !== (this.savedCompany[f] || ""),
      );
    },
  },

  mounted() {
    this.load();
  },

  methods: {
    hasPermission(perm) {
      return this.permissions.includes("*") || this.permissions.includes(perm);
    },

    setSection(id) {
      if (id === this.section) return;
      this.$router.replace({ query: { section: id } }).catch(() => {});
    },

    urlRule(v) {
      if (!v) return true;
      return /^https?:\/\/\S+\.\S+$/i.test(v) || "Enter a full URL starting with https://";
    },

    applyCompany(source) {
      const values = {};
      COMPANY_FIELDS.forEach((f) => {
        values[f] = source?.[f] || "";
      });
      this.savedCompany = values;
      this.company = { ...values };
    },

    resetCompany() {
      this.company = { ...this.savedCompany };
      this.$refs.companyForm?.resetValidation();
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get("/clients/currentUser");
        this.account = data.data;
        this.applyCompany(this.account);
      } catch (err) {
        this.loadError =
          err.response?.data?.message || "Failed to load your profile";
      } finally {
        this.loading = false;
      }
    },

    async saveCompany() {
      if (!this.$refs.companyForm.validate()) return;
      this.saving = true;
      try {
        await apiClient.put("/clients/currentUser/update", { ...this.company });
        this.savedCompany = { ...this.company };
        this.account = { ...this.account, ...this.company };
        this.$toast.success("Company details saved");
      } catch (err) {
        this.$toast.error(
          err.response?.data?.message || "Failed to save company details",
        );
      } finally {
        this.saving = false;
      }
    },

    logout() {
      localStorage.removeItem("user-token");
      setAuthToken(null);
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.profile-nav {
  position: sticky;
  top: 88px;
}

.profile-content {
  max-width: 900px;
}
</style>
