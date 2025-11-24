// YYYYMMDD 형식의 문자열을 YYYY-MM-DD 형식으로 변환한다
export function formatDate(yyyymmdd: string) {
    return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}
