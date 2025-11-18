import { Store } from "./Store.types";

export interface Props {
    map: L.Map | null;
    markersRef: React.MutableRefObject<Record<string, L.Marker>>;
    circleRef: React.MutableRefObject<L.Circle | null>;
    renderKey: number;
    w_price: number;
    w_distance: number;
    setSelectedStore: (s: Store | null) => void;
}