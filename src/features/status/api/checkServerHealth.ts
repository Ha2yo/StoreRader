/**
 * File: features/status/api/checkServerHealth.ts
 * Description:
 *   API 서버의 상태를 간단히 확인하여
 *   - 응답 성공 시: "ok"
 *   - 실패 또는 오류 시: "down"
 *   을 반환한다
 */

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
