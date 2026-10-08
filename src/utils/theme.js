// Light / dark mode for the dashboard.
//
// The viewer picks Light, Dark or System (follows the OS). The choice is a
// per-browser convenience kept in localStorage; storage may be unavailable, so
// every read and write is guarded and the default is System. Public pages
// (landing, sign-in, sign-up) always stay light.
import Vue from "vue";

const KEY = "theme";
export const THEME_PREFS = ["light", "dark", "system"];

const media =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

function readPref() {
  try {
    const value = localStorage.getItem(KEY);
    return THEME_PREFS.includes(value) ? value : "system";
  } catch {
    return "system";
  }
}

export const themeState = Vue.observable({
  pref: readPref(),
  systemDark: !!(media && media.matches),
});

if (media) {
  const onChange = (e) => {
    themeState.systemDark = e.matches;
  };
  if (media.addEventListener) media.addEventListener("change", onChange);
  else if (media.addListener) media.addListener(onChange);
}

export function setThemePref(pref) {
  if (!THEME_PREFS.includes(pref)) return;
  themeState.pref = pref;
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    // storage unavailable: the choice lasts until reload
  }
}

export const prefersDark = () =>
  themeState.pref === "dark" || (themeState.pref === "system" && themeState.systemDark);

// Pages outside the signed-in app keep their light design
const PUBLIC_PATHS = ["/", "/login", "/signup"];
export const isAppPath = (path) => !PUBLIC_PATHS.includes(path || "/");

// Applies the theme to Vuetify, native controls (date pickers, scrollbars)
// and charts created from now on.
export function applyTheme(theme, path) {
  const dark = isAppPath(path) && prefersDark();
  theme.dark = dark;
  if (typeof document !== "undefined") {
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }
  if (typeof window !== "undefined") {
    window.Apex = {
      ...(window.Apex || {}),
      theme: { mode: dark ? "dark" : "light" },
      chart: { ...((window.Apex && window.Apex.chart) || {}), background: "transparent" },
    };
  }
  return dark;
}
