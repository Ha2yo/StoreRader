/**
 * File: utils/loadSavedPos.ts
 * Description:
 *   localStorage에 저장된 사용자의 마지막 위치를 로드한다
 */

export function loadSavedPosition() {
    const saved = localStorage.getItem("lastPosition");
    if (!saved) return null;

    const pos = JSON.parse(saved);
    return pos;
}