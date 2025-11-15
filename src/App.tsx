/***********************************************************
 App.tsx는 StoreRader의 메인 화면(초기 화면)을 정의한다
***********************************************************/

import { useEffect } from "react";

function App() {
  console.log('메인 화면 로딩');
  useEffect(() => {
    localStorage.removeItem("lastSearchTerm");
    localStorage.removeItem("selectedGoodName");
  }, []);
  
  return (
    <div className='container'>
      <h1>StoreRader</h1>
      
    </div>
  );
}

export default App;
