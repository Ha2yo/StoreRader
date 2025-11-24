/**
 * File: features/my-info-page/api/logout.ts
 * Description:
 *   Google OAuth 로그아웃을 수행한다.
 */

import { signOut } from "@choochmeque/tauri-plugin-google-auth-api";

export async function requestGoogleLogout() {
  const accessToken = localStorage.getItem("accessToken") || undefined;
  return signOut({ accessToken });
}
