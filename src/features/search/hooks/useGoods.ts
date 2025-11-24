/**
 * File: features/search/hooks/useGoods.ts
 * Description:
 *   전체 상품 목록을 서버에서 불러와 관리한다
 */

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Good } from "../types/goods.types";

export function useGoods() {
    const [goods, setGoods] = useState<Good[]>([]);

    useEffect(() => {
        const fetchGoods = async () => {
            try {
                const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });
                const res = await fetch(`${apiURL}/get/goods/all`);
                const data: Good[] = await res.json();
                setGoods(data);
                console.log("상품목록 불러오기 완료:", data.length, "개");
            } catch (err) {
                console.error("상품 불러오기 실패:", err);
            }
        };
        fetchGoods();
    }, []);

    return goods;
}