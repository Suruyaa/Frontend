"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import LoginModal from "@/components/LoginModal";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load user from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("techstore_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user to local storage on change
  const handleSetUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("techstore_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("techstore_user");
    }
  };

  const handleLoginSuccess = (userData: any) => {
    handleSetUser(userData);
    setIsModalOpen(false);
    if (userData.role === 'admin') {
      window.location.href = "/admin";
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser: handleSetUser,
      openLoginModal: () => setIsModalOpen(true),
      closeLoginModal: () => setIsModalOpen(false),
    }}>
      {children}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
