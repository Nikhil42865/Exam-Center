import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserDto, LoginRequestDto, RegisterRequestDto } from "@examcenter/contracts";
import { api } from "../../services/api.js";

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  login: (dto: LoginRequestDto) => Promise<void>;
  register: (dto: RegisterRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.auth.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (dto: LoginRequestDto) => {
    const data = await api.auth.login(dto);
    setUser(data.user);
  };

  const register = async (dto: RegisterRequestDto) => {
    const data = await api.auth.register(dto);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
