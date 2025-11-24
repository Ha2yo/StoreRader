import { useState } from "react";
import { fetchPreference, Preference } from "../api/fetchPreference";

export function usePreference() {
  const [preference, setPreference] = useState<Preference>({
    w_price: 0.5,
    w_distance: 0.5,
  });

  // 서버에서 최신 가중치 불러오기
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
