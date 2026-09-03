import { normalizeWhatsAppLink } from "@/lib/whatsapp";

const WHATSAPP_LINK = normalizeWhatsAppLink(
  process.env.NEXT_PUBLIC_WHATSAPP_LINK ??
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    "15551234567"
);

export default function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <img src="/whatsapp.svg" alt="WhatsApp" width={24} height={24} />
    </a>
  );
}
