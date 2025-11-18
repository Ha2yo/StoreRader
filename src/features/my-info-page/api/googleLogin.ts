import { invoke } from "@tauri-apps/api/core";
import { signIn } from "@choochmeque/tauri-plugin-google-auth-api";

export async function requestGoogleLogin() {
  const googleClientId = await invoke<string>("c_get_env_value", { name: "GOOGLE_CLIENT_ID" });
  const googleClientPWD = await invoke<string>("c_get_env_value", { name: "GOOGLE_CLIENT_PWD" });

  return signIn({
    clientId: googleClientId,
    clientSecret: googleClientPWD,
    scopes: ["openid", "email", "profile"],
  });
}

export async function requestBackendLogin(idToken: string) {
  const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

  const res = await fetch(`${apiURL}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_token: idToken,
      client_id: await invoke("c_get_env_value", { name: "GOOGLE_CLIENT_ID" }),
    }),
  });

  if (!res.ok) throw new Error("백엔드 로그인 실패");

  return res.json();
}
