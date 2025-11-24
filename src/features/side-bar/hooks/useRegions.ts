/**
 * File: features/side-bar/hooks/useRegions.ts
 * Description:
 *   지역 코드 목록을 불러와 상위 지역만 반환한다
 */

import { useEffect, useState } from "react";
import { Region } from "../types/Region.types";
import { fetchRegions } from "../api/fetchRegions";

export function useRegions() {
    const [regions, setRegions] = useState<Region[]>([]);

    useEffect(() => {
        fetchRegions()
            .then((data) => {
                const topRegions = data.filter((r) => r.level === 1);

                setRegions([
                    { code: "020000000", name: "전체", parent_code: null, level: 0 },
                    ...topRegions,
                ]);
            })
            .catch((err) => console.error("지역 코드 불러오기 실패:", err));
    }, []);

    return regions;
}