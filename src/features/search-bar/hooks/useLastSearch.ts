/**
 * File: features/search-bar/hooks/useLastSearch.ts
 * Description:
 *   로컬스토리지에 저장된 마지막 검색어를 반환한다
 */

import { useEffect, useState } from "react";

export function useLastSearch() {
    const [lastSearch, setLastSearch] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("lastSearchTerm");
        if (saved) setLastSearch(saved);
    }, []);

    return lastSearch;
}