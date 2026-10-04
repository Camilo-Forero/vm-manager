import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types";
import { loginUser, logoutUser, checkAuth } from "../services/api";
import { useToast } from "./ToastContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    checkAuth()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const data = await loginUser({ email, password: pass });
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Login failed", "error");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      showToast("Logged out successfully", "info");
    } catch (err: any) {
      showToast(err.message || "Logout failed", "error");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
