/**
 * File: pages/Home.tsx
 * Description:
 *   StoreRader의 홈 화면을 렌더링하며,
 *   가격 변동 리스트를 출력한다
 */

import PriceChange from "../features/home-page/components/PriceChange";

function Home() {
  console.log('홈 화면 로딩');
  return (
    <div className='container'>
      <PriceChange />
    </div>
  );
}

export default Home;
