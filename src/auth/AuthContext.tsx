import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, jwt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // 앱 새로 열 때 JWT 자동 복구
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const email = localStorage.getItem("email");
    if (token && email) {
      setUser({ email });
    }
  }, []);

  // 로그인 (email과 jwt 저장)
  function login(email: string, jwt: string) {
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("email", email);
    setUser({ email });
  }

  // 로그아웃 (JWT 제거)
  function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("email");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다");
  }
  return context;
}
