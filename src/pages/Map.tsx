/**
 * File: pages/Map.tsx
 * Description:
 *   지도 화면을 렌더링하며,
 *   지도와 검색바를 함께 표시한다
 */

import MapPage from "../features/map-page/components/Map";
import SearchBar from "../features/search-bar/components/SearchBar";

function Map() {
  console.log("지도 화면 로딩");

  return (
    <div>
      <MapPage />

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "10px",
          right: "10px",
          zIndex: 1000,
        }}
      >
        <SearchBar />
      </div>
    </div>
  );
}

export default Map;
