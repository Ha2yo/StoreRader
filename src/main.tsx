/***********************************************************
 main.tsx는 StoreRader 프론트엔드의 진입점으로
 React 애플리케이션을 초기화하고 Routing 컴포넌트를 렌더링한다
***********************************************************/

import { invoke } from "@tauri-apps/api/core";
import Routing from "./Routing";
import React from "react";
import ReactDOM from "react-dom/client";

export let currentLocation: { lat: number; lng: number } | null = null;

(async () => {
  const naver_map_key = await invoke<string>("c_get_env_value", { name: "NAVER_MAP_CLIENT_ID" });

const script = document.createElement('script');
script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${naver_map_key}&submodules=geocoder`;
script.type = 'text/javascript';
document.head.appendChild(script);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Routing />
  </React.StrictMode>,
);
})();