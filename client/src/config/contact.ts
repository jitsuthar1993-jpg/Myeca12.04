const DEFAULT_WHATSAPP_MESSAGE = "Hi MyeCA, I need help with ITR filing.";

function publicWhatsAppNumber() {
  return String(import.meta.env.VITE_WHATSAPP_PUBLIC_NUMBER || "").replace(/\D/g, "");
}

export function buildWhatsAppHref(message = DEFAULT_WHATSAPP_MESSAGE) {
  const number = publicWhatsAppNumber();
  if (!number) return "/expert-consultation";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const CONTACT = {
  supportEmail: "support@myeca.in",
  callbackHref: "/expert-consultation",
  whatsappHref: buildWhatsAppHref(),
  whatsappAvailable: Boolean(publicWhatsAppNumber()),
  phonePlaceholder: "Mobile number",
} as const;
