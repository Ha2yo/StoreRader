import { invoke } from "@tauri-apps/api/core";

export async function checkServerHealth() {
    try {
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
        const res = await fetch(`${apiURL}`, { method: "GET" });

        if (res.status === 200) return "ok";
        return "down";
    } catch {
        return "down";
    }
}
