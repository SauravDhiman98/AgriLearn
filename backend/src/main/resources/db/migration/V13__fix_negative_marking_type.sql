-- Fix negative_marking column type from NUMERIC to DOUBLE PRECISION to match Java double
ALTER TABLE mcq_tests ALTER COLUMN negative_marking TYPE DOUBLE PRECISION USING negative_marking::DOUBLE PRECISION;
