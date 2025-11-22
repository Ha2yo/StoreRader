import L from "leaflet";

// 랜덤 ID 생성 (중복 방지)
const uid = () => Math.random().toString(36).substring(2, 9);

const makeSvgIcon = (colorTop: string, colorBottom: string) => {
    const gradId = `grad-${uid()}`; // 고유 ID 생성

    return L.divIcon({
        className: "leaflet-div-icon scalable-marker",
        html: `
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${colorTop}" />
                    <stop offset="100%" stop-color="${colorBottom}" />
                </linearGradient>
            </defs>

            <path 
                d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"
                fill="url(#${gradId})"
                stroke="white"
                stroke-width="2"
            />
        </svg>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 20],
    });
};

// 추천 1위 (빨강)
export const redIcon = makeSvgIcon("#E57373", "#D64545");

// 추천 2~5위 (주황)
export const orangeIcon = makeSvgIcon("#F6C17A", "#E89F4C");

// 일반 매장 (검정)
export const blackIcon = makeSvgIcon("#8A8A8A", "#5A5A5A");
