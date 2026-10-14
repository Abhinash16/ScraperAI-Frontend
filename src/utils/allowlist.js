// Entry rules for allowlists (components/AllowListInput.vue). They mirror the
// backend's checks, which stay the final word.

// Normalises what people paste ("https://www.Example.com/path") to a hostname.
function normaliseHostname(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/[/?#:].*$/, "");
}

export const RULES = {
  // A hostname, optionally prefixed with "*." for all its subdomains
  domain: {
    icon: "$globe",
    placeholder: "example.com or *.example.com",
    invalid: "Enter a domain like example.com or *.example.com",
    pattern: /^(\*\.)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/,
    normalise: normaliseHostname,
  },
  // An iOS bundle ID or Android package name
  app: {
    icon: "$smartphone",
    placeholder: "com.example.app",
    invalid: "Enter a bundle ID or package name like com.example.app",
    pattern: /^(?=.{1,150}$)[a-z][a-z0-9_]*(\.[a-z0-9_-]+)+$/,
    normalise: (input) => String(input || "").trim().toLowerCase(),
  },
};
