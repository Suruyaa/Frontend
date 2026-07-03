"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
  const { user, openLoginModal } = useAuth();

  // Load from localstorage when user changes
  useEffect(() => {
    if (!user) {
      setCart([]);
      setLoadedUserId(null);
      return;
    }
    const saved = localStorage.getItem(`techstore_cart_${user.id}`);
    if (saved) {
      setCart(JSON.parse(saved));
    } else {
      setCart([]);
    }
    setLoadedUserId(user.id);
  }, [user]);

  // Save to localstorage on cart change
  useEffect(() => {
    if (user && loadedUserId === user.id) {
      localStorage.setItem(`techstore_cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user, loadedUserId]);

  const addToCart = (product: any) => {
    if (!user) {
      alert("Harap login terlebih dahulu untuk menambahkan barang ke keranjang!");
      openLoginModal();
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
