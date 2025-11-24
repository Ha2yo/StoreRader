/**
 * File: contexts/AuthContext.tsx
 * Description:
 *   StoreRader 앱의 전역 인증 컨텍스트
 *   JWT 기반 사용자 정보를 저장·복구하며,
 *   로그인/로그아웃 기능을 제공한다
 *
 * Responsibilities:
 *   1. JWT 및 사용자 정보(name, email, picture) 로컬 저장/삭제
 *   2. 앱 재시작 시 localStorage를 기반으로 사용자 상태 자동 복구
 *   3. 전역 인증 컨텍스트(AuthContext) 제공
 */
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  name: string,
  email: string,
  picture: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (name: string, email: string, picture: string, jwt: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // 앱 재시작 시 사용자 정보를 복구한다
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const picture = localStorage.getItem("picture");
    if (jwt && name && email && picture) {
      setUser({ name, email, picture });
    }
  }, []);

  // 로그인 시
  function login(name: string, email: string, picture: string, jwt: string) {
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("picture", picture);
    setUser({ name, email, picture });
  }

  // 로그아웃 시
  function logout() {
    localStorage.removeItem("jwt");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("picture");
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
