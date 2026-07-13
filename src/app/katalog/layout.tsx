import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description: "Jelajahi berbagai pilihan laptop, PC, dan aksesoris komputer di TechStore AI. Dapatkan rekomendasi terbaik sesuai budget dan kebutuhan Anda.",
  keywords: ["katalog laptop", "harga laptop terbaru", "jual pc murah", "TechStore AI katalog", "pilihan laptop gaming"],
  openGraph: {
    title: "Katalog Produk | TechStore AI",
    description: "Jelajahi berbagai pilihan laptop, PC, dan aksesoris komputer di TechStore AI. Dapatkan rekomendasi terbaik sesuai budget dan kebutuhan Anda.",
  }
};

export default function KatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
