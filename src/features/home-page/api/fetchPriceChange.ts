/**
 * File: features/home-page/api/fetchPriceChange.ts
 * Description:
 *   특정 상태(하락/상승)에 따른 가격 변동 데이터를 서버에서 조회한다.
 */

import { PriceChangeItem } from "../types/PriceChange.types";
import { invoke } from "@tauri-apps/api/core";

export async function fetchPriceChange(
    status: "down" | "up"
): Promise<PriceChangeItem[]> {
    const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

    const res = await fetch(`${apiURL}/get/price-change?status=${status}`);
    if (!res.ok) throw new Error("API 요청 실패");
    return await res.json();
}