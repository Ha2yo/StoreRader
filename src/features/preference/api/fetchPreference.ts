/**
 * File: features/preference/api/fetchPreference.ts
 * Description:
 *   로그인된 사용자의 가격/거리 가중치를 조회한다
 */

import { invoke } from "@tauri-apps/api/core";

export interface Preference {
    w_price: number;
    w_distance: number;
}

export async function fetchPreference(): Promise<Preference | null> {
    const jwt = localStorage.getItem("jwt");

    // 비로그인 사용자
    if (!jwt) {
        console.log("비로그인 기본값 사용");
        return null;
    }

    try {
        const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

        const res = await fetch(`${apiURL}/get/user-preferences`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({}),
        });

        if (!res.ok) {
            console.warn("가중치 요청 실패:", res.status);
            return null;
        }

        const data = await res.json();
        sessionStorage.setItem("userPreference", JSON.stringify(data));
        return data;

    } catch (err) {
        console.error("가중치 요청 에러:", err);
        return null;
    }
}
