-- =====================================================
-- EVALORA DATABASE SCHEMA (FULL RESET)
-- =====================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. ADMINS TABLE
-- =====================================================
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) DEFAULT 'Administrator',
    username VARCHAR(100) UNIQUE,
    profile_pic VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. STUDENTS TABLE
-- =====================================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fullname VARCHAR(255) NOT NULL,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    profile_pic VARCHAR(500),
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. ASSESSMENTS TABLE
-- =====================================================
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    passing_score DECIMAL(5,2) NOT NULL CHECK (passing_score >= 0),
    published BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. QUESTIONS TABLE
-- =====================================================
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    time_taken INTEGER,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. ANSWERS TABLE
-- =====================================================
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option CHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. INDEXES (PERFORMANCE OPTIMIZATION)
-- =====================================================
CREATE INDEX idx_questions_assessment ON questions(assessment_id);

CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_assessment ON submissions(assessment_id);

CREATE INDEX idx_answers_submission ON answers(submission_id);
CREATE INDEX idx_answers_question ON answers(question_id);