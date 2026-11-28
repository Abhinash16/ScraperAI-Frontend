// Helpers for the Actions screens: payment links the bot sends, and requests it
// raises (service requests, callbacks), by calling the client's own API
// (backend: /api/actions, documentation/api/actions.md).
// Stored secrets come back as MASKED_VALUE; sending it back keeps them.
import apiClient from "@/service/axios";
import { authFromForm, authToForm, newRow, rowsToPairs } from "@/utils/integrationApi";
import { headersFromRows, rowsFromHeaders } from "@/utils/apiHeaders";

export const ACTIONS_API = "/actions";

export const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp", icon: "$whatsapp", color: "green" },
  { value: "web", label: "Website chat", icon: "$globe", color: "blue" },
  { value: "voice", label: "Phone calls", icon: "$phone", color: "deep-purple" },
];

// Runs store the chat's platform: "webchat" for website chats
export const channelInfo = (value) =>
  CHANNELS.find((c) => c.value === (value === "webchat" ? "web" : value)) || {
    value,
    label: value || "—",
    icon: "$message-circle",
    color: "grey",
  };

export const ACTION_TYPES = {
  payment_link: {
    label: "Payment link",
    blurb: "The bot sends a payment link your API makes.",
    icon: "$credit-card",
  },
  request: {
    label: "Request",
    blurb: "The bot raises a service request, callback or complaint in your system and gives the customer its ID.",
    icon: "$clipboard-list",
  },
};

export const isRequest = (a) => a?.type === "request";

export const DELIVERY = {
  in_chat: { label: "Bot sends the link", short: "Bot sends", icon: "$message-circle" },
  client_sends: { label: "Your system sends it", short: "You send", icon: "$send" },
};

export const INPUT_TYPES = [
  { value: "string", text: "Text" },
  { value: "integer", text: "Whole number" },
  { value: "date", text: "Date" },
];

export const RUN_STATUS = {
  awaiting_confirmation: { label: "Waiting for yes", color: "amber darken-3", icon: "$clock" },
  running: { label: "Running", color: "primary", icon: "$loader-circle" },
  succeeded: { label: "Sent", color: "success", icon: "$circle-check" },
  failed: { label: "Failed", color: "error", icon: "$circle-alert" },
  refused: { label: "Refused by your API", color: "orange darken-2", icon: "$ban" },
  cancelled: { label: "Customer said no", color: "grey", icon: "$circle-x" },
  expired: { label: "No answer", color: "blue-grey", icon: "$clock" },
};

export const runStatus = (s) => RUN_STATUS[s] || { label: s, color: "grey", icon: "$circle" };

export const KEY_PATTERN = /^[a-z][a-z0-9_]{2,40}$/;
export const LIMITS = {
  timeoutMin: 1000,
  timeoutMax: 30000,
  timeoutDefault: 8000,
  perDayMax: 50,
  maxLengthMax: 1000,
  maxLengthDefault: 100,
  cacheHoursMin: 1,
  cacheHoursMax: 48,
  cacheHoursDefault: 6,
  templateMax: 1000,
};

// Where an input's current choices came from (GET /actions/:id/options)
export const CHOICE_SOURCES = {
  api: "from your API",
  cache: "from your API · cached",
  last_good: "last known: your API didn't answer",
  custom: "fallback choices",
  none: "none yet",
};

// What the backend says when a template is left empty (services/actions)
export const DEFAULT_TEMPLATES = {
  confirm: "<Action name>: That's ₹2,400. Shall I send you the payment link? Please reply yes or no.",
  sent: "Here's your payment link for ₹{{link.amount}}: {{link.url}}",
  clientSent: "Done, I've sent the payment link for ₹2,400 to your phone. Please check your messages.",
  declined: "Okay, I won't send it. Is there anything else I can help with?",
};

export const DEFAULT_REQUEST_TEMPLATES = {
  confirm: "<Action name>: shall I go ahead? Please reply yes or no.",
  sent: "Done, it's raised. Your reference number is <ID>. Our team will get back to you.",
  declined: "Okay, I won't raise it. Is there anything else I can help with?",
};

// Results of the create step go into messages as {{link.x}} for payment
// links and {{result.x}} for requests (the backend takes both for either)
export const resultPrefix = (type) => (type === "request" ? "result" : "link");

// Placeholders that can go into a step's URL and parameters
export function stepPlaceholders(form, stepName) {
  const base = [
    { value: "{{phone}}", hint: "The customer's phone" },
    { value: "{{runId}}", hint: "Unique per request: use it as the idempotency key" },
    { value: "{{channel}}", hint: "whatsapp, web or voice" },
  ];
  if (form.type !== "request") {
    base.push({ value: "{{clientSends}}", hint: "true when your system sends the link" });
  }
  const inputs = form.inputs
    .filter((i) => i.name.trim())
    .map((i) => ({ value: `{{${i.name.trim()}}}`, hint: i.description || "What the bot collected" }));
  const quote =
    stepName === "create" && form.quoteOn
      ? form.quote.outputs
          .filter((o) => o.name.trim())
          .map((o) => ({ value: `{{quote.${o.name.trim()}}}`, hint: "From the price check" }))
      : [];
  return [...base, ...inputs, ...quote];
}

// Placeholders for the messages the bot says
export function templatePlaceholders(form, template) {
  const inputs = form.inputs.filter((i) => i.name.trim()).map((i) => `{{${i.name.trim()}}}`);
  const quote = form.quoteOn
    ? form.quote.outputs.filter((o) => o.name.trim()).map((o) => `{{quote.${o.name.trim()}}}`)
    : [];
  const link =
    template === "confirm" || template === "declined"
      ? []
      : form.create.outputs
          .filter((o) => o.name.trim())
          .map((o) => `{{${resultPrefix(form.type)}.${o.name.trim()}}}`);
  return [...inputs, ...quote, ...link];
}

/* ---------------- form <-> API ---------------- */

const blankStep = (outputs = []) => ({
  url: "",
  method: "POST",
  auth: authToForm(null),
  headers: [],
  params: [],
  outputs: outputs.map(([name, path]) => newRow({ name, path })),
  okPath: "",
  errorPath: "",
  refuseOn4xx: true,
  timeout: LIMITS.timeoutDefault,
});

const stepToForm = (step, defaults) => {
  if (!step) return blankStep(defaults);
  return {
    url: step.url || "",
    method: step.method || "POST",
    auth: authToForm(step.auth),
    headers: rowsFromHeaders(step.headers),
    params: Object.entries(step.extraParams || {}).map(([name, value]) =>
      newRow({ name, value: typeof value === "string" ? value : JSON.stringify(value) }),
    ),
    outputs: Object.entries(step.outputs || {}).map(([name, path]) => newRow({ name, path })),
    okPath: step.okPath || "",
    errorPath: step.errorPath || "",
    refuseOn4xx: step.refuseOn4xx !== false,
    timeout: step.timeout || LIMITS.timeoutDefault,
  };
};

const OPTION_PATHS = ["listPath", "valuePath", "labelPath", "descriptionPath", "activePath"];

// An input's "choices from your API": a step without results, plus where the
// list and each choice's fields are, and how long the list is kept
const optionsToForm = (o) => ({
  ...stepToForm(o, []),
  method: o?.method || "GET",
  ...Object.fromEntries(OPTION_PATHS.map((k) => [k, o?.[k] || ""])),
  cacheHours: o?.cacheHours ?? LIMITS.cacheHoursDefault,
});

const inputToForm = (i = {}) =>
  newRow({
    name: i.name || "",
    type: i.type || "string",
    description: i.description || "",
    required: i.required !== false,
    min: i.min ?? "",
    max: i.max ?? "",
    maxLength: i.maxLength ?? "",
    enumText: (i.enum || []).join(", "),
    optionsOn: !!i.options,
    options: optionsToForm(i.options),
  });

export const blankInput = () => inputToForm();

// The create step's starting results for each type
export const CREATE_DEFAULTS = {
  payment_link: [["url", ""], ["amount", ""]],
  request: [["id", ""]],
};

export function actionToForm(action) {
  const a = action || {};
  const type = a.type === "request" ? "request" : "payment_link";
  return {
    id: a.id || null,
    type,
    key: a.key || "",
    name: a.name || "",
    description: a.description || "",
    enabled: !!a.enabled,
    inputs: (a.inputs || []).map(inputToForm),
    quoteOn: !!a.quote,
    quote: stepToForm(a.quote, [["amount", ""]]),
    create: stepToForm(a.create, CREATE_DEFAULTS[type]),
    confirm: a.confirm !== false,
    allowedLinkDomains: [...(a.allowedLinkDomains || [])],
    channels: [...(a.channels || ["whatsapp", "web"])],
    delivery: {
      whatsapp: a.delivery?.whatsapp || "in_chat",
      web: a.delivery?.web || "in_chat",
      voice: "client_sends",
    },
    templates: {
      confirm: a.templates?.confirm || "",
      sent: a.templates?.sent || "",
      clientSent: a.templates?.clientSent || "",
      declined: a.templates?.declined || "",
    },
    maxPerChatPerDay: a.maxPerChatPerDay ?? 5,
  };
}

// Returns { step } or { error }
function stepFromForm(f, label, { needsUrl, needsId }) {
  const err = (m) => ({ error: `${label}: ${m}` });
  const url = f.url.trim();
  if (!url) return err("enter your API's URL.");
  if (!/^https:\/\//i.test(url)) return err("the URL must start with https://");
  const auth = authFromForm(f.auth);
  if (auth.error) return err(auth.error);
  const headers = headersFromRows(f.headers);
  if (headers.error) return err(headers.error);
  const params = rowsToPairs(f.params, { label: "parameter", max: 30 });
  if (params.error) return err(params.error);
  const outputs = rowsToPairs(f.outputs, { a: "name", b: "path", label: "result", max: 20 });
  if (outputs.error) return err(outputs.error);
  if (outputs.value && Object.values(outputs.value).some((p) => !p)) {
    return err("every result needs the path where it is in your API's response.");
  }
  if (needsUrl && !outputs.value?.url) {
    return err("add a result named \"url\": where the payment link is in your API's response.");
  }
  if (needsId && !outputs.value?.id) {
    return err("add a result named \"id\": where the new request's ID is in your API's response.");
  }
  const timeout = Number(f.timeout) || LIMITS.timeoutDefault;
  if (timeout < LIMITS.timeoutMin || timeout > LIMITS.timeoutMax) {
    return err("the time limit must be between 1 and 30 seconds.");
  }
  return {
    step: {
      url,
      method: f.method,
      auth: auth.auth || { type: "headers" },
      headers: headers.headers,
      extraParams: params.value || {},
      outputs: outputs.value || {},
      okPath: f.okPath.trim() || undefined,
      errorPath: f.errorPath.trim() || undefined,
      ...(f.refuseOn4xx === false ? { refuseOn4xx: false } : {}),
      timeout,
    },
  };
}

// Same rule as the backend (services/actions/settings.js PATH_RE)
const DOT_PATH = /^[\w.[\]-]{1,100}$/;

// Returns { options } or { error }
function optionsFromForm(f, label) {
  const s = stepFromForm({ ...f, outputs: [], okPath: "", errorPath: "", refuseOn4xx: true }, label, {});
  if (s.error) return s;
  const { outputs, okPath, errorPath, ...options } = s.step; // eslint-disable-line no-unused-vars
  for (const k of OPTION_PATHS) {
    const v = f[k].trim();
    if (!v) continue;
    if (!DOT_PATH.test(v)) return { error: `${label}: "${v}" must be a dot path, like data.types.` };
    options[k] = v;
  }
  if (!options.valuePath) {
    return { error: `${label}: say where each choice's value is (for example type).` };
  }
  const hours = f.cacheHours === "" || f.cacheHours == null ? LIMITS.cacheHoursDefault : Number(f.cacheHours);
  if (!Number.isFinite(hours) || hours < LIMITS.cacheHoursMin || hours > LIMITS.cacheHoursMax) {
    return { error: `${label}: keep the list for ${LIMITS.cacheHoursMin} to ${LIMITS.cacheHoursMax} hours.` };
  }
  options.cacheHours = hours;
  return { options };
}

// Only payment links are sent in the chat; a request has no link
const anyInChat = (f) =>
  f.type !== "request" && f.channels.some((c) => c !== "voice" && f.delivery[c] === "in_chat");

// Returns { body } (the action to POST/PUT) or { error }
export function actionFromForm(f) {
  const key = f.key.trim();
  if (!f.name.trim()) return { error: "Give the action a name." };
  if (!KEY_PATTERN.test(key)) {
    return {
      error:
        "The key must be 3–41 characters: lowercase letters, numbers and _, starting with a letter.",
    };
  }
  if (!f.description.trim()) return { error: "Describe when the bot should use this action." };
  if (!f.channels.length) return { error: "Pick at least one channel." };

  const inputs = [];
  const seen = new Set();
  for (const row of f.inputs) {
    const name = row.name.trim();
    if (!name && !row.description.trim()) continue;
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
      return { error: `Input "${name || "(no name)"}": use letters, numbers and _, starting with a letter.` };
    }
    if (seen.has(name)) return { error: `Input "${name}" is listed twice.` };
    seen.add(name);
    const input = { name, type: row.type, description: row.description.trim(), required: row.required };
    if (row.type === "string" && row.maxLength !== "" && row.maxLength != null) {
      const n = Number(row.maxLength);
      if (!Number.isInteger(n) || n < 1 || n > LIMITS.maxLengthMax) {
        return { error: `Input "${name}": the longest answer must be between 1 and ${LIMITS.maxLengthMax} characters.` };
      }
      input.maxLength = n;
    }
    if (row.type === "integer") {
      if (row.min !== "" && row.min != null) input.min = Number(row.min);
      if (row.max !== "" && row.max != null) input.max = Number(row.max);
      if (input.min != null && input.max != null && input.min > input.max) {
        return { error: `Input "${name}": the smallest value is bigger than the largest.` };
      }
    }
    const options = row.enumText.split(",").map((s) => s.trim()).filter(Boolean);
    if (options.length) input.enum = options;
    if (row.type === "string" && row.optionsOn) {
      const o = optionsFromForm(row.options, `Input "${name}" choices`);
      if (o.error) return o;
      input.options = o.options;
    }
    inputs.push(input);
  }

  const inChat = anyInChat(f);
  let quote = null;
  if (f.quoteOn) {
    const q = stepFromForm(f.quote, "Price check", { needsUrl: false });
    if (q.error) return q;
    quote = q.step;
  }
  const request = f.type === "request";
  const c = stepFromForm(f.create, request ? "Raise the request" : "Create link", {
    needsUrl: inChat,
    needsId: request,
  });
  if (c.error) return c;

  const domains = f.allowedLinkDomains.map((d) => d.trim().toLowerCase()).filter(Boolean);
  if (inChat && !domains.length) {
    return { error: "Add the domain your payment links are on (for example rzp.io), so the bot only sends links from it." };
  }

  const templates = {};
  (request ? ["confirm", "sent", "declined"] : ["confirm", "sent", "clientSent", "declined"]).forEach((k) => {
    const v = f.templates[k].trim();
    if (v) templates[k] = v;
  });
  if (request) {
    if (templates.sent && !/\{\{(link|result)\.id\}\}/.test(templates.sent)) {
      return { error: "The \"request raised\" message must contain {{result.id}}: the customer needs the ID." };
    }
  } else if (templates.sent && !/\{\{(link|result)\.url\}\}/.test(templates.sent)) {
    return { error: "The \"link sent\" message must contain {{link.url}}." };
  }

  const perDay = Number(f.maxPerChatPerDay);
  if (!Number.isInteger(perDay) || perDay < 1 || perDay > LIMITS.perDayMax) {
    return {
      error: `${request ? "Requests" : "Links"} per chat per day must be between 1 and ${LIMITS.perDayMax}.`,
    };
  }

  const body = {
    key,
    name: f.name.trim(),
    type: f.type,
    enabled: f.enabled,
    description: f.description.trim(),
    inputs,
    quote,
    create: c.step,
    confirm: f.confirm,
    channels: f.channels,
    templates,
    maxPerChatPerDay: perDay,
  };
  // Link domains and delivery don't apply to requests, so they aren't sent
  if (!request) {
    body.allowedLinkDomains = domains;
    body.delivery = { whatsapp: f.delivery.whatsapp, web: f.delivery.web, voice: "client_sends" };
  }
  return { body };
}

export const needsLinkDomains = anyInChat;

/* ---------------- presets ---------------- */

const presetStep = (params, outputs) => ({
  url: "",
  method: "POST",
  extraParams: params,
  outputs,
  okPath: "",
  errorPath: "",
});

export const PRESETS = {
  extend: {
    title: "Extend a rental",
    blurb: "The customer pays to keep a booking for more days. Your API gives the price first.",
    icon: "$calendar",
    action: {
      key: "extension_payment_link",
      name: "Extend a rental",
      description: "The customer wants to extend an active rental by some days and pay for it.",
      inputs: [
        { name: "bookingId", type: "string", description: "The rental's booking ID from the customer's data", required: true },
        { name: "days", type: "integer", min: 1, max: 30, description: "How many more days", required: true },
      ],
      quote: presetStep(
        { phone: "{{phone}}", bookingId: "{{bookingId}}", days: "{{days}}" },
        { amount: "" },
      ),
      create: presetStep(
        { phone: "{{phone}}", bookingId: "{{bookingId}}", days: "{{days}}", idempotencyKey: "{{runId}}" },
        { url: "", amount: "" },
      ),
      templates: {
        confirm:
          "Extending booking {{bookingId}} by {{days}} days costs ₹{{quote.amount}}. Shall I send the payment link?",
        sent: "Here's your payment link for ₹{{link.amount}}: {{link.url}}",
      },
    },
  },
  booking: {
    title: "Pay for a booking",
    blurb: "The customer pays for a booking they already made. No price check needed.",
    icon: "$receipt",
    action: {
      key: "booking_payment_link",
      name: "Pay for a booking",
      description: "The customer wants to pay for a booking they made that hasn't been paid yet.",
      inputs: [
        { name: "bookingId", type: "string", description: "The booking ID from the customer's data", required: true },
      ],
      quote: null,
      create: presetStep(
        { phone: "{{phone}}", bookingId: "{{bookingId}}", idempotencyKey: "{{runId}}" },
        { url: "", amount: "" },
      ),
      templates: { confirm: "Shall I send the payment link for booking {{bookingId}}?" },
    },
  },
  service_request: {
    title: "Raise a service request",
    blurb: "The customer reports a problem. The bot raises a request in your system and gives them its ID.",
    icon: "$wrench",
    action: {
      type: "request",
      key: "raise_service_request",
      name: "Raise a service request",
      description:
        "The customer reports a problem with their vehicle or booking that our team needs to look at, and no matching request is already open.",
      inputs: [
        { name: "bookingId", type: "string", description: "The booking it's about, from the customer's data", required: true },
        {
          name: "problem",
          type: "string",
          maxLength: 500,
          description: "The problem in the customer's own words",
          required: true,
        },
      ],
      quote: null,
      create: presetStep(
        { phone: "{{phone}}", bookingId: "{{bookingId}}", problem: "{{problem}}", idempotencyKey: "{{runId}}" },
        { id: "" },
      ),
      channels: ["whatsapp", "web", "voice"],
      templates: {
        confirm: "I'm sorry about this. Shall I raise a service request for our team? {{problem}} Please reply yes or no.",
        sent: "Done, I've raised service request {{result.id}}. Our team will get back to you soon.",
      },
    },
  },
};

/* ---------------- API ---------------- */

export const listActions = () => apiClient.get(ACTIONS_API).then(({ data }) => data.data || []);
export const getAction = (id) => apiClient.get(`${ACTIONS_API}/${id}`).then(({ data }) => data.data);
export const createAction = (body) => apiClient.post(ACTIONS_API, body).then(({ data }) => data.data);
export const updateAction = (id, body) =>
  apiClient.put(`${ACTIONS_API}/${id}`, body).then(({ data }) => data.data);
export const deleteAction = (id) => apiClient.delete(`${ACTIONS_API}/${id}`);
export const testAction = (id, body) =>
  apiClient.post(`${ACTIONS_API}/${id}/test`, body).then(({ data }) => data.data);
export const getInputOptions = (id, refresh = false) =>
  apiClient
    .get(`${ACTIONS_API}/${id}/options`, { params: refresh ? { refresh: 1 } : {} })
    .then(({ data }) => data.data?.inputs || []);
export const listRuns = (params) =>
  apiClient.get(`${ACTIONS_API}/runs`, { params }).then(({ data }) => data.data || { runs: [], total: 0 });

// "₹2,400" from a number or numeric string; "" when missing
export function formatAmount(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : String(v);
}

export const runAmount = (run) => run?.result?.amount ?? run?.quote?.amount;

// Runs don't store the action's type: go by the action, else by the result
export const runIsRequest = (run, actions = []) => {
  const action = actions.find((a) => a.key === run?.actionKey);
  if (action) return action.type === "request";
  return run?.result?.id != null && !run?.result?.url;
};

// A finished request was raised, not sent
export const runStatusFor = (run, request) =>
  request && run?.status === "succeeded"
    ? { ...RUN_STATUS.succeeded, label: "Raised" }
    : runStatus(run?.status);
