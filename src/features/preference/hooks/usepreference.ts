/**
 * File: features/preference/hooks/usePreference.ts
 * Description:
 *   사용자 가격/거리 가중치를 관리하고,
 *   서버에서 최신 값을 불러오는 기능을 제공한다
 */

import { useState } from "react";
import { fetchPreference, Preference } from "../api/fetchPreference";

export function usePreference() {
  // 기본 가중치
  const [preference, setPreference] = useState<Preference>({
    w_price: 0.5,
    w_distance: 0.5,
  });

  // 서버에서 최신 가중치 로드
  const refreshPreference = async () => {
    const data = await fetchPreference();
    if (data) {
      setPreference(data);
      console.log("[로그인 사용자] 선호도:",
        JSON.stringify(data, null, 2));
      return;
    }
    console.log("[비로그인 사용자] 선호도:",
      JSON.stringify(preference, null, 2));
  };

  return {
    preference,
    setPreference,
    refreshPreference,
  };
}
