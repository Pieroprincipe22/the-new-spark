import type { NextConfig } from "next";
import type { Header } from "next/dist/lib/load-custom-routes";

// ── Security headers ─────────────────────────────────────────────────────────
const securityHeaders: Header["headers"] = [
  {
    // Evita que la web se cargue dentro de un iframe → anti-clickjacking
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Evita que el browser "adivine" el tipo de archivo → anti MIME sniffing
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Controla qué info de referencia se envía al navegar a otra web
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Desactiva cámara, micrófono y geolocalización en el browser
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    // Solo HTTPS durante 24h → sube a 31536000 cuando confirmes que el SSL funciona
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // CSP: solo permite cargar recursos de tu dominio + Supabase
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js lo necesita
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://whkdfdwbeumczqhpfysh.supabase.co",
      "font-src 'self'",
      "connect-src 'self' https://whkdfdwbeumczqhpfysh.supabase.co wss://whkdfdwbeumczqhpfysh.supabase.co",
      "frame-ancestors 'none'", // Refuerza X-Frame-Options en browsers modernos
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "whkdfdwbeumczqhpfysh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;