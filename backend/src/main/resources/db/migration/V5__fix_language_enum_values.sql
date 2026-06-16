-- V5__fix_language_enum_values.sql
-- Fix language codes inserted by V4 that don't match the Course.Language enum.
-- The enum expects: HINDI, ENGLISH, MARATHI, PUNJABI (uppercase full names)
-- V4 incorrectly inserted: hi, en, mr, pa

UPDATE courses SET language = 'HINDI'   WHERE language = 'hi';
UPDATE courses SET language = 'ENGLISH' WHERE language = 'en';
UPDATE courses SET language = 'MARATHI' WHERE language = 'mr';
UPDATE courses SET language = 'PUNJABI' WHERE language = 'pa';

-- Also fix users.preferred_language if needed (stored as plain VARCHAR, not an enum — no change needed there)
