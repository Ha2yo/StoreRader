// Good: 상품 정보 구조체
export interface Good {
  id: number;
  good_id: string;
  good_name: string;
  total_cnt: number | null;
  total_div_code: string | null;
  created_at: string;
  updated_at: string;
}