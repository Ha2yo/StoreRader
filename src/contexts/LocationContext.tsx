import { createContext, useEffect, useState } from "react";

export const LocationContext = createContext<GeolocationPosition | null>(null);

function LocationProvider({ children }: { children: React.ReactNode }) {

  const [position, ] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    console.log("📡 위치 추적 시작");

    if (!navigator.geolocation) {
      console.warn("이 기기는 위치 정보를 지원하지 않습니다.");
      return;
    }

    function updatePosition(position: GeolocationPosition) {
      var lat = position.coords.latitude
      var lng = position.coords.longitude
      var accuracy = position.coords.accuracy

      localStorage.setItem("lastPosition", JSON.stringify({ lat, lng, accuracy }));

      console.log("현재 좌표 -> lat: " + lat + " lng: " + lng + " accuracy: " + accuracy)
    }

    navigator.geolocation.getCurrentPosition(
      updatePosition,
      function (err) {
        console.error("초기 위치 읽기 실패:", err);
      },
      { enableHighAccuracy: true }
    );

    const id = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        updatePosition,
        function (err) {
          console.error("주기적 위치 갱신 실패:", err);
        },
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
