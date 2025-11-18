import { invoke } from "@tauri-apps/api/core";
import { StorePrice } from "../types/StorePrice.types";

export async function fetchPrices(goodName: string): Promise<StorePrice[]> {
    const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

    const res = await fetch(`${apiURL}/get/prices?good_name=${goodName}`);
    if (!res.ok) throw new Error("가격정보 조회 실패");

    return res.json();
}