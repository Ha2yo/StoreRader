import { createContext, useEffect, useState } from "react";

export const LocationContext = createContext<GeolocationPosition | null>(null);

function LocationProvider({ children }: { children: React.ReactNode }) {
  // 현재 위치 상태값
  const [position, setPosition] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    console.log("사용자 위치 추적 시작");

    // 위치 정보 지원 여부 화깅ㄴ
    if (!navigator.geolocation) {
      console.warn("이 기기는 위치 정보를 지원하지 않습니다.");
      return;
    }

    // 초기 위치 가져오기 (앱 실행 시 1회)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("초기 위치 - lat: " + pos.coords.latitude + " long: " + pos.coords.longitude);
        setPosition(pos);
      },
      (err) => console.error("초기 위치 읽기 실패:", err),
      { enableHighAccuracy: true }
    );

    // 주기적으로 위치 갱신 (5초마다)
    const id = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("갱신된 위치 - lat: " + pos.coords.latitude + " long: " + pos.coords.longitude);
          setPosition(pos);
        },
        (err) => console.error("주기적 위치 갱신 실패:", err),
        { enableHighAccuracy: true }
      );
    }, 5000);

    return () => clearInterval(id);
  }, []);

  return (
    <LocationContext.Provider value={position}>
      {children}
    </LocationContext.Provider>
  );
}

export default LocationProvider;