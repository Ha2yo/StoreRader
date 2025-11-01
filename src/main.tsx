/***********************************************************
 main.tsx는 StoreRader 프론트엔드의 진입점으로
 React 애플리케이션을 초기화하고 Routing 컴포넌트를 렌더링한다
***********************************************************/

import Routing from "./Routing";
import React from "react";
import './App.css';
import ReactDOM from "react-dom/client";
import LocationProvider from "./contexts/LocationProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocationProvider>
      <Routing />
    </LocationProvider>
  </React.StrictMode>,
);