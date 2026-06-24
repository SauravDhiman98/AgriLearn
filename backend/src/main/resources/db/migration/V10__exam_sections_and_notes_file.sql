CREATE TABLE IF NOT EXISTS exam_sections (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    section_type VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
    table_headers TEXT,
    table_rows TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

ALTER TABLE chapter_notes ADD COLUMN IF NOT EXISTS file_url VARCHAR(1000);
ALTER TABLE chapter_notes ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE chapter_notes ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE chapter_notes ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);
