export function applyRegionSelection(regionCode: string) {
  localStorage.setItem("selectedRegionCode", regionCode);
  localStorage.removeItem("selectedDistance");

  window.dispatchEvent(
    new CustomEvent("regionChange", { detail: regionCode }));
}

export function applyDistanceSelection(distanceCode: string) {
  localStorage.setItem("selectedDistance", distanceCode);
  localStorage.setItem("selectedRegionCode", "020000000");

  window.dispatchEvent(
    new CustomEvent("distanceChange", { detail: distanceCode })
  );
}
