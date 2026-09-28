// Helpers for the Team (members and roles) screens.

export const FULL_ACCESS = "*";

export function initialsOf(name, email) {
  const source = (name || email || "").trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "?"
  );
}

export function isOwnerRole(role) {
  return !!role && (role.permissions || []).includes(FULL_ACCESS);
}

// True when every permission in `target` is also held by `mine`
// (the server's "at or below your level" rule).
export function withinLevel(targetPermissions, myPermissions) {
  if ((myPermissions || []).includes(FULL_ACCESS)) return true;
  return (targetPermissions || []).every((p) => (myPermissions || []).includes(p));
}

const ROLE_COLORS = ["indigo", "teal", "deep-purple", "blue", "pink darken-1", "cyan darken-2", "orange darken-2", "green darken-1"];

// Stable colour per role name; owners are always amber.
export function roleColor(role) {
  if (!role) return "grey";
  if (isOwnerRole(role)) return "amber darken-2";
  const name = String(role.name || "");
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ROLE_COLORS[hash % ROLE_COLORS.length];
}

export function permissionSummary(role) {
  if (!role) return "";
  if (isOwnerRole(role)) return "Full access";
  const n = (role.permissions || []).length;
  return `${n} permission${n === 1 ? "" : "s"}`;
}

// 16 chars from an unambiguous alphabet, with at least one of each class.
export function generatePassword(length = 16) {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "!@#$%&*?"];
  const all = sets.join("");
  const random = (max) => {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    return buf[0] % max;
  };
  const chars = sets.map((s) => s[random(s.length)]);
  while (chars.length < length) chars.push(all[random(all.length)]);
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

// { score 0–4, label, color } for a password strength hint.
export function passwordStrength(password) {
  const p = password || "";
  if (!p) return { score: 0, label: "", color: "grey" };
  let score = 0;
  if (p.length >= 8) score += 1;
  if (p.length >= 12) score += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score += 1;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score += 1;
  if (p.length < 8) score = Math.min(score, 1);
  return [
    { score: 0, label: "Too short", color: "error" },
    { score: 1, label: "Weak", color: "error" },
    { score: 2, label: "Fair", color: "warning" },
    { score: 3, label: "Good", color: "light-green darken-1" },
    { score: 4, label: "Strong", color: "success" },
  ][score];
}

export function apiError(err, fallback) {
  return err?.response?.data?.message || fallback;
}
