// Notices: temporary facts the bot knows on every reply (closures, special
// hours, maintenance, announcements, promotions). Dates are entered and shown
// in IST, the business timezone.
import apiClient from "@/service/axios";

export const NOTICES_API = "/notices";
export const TZ = "Asia/Kolkata";
const OFFSET = "+05:30";

export const NOTICE_TYPES = {
  closed: { label: "Closed", color: "error" },
  special_hours: { label: "Special hours", color: "amber darken-3" },
  maintenance: { label: "Maintenance", color: "amber darken-3" },
  announcement: { label: "Announcement", color: "grey darken-1" },
  promotion: { label: "Promotion", color: "success" },
};
export const noticeType = (t) => NOTICE_TYPES[t] || { label: t, color: "grey" };

// Types that can show a banner on the website chat
export const BANNER_TYPES = ["closed", "maintenance"];

export async function fetchNotices(when = "current") {
  const { data } = await apiClient.get(NOTICES_API, { params: { when } });
  return Array.isArray(data.data) ? data.data : [];
}

// { date: "2026-10-20", time: "00:00" } in IST
function istParts(value) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(value))
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

// "2026-10-20" + n days
export function addDays(date, n) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const istIso = (date, time = "00:00") => `${date}T${time}:00${OFFSET}`;

// Both ends at midnight IST: a run of whole days
export const isWholeDays = (n) =>
  istParts(n.startsAt).time === "00:00" && istParts(n.endsAt).time === "00:00";

const dayLabel = (date, opts) =>
  new Date(`${date}T12:00:00${OFFSET}`).toLocaleDateString(undefined, { timeZone: TZ, ...opts });

// "Mon 20 – Wed 22 Oct", "Mon 20 Oct", or "20 Oct, 10:00 – 22 Oct, 14:00"
export function formatNoticeDates(n) {
  if (isWholeDays(n)) {
    const first = istParts(n.startsAt).date;
    const last = addDays(istParts(n.endsAt).date, -1);
    const full = { weekday: "short", day: "numeric", month: "short" };
    if (first === last) return dayLabel(first, full);
    const sameMonth = first.slice(0, 7) === last.slice(0, 7);
    const start = dayLabel(first, sameMonth ? { weekday: "short", day: "numeric" } : full);
    return `${start} – ${dayLabel(last, full)}`;
  }
  const fmt = (v) => {
    const p = istParts(v);
    return `${dayLabel(p.date, { day: "numeric", month: "short" })}, ${p.time}`;
  };
  return `${fmt(n.startsAt)} – ${fmt(n.endsAt)}`;
}

// "Active now", "Starts today", "Starts tomorrow", "Starts in 3 days", "Ended"
export function noticeTiming(n, now = Date.now()) {
  const start = new Date(n.startsAt).getTime();
  const end = new Date(n.endsAt).getTime();
  if (now >= end) return { label: "Ended", active: false };
  if (now >= start) return { label: "Active now", active: true };
  const days = Math.round(
    (new Date(`${istParts(start).date}T00:00:00Z`) - new Date(`${istParts(now).date}T00:00:00Z`)) / 86400000,
  );
  const label = days <= 0 ? "Starts today" : days === 1 ? "Starts tomorrow" : `Starts in ${days} days`;
  return { label, active: false };
}

export const whereLabel = (n) => (n.locations && n.locations.length ? n.locations.join(", ") : "Everywhere");

// Notice -> dialog form, and back
export function noticeToForm(n) {
  const today = istParts(Date.now()).date;
  if (!n) {
    return {
      type: "closed",
      title: "",
      text: "",
      wholeDays: true,
      startDate: today,
      endDate: today,
      startTime: "09:00",
      endTime: "18:00",
      locations: [],
      open: "10:00",
      close: "14:00",
      showInWidget: true,
    };
  }
  const whole = isWholeDays(n);
  const s = istParts(n.startsAt);
  const e = istParts(n.endsAt);
  return {
    type: n.type,
    title: n.title || "",
    text: n.text || "",
    wholeDays: whole,
    startDate: s.date,
    endDate: whole ? addDays(e.date, -1) : e.date,
    startTime: s.time,
    endTime: e.time,
    locations: [...(n.locations || [])],
    open: n.hours?.open || "10:00",
    close: n.hours?.close || "14:00",
    showInWidget: !!n.showInWidget,
  };
}

// Returns { body } or { error }
export function formToNotice(f) {
  if (!f.title.trim()) return { error: "Enter a title." };
  if (!f.startDate || !f.endDate) return { error: "Pick the dates." };
  const startsAt = f.wholeDays ? istIso(f.startDate) : istIso(f.startDate, f.startTime);
  // Whole days end at midnight after the last day
  const endsAt = f.wholeDays ? istIso(addDays(f.endDate, 1)) : istIso(f.endDate, f.endTime);
  if (new Date(endsAt) <= new Date(startsAt)) return { error: "The end must be after the start." };
  const body = {
    type: f.type,
    title: f.title.trim(),
    text: f.text.trim(),
    startsAt,
    endsAt,
    locations: f.locations.map((l) => String(l).trim()).filter(Boolean),
    showInWidget: BANNER_TYPES.includes(f.type) ? !!f.showInWidget : false,
  };
  if (f.type === "special_hours") body.hours = { open: f.open, close: f.close };
  return { body };
}
