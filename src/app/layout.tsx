import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.the-new-spark.es"),

  title: `${siteConfig.name} | Barbería y reservas online`,
  description: siteConfig.description,

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: `${siteConfig.name} | Barbería y reservas online`,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}