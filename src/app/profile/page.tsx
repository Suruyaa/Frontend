"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        postal_code: user.postal_code || "",
      });
      if (user.avatar) setAvatarPreview(user.avatar);
    } else {
      router.push("/");
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("name", formData.name);
    if (formData.phone) data.append("phone", formData.phone);
    if (formData.address) data.append("address", formData.address);
    if (formData.city) data.append("city", formData.city);
    if (formData.postal_code) data.append("postal_code", formData.postal_code);
    if (avatar) data.append("avatar", avatar);
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/profile/${user.id}`, {
        method: "POST",
        body: data,
      });
      
      const result = await res.json();
      if (res.ok) {
        setUser(result.user);
        setMessage("Profil berhasil diperbarui!");
      } else {
        setMessage(result.message || "Gagal memperbarui profil.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen pt-24 text-center">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-3xl font-bold">Profil Pengguna</h1>
          <p className="opacity-90 mt-2">Kelola informasi pribadi dan alamat pengiriman Anda.</p>
        </div>
        
        <div className="p-8">
          {message && (
            <div className={`p-4 rounded-xl mb-6 font-medium ${message.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                <img 
                  className="h-24 w-24 object-cover rounded-full border-4 border-gray-100 shadow-sm" 
                  src={avatarPreview || "https://via.placeholder.com/150"} 
                  alt="Profile Photo" 
                />
              </div>
              <label className="block">
                <span className="sr-only">Pilih foto profil</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 transition-colors"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-black border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Tidak bisa diubah)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full text-black border border-gray-200 bg-gray-50 rounded-xl p-3 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">No. HP / WhatsApp</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full text-black border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kota</label>
                <input 
                  type="text" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full text-black border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full text-black border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kode Pos</label>
              <input 
                type="text" 
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full md:w-1/3 text-black border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
