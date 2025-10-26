import { Container as MapDiv, NaverMap, Marker, useNavermaps } from 'react-naver-maps'
import Map from '../component/Map';

function MapPage() {

  console.log('지도 화면 로딩');

  return (
    <div className='container'>
        <Map />
    </div>
  );
}

export default MapPage;
