export interface UserHistoryItem {
    id: number;
    store_id: string;
    store_name: string;
    good_id: number;
    good_name: string;
    price: number;
    current_price: number;
    x_coord: number | null;
    y_coord: number | null;
    created_at: string;
}
