CREATE TABLE IF NOT EXISTS prices (
    id SERIAL PRIMARY KEY,
    good_id VARCHAR(10) NOT NULL,
    store_id VARCHAR(10) NOT NULL,
    inspect_day VARCHAR(10) NOT NULL,
    price INTEGER NOT NULL,
    is_one_plus_one BOOLEAN DEFAULT FALSE,
    is_discount BOOLEAN DEFAULT FALSE,
    discount_start VARCHAR(10),
    discount_end VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (good_id, store_id, inspect_day)
);
