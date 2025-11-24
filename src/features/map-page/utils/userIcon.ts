/**
 * File: features/map-page/utils/userIcon.ts
 * Description:
 *   지도 위에서 사용자 위치를 표시하는 커스텀 마커 아이콘
 */

import L from "leaflet";

export const userIcon = L.divIcon({
    className: "",
    html: `
        <div style="position: relative; width: 40px; height: 40px;">

            <!-- 바깥 흰색 원 -->
            <div
                style="
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    background: white;
                    border-radius: 50%;
                    top: 11px;
                    left: 11px;
                "
            ></div>

            <!-- 안쪽 파란 원 -->
            <div
                style="
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    background: #007AFF;
                    border-radius: 50%;
                    top: 14px;
                    left: 14px;
                "
            ></div>

        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});
