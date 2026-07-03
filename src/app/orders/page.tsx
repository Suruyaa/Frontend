"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = () => {
    if (user) {
      fetch(`http://127.0.0.1:8000/api/user/${user.id}/orders`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (user === null) {
      router.push("/");
      return;
    }
    fetchOrders();
  }, [user, router]);

  // Load snap js for resuming payments
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

  const handleResumePayment = (snapToken: string, orderNumber: string) => {
    if (!snapToken) {
      alert("Token pembayaran tidak ditemukan. Silakan hubungi admin.");
      return;
    }

    (window as any).snap.pay(snapToken, {
      onSuccess: async function(result: any) {
        await fetch(`http://127.0.0.1:8000/api/orders/${orderNumber}/success`, { method: "POST" });
        alert("Pembayaran berhasil diselesaikan!");
        fetchOrders();
      },
      onPending: function(result: any) {
        alert("Menunggu pembayaran diselesaikan (Cek instruksi VA yang diberikan).");
      },
      onError: function(result: any) {
        alert("Pembayaran gagal atau kadaluarsa.");
      },
      onClose: function() {
        // User closed the popup, do nothing
      }
    });
  };

  const handleCancelOrder = async (orderNumber: string) => {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/orders/${orderNumber}/cancel`, { method: "POST" });
      if (res.ok) {
        alert("Pesanan berhasil dibatalkan.");
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
      alert("Gagal membatalkan pesanan.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Riwayat Pesanan</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Belum Ada Pesanan</h2>
            <p className="text-gray-500 mb-6">Anda belum pernah melakukan transaksi apa pun.</p>
            <Link href="/katalog" className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header Pesanan */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">No. Pesanan</p>
                    <p className="text-gray-900 font-bold">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Tanggal Transaksi</p>
                    <p className="text-gray-900 font-bold">{new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium mb-1">Status Pembayaran</p>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                      order.status === 'failed' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'paid' ? 'Berhasil' : order.status === 'pending' ? 'Menunggu Pembayaran' : 'Dibatalkan'}
                    </span>
                  </div>
                </div>

                {/* Detail Item Pesanan */}
                <div className="p-6">
                  <div className="space-y-6">
                    {order.items && order.items.map((item: any) => (
                      <div key={item.id} className="flex gap-4">
                        <img src={item.product?.image_url || "https://via.placeholder.com/150"} alt={item.product?.name} className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900">{item.product?.name}</h4>
                          <p className="text-gray-500 text-sm mb-1">{item.quantity} barang x Rp {new Intl.NumberFormat("id-ID").format(item.price)}</p>
                        </div>
                        <div className="text-right font-bold text-gray-900">
                          Rp {new Intl.NumberFormat("id-ID").format(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total Pesanan & Aksi */}
                  <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {order.status === 'pending' ? (
                      <div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleResumePayment(order.snap_token, order.order_number)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Lanjutkan Pembayaran
                          </button>
                          <button 
                            onClick={() => handleCancelOrder(order.order_number)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-6 rounded-xl transition-colors border border-red-200"
                          >
                            Batalkan Pesanan
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Menunggu pembayaran diselesaikan sebelum pesanan diproses.</p>
                      </div>
                    ) : order.status === 'failed' ? (
                      <div className="text-red-500 text-sm font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Pesanan ini telah dibatalkan atau gagal.
                      </div>
                    ) : (
                      <div className="text-green-600 text-sm font-bold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Pembayaran Lunas. Pesanan sedang diproses!
                      </div>
                    )}
                    
                    <div className="text-right ml-auto">
                      <p className="text-gray-500 text-sm mb-1">Total Belanja</p>
                      <p className="text-2xl font-black text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(order.total_amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
