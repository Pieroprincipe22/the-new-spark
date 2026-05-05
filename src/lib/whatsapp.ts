import { siteConfig } from "@/data/site";

export function createWhatsappLink(message: string) {
  const cleanPhone = siteConfig.whatsappNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}