export interface SelectionPayload {
    store_id: string;
    good_id: string | null;
    price: number | null | undefined;
    preference_type: string;
}