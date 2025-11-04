CREATE TABLE regions (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    parent_code VARCHAR(10),
    level SMALLINT NOT NULL,
    FOREIGN KEY (parent_code) REFERENCES regions(code)
);
