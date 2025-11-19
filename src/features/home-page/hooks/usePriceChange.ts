import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { PriceChangeItem } from "../types/PriceChange.types";
import { fetchPriceChange } from "../api/fetchPriceChange";

export function usePriceChange() {
    const [apiURL, setApiURL] = useState<string>("");

    // 원본 데이터
    const [originalDownList, setOriginalDownList] = useState<PriceChangeItem[]>([]);
    const [originalUpList, setOriginalUpList] = useState<PriceChangeItem[]>([]);

    // 필터링된 데이터
    const [downList, setDownList] = useState<PriceChangeItem[]>([]);
    const [upList, setUpList] = useState<PriceChangeItem[]>([]);

    // 사용자가 조절할 슬라이더 값 (기본 50개)
    const [minCount, setMinCount] = useState<number>(50);

    useEffect(() => {
        async function load() {
            const url = await invoke<string>("c_get_env_value", { name: "API_URL" });
            setApiURL(url);

            const down = await fetchPriceChange("down");
            const up = await fetchPriceChange("up");

            setOriginalDownList(down);
            setOriginalUpList(up);
        }
        load();
    }, []);

    // ⭐ 슬라이더(minCount)가 바뀔 때마다 즉시 필터링 적용
    useEffect(() => {
        setDownList(originalDownList.filter(item => item.change_count >= minCount));
        setUpList(originalUpList.filter(item => item.change_count >= minCount));
    }, [minCount, originalDownList, originalUpList]);

    return {
        apiURL,
        downList,
        upList,
        minCount,
        setMinCount
    };
}
