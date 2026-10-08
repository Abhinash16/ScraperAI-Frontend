<template>
  <div>
    <!-- ================= HEADER ================= -->
    <div class="d-flex align-center flex-wrap mb-6">
      <v-avatar size="56" color="primary" class="mr-4">
        <span class="white--text text-h6 font-weight-bold">{{ initials }}</span>
      </v-avatar>
      <div class="flex-grow-1" style="min-width: 0">
        <v-skeleton-loader v-if="loading && !account" type="heading" width="240" />
        <template v-else>
          <div class="text-h5 font-weight-bold text-truncate">
            {{ user.name || "Your profile" }}
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            {{ user.email }}
            <template v-if="account && account.company_name">
              · {{ account.company_name }}
            </template>
          </div>
        </template>
      </div>
      <v-chip v-if="roleName" small outlined color="primary" class="mt-2">
        <v-icon x-small left>$shield-user</v-icon>
        {{ roleName }}
      </v-chip>
    </div>

    <v-row>
      <!-- ================= SECTION NAV ================= -->
      <v-col cols="12" md="3">
        <v-card outlined rounded="lg" class="pa-2 profile-nav">
          <v-list dense nav class="py-0">
            <v-list-item
              v-for="item in sections"
              :key="item.id"
              :class="{ 'nav-active': section === item.id }"
              class="rounded-lg"
              @click="setSection(item.id)"
            >
              <v-list-item-icon class="mr-3">
                <v-icon small :color="section === item.id ? 'primary' : ''">
                  {{ item.icon }}
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">
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
          <v-alert
            v-if="loadError"
            type="error"
            outlined
            rounded="lg"
          >
            {{ loadError }}
            <v-btn small text color="error" class="ml-2" @click="load">
              Retry
            </v-btn>
          </v-alert>

          <v-card v-else-if="!account" outlined rounded="lg" class="pa-6">
            <v-progress-linear indeterminate color="primary" />
          </v-card>

          <!-- ================= YOUR ACCOUNT ================= -->
          <template v-else-if="section === 'account'">
            <v-card outlined rounded="lg" class="pa-6">
              <div class="text-subtitle-1 font-weight-bold">Your login</div>
              <div class="text-body-2 grey--text text--darken-1 mb-6">
                The user you're signed in as. Ask an admin to change these
                details or your role.
              </div>

              <v-row>
                <v-col
                  v-for="field in accountFields"
                  :key="field.label"
                  cols="12"
                  sm="6"
                >
                  <div class="field-label">{{ field.label }}</div>
                  <div class="field-value">
                    <v-chip
                      v-if="field.chip"
                      x-small
                      outlined
                      :color="field.chip"
                    >
                      {{ field.value }}
                    </v-chip>
                    <template v-else>{{ field.value || "—" }}</template>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </template>

          <!-- ================= COMPANY ================= -->
          <template v-else-if="section === 'company'">
            <v-form ref="companyForm" @submit.prevent="saveCompany">
              <v-card outlined rounded="lg" class="pa-6 mb-4">
                <div class="text-subtitle-1 font-weight-bold">
                  Company details
                </div>
                <div class="text-body-2 grey--text text--darken-1 mb-6">
                  Shared by everyone in your company account.
                </div>

                <v-row dense>
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

              <v-card outlined rounded="lg" class="pa-6">
                <div class="text-subtitle-1 font-weight-bold">
                  Website and policies
                </div>
                <div class="text-body-2 grey--text text--darken-1 mb-6">
                  Links the assistant can share with customers.
                </div>

                <v-row dense>
                  <v-col v-for="link in linkFields" :key="link.key" cols="12">
                    <v-text-field
                      v-model.trim="company[link.key]"
                      :label="link.label"
                      :placeholder="link.placeholder"
                      :prepend-inner-icon="link.icon"
                      :rules="[urlRule]"
                      outlined
                      dense
                    />
                  </v-col>
                </v-row>

                <div class="d-flex align-center justify-end mt-2">
                  <span v-if="companyDirty" class="text-caption grey--text mr-3">
                    Unsaved changes
                  </span>
                  <v-btn
                    v-if="companyDirty"
                    text
                    rounded
                    class="mr-2"
                    :disabled="saving"
                    @click="resetCompany"
                  >
                    Discard
                  </v-btn>
                  <v-btn
                    color="primary"
                    rounded
                    depressed
                    type="submit"
                    :loading="saving"
                    :disabled="!companyDirty"
                  >
                    Save changes
                  </v-btn>
                </div>
              </v-card>
            </v-form>
          </template>

          <!-- ================= SECURITY ================= -->
          <template v-else-if="section === 'security'">
            <v-card outlined rounded="lg" class="pa-6 mb-4">
              <div class="d-flex align-center flex-wrap">
                <div class="flex-grow-1 mr-4 mb-2">
                  <div class="text-subtitle-1 font-weight-bold">Password</div>
                  <div class="text-body-2 grey--text text--darken-1">
                    <template v-if="canResetPassword">
                      Change the password you sign in with.
                    </template>
                    <template v-else>
                      Ask an admin to reset your password.
                    </template>
                  </div>
                </div>
                <v-btn
                  v-if="canResetPassword"
                  color="primary"
                  outlined
                  rounded
                  class="mb-2"
                  @click="resetDialog = true"
                >
                  Change password
                </v-btn>
              </div>
            </v-card>

            <v-card outlined rounded="lg" class="pa-6 mb-4">
              <div class="d-flex align-center flex-wrap">
                <div class="flex-grow-1 mr-4 mb-2">
                  <div class="d-flex align-center">
                    <div class="text-subtitle-1 font-weight-bold mr-2">
                      Two-factor authentication
                    </div>
                    <v-chip x-small outlined color="grey">Coming soon</v-chip>
                  </div>
                  <div class="text-body-2 grey--text text--darken-1">
                    Add a second step when signing in.
                  </div>
                </div>
              </div>
            </v-card>

            <IpAllowlist
              v-if="hasPermission('ip:read') || hasPermission('ip:manage')"
              :can-manage="hasPermission('ip:manage')"
              class="mb-4"
            />

            <v-card outlined rounded="lg" class="pa-6">
              <div class="d-flex align-center flex-wrap">
                <div class="flex-grow-1 mr-4 mb-2">
                  <div class="text-subtitle-1 font-weight-bold">Sign out</div>
                  <div class="text-body-2 grey--text text--darken-1">
                    Sign out of the dashboard on this browser.
                  </div>
                </div>
                <v-btn
                  color="error"
                  outlined
                  rounded
                  class="mb-2"
                  @click="logout"
                >
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

.nav-active {
  background: #eff2fb;
}

.nav-active .v-list-item__title {
  color: var(--v-primary-base);
  font-weight: 700 !important;
}

.profile-content {
  max-width: 900px;
}

.field-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 4px;
}

.field-value {
  font-size: 15px;
  word-break: break-word;
}
</style>
