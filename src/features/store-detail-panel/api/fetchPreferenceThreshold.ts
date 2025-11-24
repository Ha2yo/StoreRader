/**
 * File: features/store-detail-panel/api/fetchPreferenceThreshold.ts
 * Description:
 *   사용자 선호도 계산에 사용되는 임계값(threshold)을 서버에서 가져온다.
 */

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