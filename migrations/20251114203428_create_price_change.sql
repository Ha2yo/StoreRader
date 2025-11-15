CREATE TABLE price_change (
    id SERIAL PRIMARY KEY,
    good_id VARCHAR NOT NULL,
    store_id VARCHAR NOT NULL,
    previous_price INT NOT NULL,
    current_price INT NOT NULL,
    diff INT NOT NULL,  -- current - previous (양수면 상승, 음수면 하락)
    inspect_day VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);