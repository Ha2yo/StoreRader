import { signOut } from "@choochmeque/tauri-plugin-google-auth-api";

export async function requestLogout() {
  const accessToken = localStorage.getItem("accessToken") || undefined;
  return signOut({ accessToken });
}
