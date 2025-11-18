import { fetchUserSelectionLog } from "../api/fetchUserSelection";
import { Store } from "../types/StoreDetail.types";

export async function logUserSelection(store: Store, goodId: string | null, preferenceType: string) {
        try {
            const jwt = localStorage.getItem("jwt");
            if (!jwt) {
                console.warn("JWT 없음 -> 비로그인 사용자");
                return;
            }

            const payload = {
                store_id: store.store_id,
                good_id: goodId,
                price: store.price,
                preference_type: preferenceType,
                
            };
            console.log("서버 전송 데이터:", payload);

           await fetchUserSelectionLog(jwt, payload);
            
        } catch (err) {
            console.error("로그 저장 중 오류:", err);
        }
    }