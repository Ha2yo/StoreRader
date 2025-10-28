ALTER TABLE stores
    ALTER COLUMN x_coord TYPE DOUBLE PRECISION USING x_coord::double precision,
    ALTER COLUMN y_coord TYPE DOUBLE PRECISION USING y_coord::double precision;