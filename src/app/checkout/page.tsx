"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const { cart, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const tax = totalPrice * 0.11; // 11% PPN
  const grandTotal = totalPrice + tax;

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      
      let fullAddress = user.address || "";
      if (user.city) fullAddress += `, ${user.city}`;
      if (user.postal_code) fullAddress += ` ${user.postal_code}`;
      setAddress(fullAddress);
    }
  }, [user]);

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = "Mid-client-kCNShKvEhVFSWfSz";
    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const orderId = "TECHSTORE-" + Date.now();
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          gross_amount: Math.round(grandTotal),
          user_id: user?.id,
          cart: cart,
          customer_details: {
             first_name: name || "Customer",
             email: user?.email || "customer@example.com",
             phone: phone || "08123456789",
             billing_address: {
               first_name: name || "Customer",
               address: address
             },
             shipping_address: {
               first_name: name || "Customer",
               address: address
             }
          }
        })
      });

      const data = await res.json();
      if (data.snap_token) {
        clearCart();
        (window as any).snap.pay(data.snap_token, {
          onSuccess: async function(result: any) {
            // Update order status on backend
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/success`, { method: "POST" });
            setIsSuccess(true);
          },
          onPending: function(result: any) {
            alert("Menunggu pembayaran diselesaikan.");
            setIsProcessing(false);
          },
          onError: function(result: any) {
            setIsFailed(true);
            setIsProcessing(false);
          },
          onClose: function() {
            setIsFailed(true);
            setIsProcessing(false);
          }
        });
      } else {
        alert("Gagal mendapatkan token pembayaran dari server.");
        setIsProcessing(false);
      }
    } catch(err) {
      console.error(err);
      setIsProcessing(false);
      alert("Terjadi kesalahan server.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-green-100">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Pembayaran Berhasil!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Terima kasih, pesanan Anda telah kami terima dan sedang diproses. Anda dapat melacak status pesanan melalui riwayat pesanan.</p>
          <Link href="/orders" className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Cek Status Pesanan
          </Link>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-red-100">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Pembayaran Gagal</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Maaf, transaksi Anda gagal atau dibatalkan. Silakan coba kembali atau gunakan metode pembayaran lain.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setIsFailed(false)} className="block w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
              Coba Bayar Lagi
            </button>
            <Link href="/" className="block w-full bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout Pesanan</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Keranjang Anda Kosong</h2>
            <p className="text-gray-500 mb-6">Silakan pilih produk terlebih dahulu sebelum melakukan checkout.</p>
            <Link href="/katalog" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">
              Lihat Katalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Pengiriman */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Informasi Pengiriman</h2>
                <form onSubmit={handlePayment} id="checkout-form" className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                      <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-white text-black placeholder-gray-500" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                      <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-white text-black placeholder-gray-500" placeholder="08123456789" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                    <textarea required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border h-24 bg-white text-black placeholder-gray-500" placeholder="Jl. Sudirman No. 123, Jakarta..."></textarea>
                  </div>
                </form>
              </div>
            </div>

            {/* Ringkasan Pesanan */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Ringkasan Pesanan</h2>
                
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover border" />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-500 mb-1">Rp {new Intl.NumberFormat("id-ID").format(item.price)}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-black font-extrabold">-</button>
                          <span className="text-base font-black w-4 text-center text-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-black font-extrabold">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded-lg h-10 w-10 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rp {new Intl.NumberFormat("id-ID").format(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Pajak (PPN 11%)</span>
                    <span>Rp {new Intl.NumberFormat("id-ID").format(tax)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xl text-gray-900 border-t pt-3 mt-3">
                    <span>Total</span>
                    <span className="text-blue-600">Rp {new Intl.NumberFormat("id-ID").format(grandTotal)}</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  form="checkout-form"
                  disabled={isProcessing}
                  className="w-full bg-[#00173D] text-white font-bold py-4 rounded-xl hover:bg-blue-900 transition-colors flex justify-center items-center disabled:bg-gray-400 shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Membuka Midtrans...
                    </>
                  ) : (
                    "Lanjutkan Pembayaran"
                  )}
                </button>
                <div className="mt-4 flex justify-center gap-2 items-center text-xs text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  Pembayaran Aman oleh Midtrans
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
