import { PriceChangeItem } from "../types/PriceChange.types";

export async function fetchPriceChange(status: "down" | "up", apiURL: string) {
        const res = await fetch(`${apiURL}/get/price-change?status=${status}`);
        if (!res.ok) throw new Error("API 요청 실패");
        return (await res.json()) as PriceChangeItem[];
    }