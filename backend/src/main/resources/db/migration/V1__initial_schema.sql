-- V1__initial_schema.sql
-- AgriLearn Initial Database Schema

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    state VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'en',
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    preview_video_url TEXT,
    category VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    language VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    free BOOLEAN NOT NULL DEFAULT TRUE,
    price NUMERIC(10,2),
    duration_minutes INT,
    instructor_id BIGINT NOT NULL REFERENCES users(id),
    rating FLOAT NOT NULL DEFAULT 0.0,
    total_ratings INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE chapters (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url TEXT,
    attachment_url TEXT,
    order_index INT NOT NULL,
    duration_minutes INT,
    type VARCHAR(20) NOT NULL,
    free_preview BOOLEAN NOT NULL DEFAULT FALSE,
    chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    progress_percent INT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    certificate_url TEXT,
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INT NOT NULL,
    time_limit_minutes INT NOT NULL,
    course_id BIGINT REFERENCES courses(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    image_url TEXT,
    explanation TEXT,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE question_options (
    id BIGSERIAL PRIMARY KEY,
    option_text VARCHAR(500) NOT NULL,
    correct BOOLEAN NOT NULL DEFAULT FALSE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id),
    score INT NOT NULL,
    passed BOOLEAN NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE forum_posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES users(id),
    upvotes INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    solved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE forum_post_tags (
    post_id BIGINT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL
);

CREATE TABLE forum_comments (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    post_id BIGINT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id),
    upvotes INT NOT NULL DEFAULT 0,
    accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image_url TEXT,
    stock_quantity INT,
    unit VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    seller_id BIGINT NOT NULL REFERENCES users(id),
    rating FLOAT NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    buyer_id BIGINT NOT NULL REFERENCES users(id),
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_id VARCHAR(255),
    payment_method VARCHAR(50),
    shipping_address TEXT,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL
);

CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    plan VARCHAR(20) NOT NULL DEFAULT 'FREE',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    razorpay_subscription_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    amount_paid NUMERIC(10,2),
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE live_classes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id BIGINT NOT NULL REFERENCES users(id),
    course_id BIGINT REFERENCES courses(id),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT,
    meeting_url TEXT,
    meeting_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    premium_only BOOLEAN NOT NULL DEFAULT FALSE,
    registered_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE live_class_registrations (
    id BIGSERIAL PRIMARY KEY,
    live_class_id BIGINT NOT NULL REFERENCES live_classes(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(live_class_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_live_classes_scheduled ON live_classes(scheduled_at);
