CREATE TABLE IF NOT EXISTS goods(
    id SERIAL PRIMARY KEY,
    good_id VARCHAR(20) UNIQUE NOT NULL,
    good_name VARCHAR(100) NOT NULL,
    total_cnt INT,
    total_div_code VARCHAR(5),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);