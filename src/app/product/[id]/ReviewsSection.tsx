"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ReviewsSection({ productId }: { productId: number }) {
  const { user, openLoginModal } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          rating,
          comment
        })
      });
      
      if (res.ok) {
        setComment("");
        setRating(5);
        fetchReviews(); // Refresh list
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-20 pt-12 border-t border-gray-200">
      <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Ulasan Pembeli</h2>
      
      {/* Review Form */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10">
        <h3 className="font-bold text-gray-900 mb-4">Tulis Ulasan Anda</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2 font-medium">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2 font-medium">Komentar</label>
            <textarea
              className="w-full text-black border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bagaimana pengalaman Anda dengan produk ini?"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </form>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="text-gray-500">Memuat ulasan...</div>
      ) : reviews.length === 0 ? (
        <div className="text-gray-500">Belum ada ulasan untuk produk ini. Jadilah yang pertama!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {rev.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{rev.user?.name || "Anonim"}</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < rev.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-xs text-gray-400">
                  {new Date(rev.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>
              <p className="text-gray-600">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
