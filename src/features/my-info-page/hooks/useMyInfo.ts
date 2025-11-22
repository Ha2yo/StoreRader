import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { fetchUserHistory } from "../api/fetchUserHistory";
import { requestBackendLogin, requestGoogleLogin } from "../api/googleLogin";
import { requestLogout } from "../api/googleLogout";
import { UserHistoryItem } from "../types/MyInfo.types";

export function useMyInfo() {
  const { user, login, logout } = useAuth();
  const [history, setHistory] = useState<UserHistoryItem[]>([]);

  async function handleLogin() {
    const google = await requestGoogleLogin();
    const serverRes = await requestBackendLogin(google.idToken!);

    if (serverRes.jwt) {
      login(serverRes.user.name, serverRes.user.email, serverRes.user.picture, serverRes.jwt);
    }
  }

  async function handleLogout() {
    await requestLogout();
    logout();
    setHistory([]);
  }

  async function loadHistory() {
    const jwt = localStorage.getItem("jwt");
    const data = await fetchUserHistory(jwt);
    setHistory(data);
  }

  return { user, history, handleLogin, handleLogout, loadHistory };
}
