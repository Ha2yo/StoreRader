import { invoke } from "@tauri-apps/api/core";
import { createContext, useContext, useState } from "react";

interface Preference {
  w_price: number;
  w_distance: number;
}

interface PreferenceContextType {
  preference: Preference;
  setPreference: (pref: Preference) => void;
  fetchPreference: () => Promise<void>;
}

const PreferenceContext = createContext<PreferenceContextType | null>(null);

export const PreferenceProvider = ({ children }: { children: React.ReactNode }) => {
  const [preference, setPreference] = useState<Preference>({
    w_price: 0.5,
    w_distance: 0.5,
  });

  const fetchPreference = async () => {
    const jwt = localStorage.getItem("jwt");

    if (!jwt) {
      console.log("비로그인 사용자: 기본값 유지");
      return;
    }

    try {
      const apiURL = await invoke<string>("c_get_env_value", { name: "API_URL" });

      const res = await fetch(`${apiURL}/get/user-preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        setPreference(data);
        sessionStorage.setItem("userPreference", JSON.stringify(data));
        console.log("선호도 요청 성공:", data);
      } else {
        console.warn("선호도 요청 실패:", res.status);
      }
    } catch (err) {
      console.error("선호도 요청 에러:", err);
    }
  };

  return (
    <PreferenceContext.Provider
      value={{ preference, setPreference, fetchPreference }}
    >
      {children}
    </PreferenceContext.Provider>
  );
};

export const usePreference = () => {
  const context = useContext(PreferenceContext);
  if (!context) throw new Error("usePreference는 PreferenceProvider 안에서만 사용해야 합니다");
  return context;
};
