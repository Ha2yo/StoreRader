export interface Region {
  code: string;
  name: string;
  parent_code: string | null;
  level: number;
}
