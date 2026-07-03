"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }: { product: any }) {
  const { user, openLoginModal } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!user) {
      alert("Harap login terlebih dahulu untuk menambahkan barang ke keranjang!");
      openLoginModal();
      return;
    }
    addToCart(product);
  };

  return (
    <button 
      onClick={handleAddToCart}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
    >
      Tambah ke Keranjang
    </button>
  );
}
