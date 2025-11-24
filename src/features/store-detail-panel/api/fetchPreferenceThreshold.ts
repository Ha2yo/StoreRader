import { invoke } from "@tauri-apps/api/core";

export async function fetchPreferenceThreshold() {
    try {
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

        const res = await fetch(`${apiURL}/get/preference-threshold`);
        const data = await res.json();
        return data.threshold
    } catch (e) {
        console.error("Failed to fetch threshold", e);
        return null;
    }
}