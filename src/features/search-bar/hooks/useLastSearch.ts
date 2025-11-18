import { useEffect, useState } from "react";

export function useLastSearch() {
    const [lastSearch, setLastSearch] = useState("");

    // 로컬스토리지에서 마지막 검색어 불러오기
    useEffect(() => {
        const saved = localStorage.getItem("lastSearchTerm");
        if (saved) setLastSearch(saved);
    }, []);

    return lastSearch;
}