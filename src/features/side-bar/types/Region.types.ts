// 대한민국 지역별 코드
export interface Region {
  code: string;
  name: string;
  parent_code: string | null;
  level: number;
}
