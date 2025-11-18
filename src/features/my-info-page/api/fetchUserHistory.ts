import { invoke } from "@tauri-apps/api/core";
import { UserHistoryItem } from "../types/MyInfo.types";

export async function fetchUserHistory(jwt: string | null) {
  if (!jwt) throw new Error("JWT 없음");

  const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

  const res = await fetch(`${apiURL}/get/user-selection-log`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!res.ok) throw new Error("히스토리 불러오기 실패");

  return (await res.json()) as UserHistoryItem[];
}
