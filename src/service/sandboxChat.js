import apiClient from "@/service/axios";

// Sandbox chat API (/api/sandbox). Needs the settings:manage permission.

const BASE = "/sandbox/sessions";
const STORAGE_KEY = "sandbox-session-id";

// platform: "whatsapp" | "web"; phone: digits with country code, optional.
// Resolves to { sessionId, platform, phone, createdAt }.
export async function createSandboxSession({ platform, phone }) {
  const body = { platform };
  if (phone) body.phone = phone;
  const { data } = await apiClient.post(BASE, body);
  return data.data;
}

// Resolves to { session, messages: [{ sender, text, at, source? }] }.
export async function getSandboxSession(sessionId) {
  const { data } = await apiClient.get(`${BASE}/${sessionId}`);
  return data.data;
}

// Resolves to { reply, source, latencyMs, trace }. Takes 1–10 s.
export async function sendSandboxMessage(sessionId, message, bypassCache) {
  const { data } = await apiClient.post(`${BASE}/${sessionId}/messages`, {
    message,
    bypassCache: !!bypassCache,
  });
  return data.data;
}

export async function deleteSandboxSession(sessionId) {
  await apiClient.delete(`${BASE}/${sessionId}`);
}

// The session id lives in sessionStorage so a refresh reloads the chat.
export function getStoredSessionId() {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeSessionId(sessionId) {
  try {
    if (sessionId) sessionStorage.setItem(STORAGE_KEY, sessionId);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable (private mode); the session just won't survive a refresh
  }
}
