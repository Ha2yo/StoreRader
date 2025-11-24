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
    price?: number | null;
    distance?: number | null;
    inspect_day?: string | null;
}

export interface Props {
    store: Store;
    candidates: Store[];
    goodId: string | null;
    onClose: () => void;
}
