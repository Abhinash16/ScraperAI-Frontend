// Which help topic (featureGuides.js id) belongs to the page on screen.
// Pages declare it with <ThingsToKnow feature="..." />; the shell shows an
// "About this page" button for the newest one and opens it in a side panel.
import Vue from "vue";

let nextId = 0;
export const pageHelp = Vue.observable({ stack: [] });

export function registerHelp(feature) {
  const id = ++nextId;
  pageHelp.stack.push({ id, feature });
  return id;
}

export function updateHelp(id, feature) {
  const entry = pageHelp.stack.find((e) => e.id === id);
  if (entry) entry.feature = feature;
}

export function unregisterHelp(id) {
  pageHelp.stack = pageHelp.stack.filter((e) => e.id !== id);
}

export const currentHelp = () => {
  const list = pageHelp.stack.filter((e) => e.feature);
  return list.length ? list[list.length - 1].feature : null;
};

// Topics the viewer has opened (per browser), to stop drawing the "new" dot
const SEEN_KEY = "help-seen";

export function readSeen() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY)) || {};
  } catch {
    return {};
  }
}

export function markSeen(feature) {
  try {
    const seen = readSeen();
    seen[feature] = true;
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  } catch {
    // storage unavailable: the dot comes back after a reload
  }
}
