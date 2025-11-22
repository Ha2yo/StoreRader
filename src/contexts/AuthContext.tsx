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

  // 앱 새로 열 때 JWT 자동 복구
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const picture = localStorage.getItem("picture");
    if (jwt && name && email && picture) {
      setUser({ name, email, picture });
    }
  }, []);

  // 로그인 (email과 jwt 저장)
  function login(name: string, email: string, picture: string, jwt: string) {
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("picture", picture);
    setUser({ name, email, picture });
  }

  // 로그아웃 (JWT 제거)
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
