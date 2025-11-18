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
