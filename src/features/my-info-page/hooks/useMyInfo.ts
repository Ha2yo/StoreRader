/**
 * File: features/myinfo-page/hooks/useMyInfo.ts
 * Description:
 *   로그인/로그아웃 처리 및 사용자 매장 선택 로그를 로드한다
 */

import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { fetchUserHistory } from "../api/fetchUserHistory";
import { requestBackendLogin, requestGoogleLogin } from "../api/googleLogin";
import { requestGoogleLogout } from "../api/googleLogout";
import { UserHistoryItem } from "../types/MyInfo.types";

export function useMyInfo() {
  const { user, login, logout } = useAuth();
  const [history, setHistory] = useState<UserHistoryItem[]>([]);

  // Google OAuth → 백엔드 인증 → JWT 발급
  async function handleLogin() {
    const google = await requestGoogleLogin();
    const serverRes = await requestBackendLogin(google.idToken!);

    if (serverRes.jwt) {
      login(serverRes.user.name, serverRes.user.email, serverRes.user.picture, serverRes.jwt);
    }
  }

  async function handleLogout() {
    await requestGoogleLogout();
    logout();
    setHistory([]); // 로그아웃 시 히스토리 초기화
  }

  // 사용자 매장 선택 로그 요청
  async function loadHistory() {
    const jwt = localStorage.getItem("jwt");
    const data = await fetchUserHistory(jwt);
    setHistory(data);
  }

  return { user, history, handleLogin, handleLogout, loadHistory };
}
