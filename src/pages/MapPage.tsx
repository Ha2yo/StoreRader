// src/pages/MapPage.tsx
import Map from "../component/Map";
import SearchOverlay from "../component/SearchOverlay";

function MapPage() {
  console.log("지도 화면 로딩");

  return (
    <div>
      <Map />


      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "10px",
          right: "10px",
          zIndex: 1000,
        }}
      >
        <SearchOverlay />
      </div>
    </div>
  );
}

export default MapPage;
