import { PriceChangeItem } from "../types/PriceChange.types";
import { invoke } from "@tauri-apps/api/core";

export async function fetchPriceChange(status: "down" | "up") {
    const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
    
    const res = await fetch(`${apiURL}/get/price-change?status=${status}`);
    if (!res.ok) throw new Error("API 요청 실패");
    return (await res.json()) as PriceChangeItem[];
}