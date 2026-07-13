"use client";

import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password || (mode === "register" && !name)) {
      alert("Semua field wajib diisi dengan benar.");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = mode === "login" ? "/login" : "/register";
      const payload = mode === "login" ? { email, password } : { name, email, password };
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(`${mode === "login" ? "Login" : "Registrasi"} berhasil sebagai ${data.user.role}!`);
        onLoginSuccess(data.user);
        
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
        setMode("login");
      } else {
        alert(`Error: ${data.message || (mode === "login" ? 'Login' : 'Registrasi') + ' gagal'}`);
      }
    } catch (err) {
      alert("Gagal menghubungi server");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
          {mode === "login" ? "Masuk ke Akun Anda" : "Buat Akun Baru"}
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {mode === "login" ? "Silakan login untuk menikmati fitur TechStore" : "Daftar sekarang untuk mulai berbelanja"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Memproses..." : (mode === "login" ? "Masuk" : "Daftar")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button onClick={toggleMode} className="text-blue-600 font-bold hover:underline">
              {mode === "login" ? "Daftar di sini" : "Login di sini"}
            </button>
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-800"
        >
          Batal / Tutup
        </button>
      </div>
    </div>
  );
}
