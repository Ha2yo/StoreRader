/**
 * File: features/home-page/hooks/usePriceChange.ts
 * Description:
 *   가격 변동 데이터(하락/상승)를 로드하고,
 *   최소 변동 매장 수(minCount)에 따라 필터링된 리스트를 제공하는 훅.
 */

import { useEffect, useState } from "react";
import { PriceChangeItem } from "../types/PriceChange.types";
import { fetchPriceChange } from "../api/fetchPriceChange";

export function usePriceChange() {

    // 서버에서 받은 원본 데이터
    const [originalDownList, setOriginalDownList] = useState<PriceChangeItem[]>([]);
    const [originalUpList, setOriginalUpList] = useState<PriceChangeItem[]>([]);

    // 필터링 후 화면에 표시할 리스트
    const [downList, setDownList] = useState<PriceChangeItem[]>([]);
    const [upList, setUpList] = useState<PriceChangeItem[]>([]);

    // 사용자가 설정하는 최소 변동 매장 수
    const [minCount, setMinCount] = useState<number>(50);

    useEffect(() => {
        async function load() {
            const down = await fetchPriceChange("down");
            const up = await fetchPriceChange("up");

            setOriginalDownList(down);
            setOriginalUpList(up);
        }
        load();
    }, []);

    // (minCount가 바뀔 때마다 즉시 필터링 적용
    useEffect(() => {
        setDownList(originalDownList.filter(item => item.change_count >= minCount));
        setUpList(originalUpList.filter(item => item.change_count >= minCount));
    }, [minCount, originalDownList, originalUpList]);

    return {
        downList,
        upList,
        minCount,
        setMinCount
    };
}
