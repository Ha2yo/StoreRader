/***********************************************************
 Home.tsx는 StoreRader의 홈 화면을 정의한다
 사용자에게 메인 콘텐츠를 표시한다
***********************************************************/

import { useEffect } from "react";
import PriceChange from "../features/home-page/components/PriceChange";

function Home() {
  console.log('홈 화면 로딩');
  useEffect(() => {
    localStorage.removeItem("lastSearchTerm");
    localStorage.removeItem("selectedGoodName");
  }, []);
  
  return (
    <div className='container'>
      <PriceChange />
    </div>
  );
}

export default Home;
