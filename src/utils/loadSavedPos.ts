// 저장된 사용자 위치 로드
export function loadSavedPosition() {
    const saved = localStorage.getItem("lastPosition");
    if (!saved) return null;

    const pos = JSON.parse(saved);
    return pos; // { lat, lng, accuracy }
}