"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { cart } = useCart();
  const { user, setUser, openLoginModal } = useAuth();
  
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center space-x-2 cursor-pointer">
                <span className="text-2xl font-black text-blue-600 tracking-tighter">TechStore</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link href="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 font-medium transition-colors">
                  Home
                </Link>
                <Link href="/katalog" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 font-medium transition-colors">
                  Katalog
                </Link>
                <Link href="/chat" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 font-medium transition-colors">
                  AI Assistant
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Link href="/checkout" className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/profile" className="flex items-center space-x-2 group">
                    <img src={user.avatar || "https://via.placeholder.com/40"} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt="Avatar" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      Hi, {user.name}
                    </span>
                  </Link>
                  <Link href="/orders" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                    Riwayat Pesanan
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-sm font-bold text-blue-600 hover:text-blue-800">
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={openLoginModal}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
