// Compact one-line rendering of product fields for tables. Handles spec-v1
// catalog items (prices[], availability{}) as well as flat legacy objects.

const CURRENCY_SYMBOLS = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const IST_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });

function formatAmount(amount, currency) {
  if (amount === null || amount === undefined || amount === "") return "—";
  const num = Number(amount);
  const value = Number.isFinite(num) ? num.toLocaleString("en-IN") : amount;
  const symbol = CURRENCY_SYMBOLS[currency];
  if (symbol) return `${symbol}${value}`;
  return currency ? `${currency} ${value}` : String(value);
}

function isPriceList(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((p) => p && typeof p === "object" && "amount" in p)
  );
}

// The server drops expired offers from what the AI sees, but `products`
// still contains them, so flag them here.
function formatOffer(offer, currency) {
  let text = `offer ${formatAmount(offer.amount, currency)}`;
  const until = offer.valid_until ? new Date(offer.valid_until) : null;
  if (until && !isNaN(until)) {
    // Same rule as the server: valid through the end of its IST calendar day.
    const untilDay = istDay(until);
    const [, month, day] = untilDay.split("-").map(Number);
    const date = `${day} ${MONTHS[month - 1]}`;
    text += untilDay < istDay(new Date()) ? `, expired ${date}` : ` until ${date}`;
  }
  return text;
}

// "YYYY-MM-DD" of a date in IST (Asia/Kolkata); sorts as a string.
function istDay(date) {
  return IST_DAY.format(date);
}

function formatPrices(prices) {
  return prices
    .map((p) => {
      let text = formatAmount(p.amount, p.currency);
      if (p.amount !== null && p.amount !== undefined && p.unit) {
        text += `/${p.unit}`;
      }
      if (p.label) text = `${p.label} ${text}`;
      if (p.offer && p.offer.amount !== undefined) {
        text += ` (${formatOffer(p.offer, p.currency)})`;
      }
      return text;
    })
    .join("; ");
}

function isAvailability(value) {
  return value && typeof value === "object" && !Array.isArray(value) && "status" in value;
}

function formatAvailability(a) {
  const parts = [a.status];
  if (Array.isArray(a.locations) && a.locations.length) {
    parts.push(a.locations.join(", "));
  }
  return parts.filter(Boolean).join(" · ");
}

export function formatProductCell(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (isPriceList(value)) return formatPrices(value);
  if (isAvailability(value)) return formatAvailability(value);
  if (Array.isArray(value)) {
    if (!value.length) return "—";
    return value.every((v) => v === null || typeof v !== "object")
      ? value.join("; ")
      : JSON.stringify(value);
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
