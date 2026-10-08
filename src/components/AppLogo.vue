<template>
  <v-img
    :src="src"
    :width="size"
    :height="size"
    :max-width="size"
    contain
    :alt="alt"
    class="flex-grow-0 flex-shrink-0"
  />
</template>

<script>
// The scraperAI logo from public/: the indigo tile cropped to its edges with
// transparent rounded corners (public/logo.png is the 512px master), so it
// fills its size and sits cleanly on light or dark backgrounds. Don't wrap it
// in a coloured avatar.
export default {
  name: "AppLogo",

  props: {
    size: { type: [Number, String], default: 36 },
    alt: { type: String, default: "scraperAI" },
  },

  computed: {
    src() {
      return `${process.env.BASE_URL}logo-192.png`;
    },
  },
};
</script>
