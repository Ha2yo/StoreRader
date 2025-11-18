// 매장 기본 정보
export interface Store {
  id: number;
  store_id: string;
  store_name: string;
  tel_no: string | null;
  post_no: string | null;
  jibun_addr: string;
  road_addr: string;
  x_coord: number | null;
  y_coord: number | null;
  area_code: string;
  area_detail_code: string;
  price?: number | null;
  inspect_day?: string | null;
}