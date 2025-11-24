/**
 * File: main.tsx
 * Description:
 *   StoreRader 프론트엔드의 진입점
 *   전역 위치 컨텍스트와 라우팅 환경을 초기화한다
 */

import React from "react";
import './app/App.css';
import ReactDOM from "react-dom/client";
import LocationProvider from "./contexts/LocationContext";
import Routing from "./app/Routing";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocationProvider>
      <Routing />
    </LocationProvider>
  </React.StrictMode>,
);