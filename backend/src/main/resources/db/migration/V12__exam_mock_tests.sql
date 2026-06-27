-- Allow exam-level mock tests (not linked to a chapter)
ALTER TABLE mcq_tests ALTER COLUMN chapter_id DROP NOT NULL;

-- Link mock tests directly to an exam
ALTER TABLE mcq_tests ADD COLUMN IF NOT EXISTS exam_id BIGINT REFERENCES exams(id);

-- Track negative marking (0.25 = 1/4 penalty per wrong answer) — DOUBLE PRECISION matches Java double
ALTER TABLE mcq_tests ADD COLUMN IF NOT EXISTS negative_marking DOUBLE PRECISION NOT NULL DEFAULT 0.25;

-- Track time spent in seconds for each attempt
ALTER TABLE mcq_attempts ADD COLUMN IF NOT EXISTS time_taken_seconds INT NOT NULL DEFAULT 0;
