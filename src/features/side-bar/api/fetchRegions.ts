/**
 * File: features/side-bar/api/fetchRegions.ts
 * Description:
 *   지역 코드 목록을 서버에서 조회한다
 */

import { invoke } from "@tauri-apps/api/core";
import { Region } from "../types/Region.types";

export async function fetchRegions(): Promise<Region[]> {
    const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

    const res = await fetch(`${apiURL}/get/region-codes/all`);

    return res.json();
}