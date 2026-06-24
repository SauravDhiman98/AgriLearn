CREATE TABLE IF NOT EXISTS exams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    slug VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_subjects (
    id BIGSERIAL PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subject_chapters (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chapter_notes (
    id BIGSERIAL PRIMARY KEY,
    chapter_id BIGINT NOT NULL REFERENCES subject_chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapter_videos (
    id BIGSERIAL PRIMARY KEY,
    chapter_id BIGINT NOT NULL REFERENCES subject_chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    youtube_url VARCHAR(500) NOT NULL,
    youtube_video_id VARCHAR(50),
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcq_tests (
    id BIGSERIAL PRIMARY KEY,
    chapter_id BIGINT NOT NULL REFERENCES subject_chapters(id) ON DELETE CASCADE,
    notes_id BIGINT REFERENCES chapter_notes(id),
    title VARCHAR(255) NOT NULL,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    total_questions INT NOT NULL DEFAULT 10,
    time_limit_minutes INT NOT NULL DEFAULT 15,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcq_questions (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES mcq_tests(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a VARCHAR(1000) NOT NULL,
    option_b VARCHAR(1000) NOT NULL,
    option_c VARCHAR(1000) NOT NULL,
    option_d VARCHAR(1000) NOT NULL,
    correct_option CHAR(1) NOT NULL,
    explanation TEXT,
    order_index INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mcq_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    test_id BIGINT NOT NULL REFERENCES mcq_tests(id),
    score INT NOT NULL DEFAULT 0,
    total_questions INT NOT NULL,
    answers TEXT,
    completed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO exams (name, description, icon, slug) VALUES
('UPSC', 'Union Public Service Commission - Civil Services Exam', '🏛️', 'upsc'),
('SSC', 'Staff Selection Commission - Multiple posts across departments', '📝', 'ssc'),
('IBPS', 'Institute of Banking Personnel Selection - Bank PO and Clerk', '🏦', 'ibps'),
('Railway (RRB)', 'Railway Recruitment Board - ALP, Group D, NTPC', '🚂', 'railway'),
('State PSC', 'State Public Service Commission exams', '🏢', 'state-psc'),
('Defence (NDA/CDS)', 'National Defence Academy and Combined Defence Services', '🪖', 'defence'),
('Teaching (CTET/TET)', 'Central and State Teacher Eligibility Tests', '🎓', 'teaching'),
('Other Exams', 'Other competitive examinations', '📊', 'others')
ON CONFLICT (slug) DO NOTHING;
