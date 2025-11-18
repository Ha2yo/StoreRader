import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { PriceChangeItem } from "../types/PriceChange.types";
import { fetchPriceChange } from "../api/fetchPriceChange";

export function usePriceChange() {
    const [downList, setDownList] = useState<PriceChangeItem[]>([]);
    const [upList, setUpList] = useState<PriceChangeItem[]>([]);
    const [apiURL, setApiURL] = useState<string>("");

    useEffect(() => {
        async function load() {
            const url = await invoke<string>("c_get_env_value", { name: "API_URL" });
            setApiURL(url);
            fetchPriceChange("down", url).then(setDownList).catch(console.error);
            fetchPriceChange("up", url).then(setUpList).catch(console.error);
        }
        load();
    }, []);

    return { downList, upList, apiURL };
}