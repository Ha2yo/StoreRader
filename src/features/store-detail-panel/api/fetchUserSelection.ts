/**
 * File: features/store-detail-panel/api/fetchUserSelectionLog.ts
 * Description:
 *   사용자가 매장을 선택할 때 발생하는 로그를 서버로 전송한다
 */

import { invoke } from "@tauri-apps/api/core";
import { SelectionPayload } from "../types/SelectionPayload.types";

export async function fetchUserSelectionLog(jwt: string, payload: SelectionPayload) {
    const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

    const res = await fetch(`${apiURL}/update/user-selection-log`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("로그 저장 실패:", text);
        throw new Error(text);
    }

    return true;
}