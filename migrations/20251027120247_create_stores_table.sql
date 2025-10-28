CREATE TABLE IF NOT EXISTS stores(
    id SERIAL PRIMARY KEY,
    store_id VARCHAR(10) UNIQUE NOT NULL,
    store_name VARCHAR(100) NOT NULL,
    tel_no VARCHAR(20),
    post_no VARCHAR(10),
    plmk_addr VARCHAR(255) NOT NULL,
    road_addr VARCHAR(255) NOT NULL,
    x_coord NUMERIC(18,15),
    y_coord NUMERIC(18,15),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);