/**
 * File: features/side-bar/utils/selectionHandler.ts
 * Description:
 *   지역 또는 거리 필터가 선택될 때
 *   로컬스토리지를 갱신하고, 필터 변경 이벤트를 Map 페이지에 전달한다
 */

// 지역 필터 선택 처리
export function applyRegionSelection(regionCode: string) {
  localStorage.setItem("selectedRegionCode", regionCode);
  localStorage.removeItem("selectedDistance");

  window.dispatchEvent(
    new CustomEvent("regionChange", { detail: regionCode }));
}

// 거리 필터 선택 처리
export function applyDistanceSelection(distanceCode: string) {
  localStorage.setItem("selectedDistance", distanceCode);
  localStorage.setItem("selectedRegionCode", "020000000");

  window.dispatchEvent(
    new CustomEvent("distanceChange", { detail: distanceCode })
  );
}
