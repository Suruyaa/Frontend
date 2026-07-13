import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FloatingChat from "@/components/FloatingChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.techtoko.my.id"),
  title: {
    default: "TechStore AI - Toko Komputer & Laptop Terbaik",
    template: "%s | TechStore AI"
  },
  description: "Beli laptop, PC, dan aksesoris komputer terbaik dan termurah di TechStore AI. Dapatkan rekomendasi pintar dari AI Assistant kami untuk kebutuhan gaming, desain, dan kantor.",
  keywords: ["toko komputer", "jual laptop", "laptop gaming", "pc rakitan", "aksesoris komputer", "TechStore", "TechStore AI", "rekomendasi laptop AI", "toko laptop murah", "techtoko"],
  authors: [{ name: "TechStore AI" }],
  creator: "TechStore AI",
  publisher: "TechStore AI",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.techtoko.my.id",
    title: "TechStore AI - Toko Komputer & Laptop Terbaik",
    description: "Temukan laptop dan PC impianmu dengan bantuan AI Assistant di TechStore AI. Belanja aman, mudah, dan terpercaya.",
    siteName: "TechStore AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechStore AI - Toko Komputer & Laptop Terbaik",
    description: "Temukan laptop dan PC impianmu dengan bantuan AI Assistant di TechStore AI. Belanja aman, mudah, dan terpercaya.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "H-_H1RiFQetzjrIdgXcctbBUuZterDXUcT7_WP7JFx0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <FloatingChat />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
