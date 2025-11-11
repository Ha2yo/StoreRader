CREATE TABLE user_selection_log (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id VARCHAR(10) NOT NULL,
    good_id VARCHAR(20) NOT NULL,
    preference_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
