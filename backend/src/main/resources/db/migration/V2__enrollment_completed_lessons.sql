-- V2: Track individual lesson completions per enrollment
CREATE TABLE IF NOT EXISTS enrollment_completed_lessons (
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    lesson_id     BIGINT NOT NULL,
    PRIMARY KEY (enrollment_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollment_completed_lessons_enrollment
    ON enrollment_completed_lessons(enrollment_id);
