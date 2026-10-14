<template>
  <v-dialog :value="!!secret" max-width="520" persistent>
    <v-card rounded="lg">
      <v-card-text class="pt-6">
        <div class="d-flex align-center mb-4">
          <v-avatar size="44" tile color="amber lighten-4" class="rounded-lg mr-4 flex-shrink-0">
            <v-icon size="22" color="amber darken-4">$key-round</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4">Your secret key</div>
        </div>

        <v-alert text dense color="amber darken-3" rounded="lg" class="text-body-2">
          <span class="grey--text text--darken-3">
            You won't see this key again. Store it on your server, never in a website or app.
          </span>
        </v-alert>

        <v-sheet color="grey darken-4" dark rounded="lg" class="pa-4 mb-3">
          <div class="d-flex align-center mb-2">
            <span class="text-caption font-weight-bold text-uppercase grey--text">Secret key</span>
            <v-spacer />
            <v-btn x-small depressed color="success" @click="copy">
              <v-icon left size="12">{{ copied ? "$check" : "$copy" }}</v-icon>
              {{ copied ? "Copied" : "Copy" }}
            </v-btn>
          </div>
          <code class="secret text-body-2 grey--text text--lighten-3">{{ secret }}</code>
        </v-sheet>

        <v-checkbox v-model="stored" dense hide-details label="I've stored it" class="mt-0" />
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <span v-if="!canClose" class="text-caption grey--text text--darken-1">
          Copy the key or tick "I've stored it" to close.
        </span>
        <v-spacer />
        <v-btn color="primary" depressed :disabled="!canClose" @click="done">Done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// Shows a new secret key once. It can't be closed until the key is copied or
// "I've stored it" is ticked. Emits "close".
export default {
  name: "SecretKeyDialog",

  props: {
    secret: { type: String, default: "" },
  },

  data: () => ({ copied: false, stored: false }),

  computed: {
    canClose() {
      return this.copied || this.stored;
    },
  },

  watch: {
    secret() {
      this.copied = false;
      this.stored = false;
    },
  },

  methods: {
    async copy() {
      try {
        await navigator.clipboard.writeText(this.secret);
        this.copied = true;
        this.$toast.success("Secret key copied");
      } catch (err) {
        this.$toast.error("Couldn't copy. Select the key and copy it yourself.");
      }
    },

    done() {
      if (this.canClose) this.$emit("close");
    },
  },
};
</script>

<style scoped>
.secret {
  display: block;
  background: transparent;
  padding: 0;
  word-break: break-all;
  user-select: all;
}
</style>
