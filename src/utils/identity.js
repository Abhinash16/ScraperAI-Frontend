// Phone verification on chats (backend Track W1). A web chat or conversation
// may carry identity: { verified, method: "whatsapp", phone, verifiedAt,
// whatsappChatId, whatsappConsent }. Verification lasts for one conversation;
// the chat keeps the latest one.

// The identity when it's verified, else null
export function verifiedIdentity(item) {
  return item?.identity?.verified ? item.identity : null;
}

// "919812345678" → "+91 98123 45678"; other numbers → "+<digits>"
export function formatPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}
