/**
 * File: features/map-page/api/fetchAllStores.ts
 * Description:
 *   서버에서 전체 매장 목록을 조회한다
 */
import { invoke } from "@tauri-apps/api/core";
import { Store } from "../types/Store.types";

export async function fetchAllStores(): Promise<Store[]> {
    const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

    const res = await fetch(`${apiURL}/get/stores/all`);
    if(!res.ok) throw new Error("매장 조회 실패");

    return res.json();
}