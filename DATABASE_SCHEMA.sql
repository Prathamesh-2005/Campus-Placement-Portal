-- CampusHire Database Schema
-- Run these SQL commands in Supabase SQL Editor

-- ================== TABLES ==================

-- 1. USERS TABLE (Auth metadata)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'company', 'tnp')),
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  cgpa DECIMAL(3,2) NOT NULL,
  resume_url TEXT,
  skills TEXT[] DEFAULT '{}',
  phone_number TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  website TEXT,
  hr_contact TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. JOB DRIVES TABLE
CREATE TABLE IF NOT EXISTS job_drives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  package DECIMAL(8,2) NOT NULL,
  location TEXT NOT NULL,
  eligibility DECIMAL(3,2) NOT NULL,
  deadline TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES job_drives(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'selected')),
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, job_id)
);

-- ================== INDEXES ==================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_students_cgpa ON students(cgpa);
CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch);
CREATE INDEX IF NOT EXISTS idx_job_drives_status ON job_drives(status);
CREATE INDEX IF NOT EXISTS idx_job_drives_company_id ON job_drives(company_id);
CREATE INDEX IF NOT EXISTS idx_job_drives_deadline ON job_drives(deadline);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ================== VIEWS ==================

-- View for getting student profile with user email
CREATE OR REPLACE VIEW student_profiles AS
SELECT 
  s.id,
  s.user_id,
  s.name,
  s.branch,
  s.cgpa,
  s.resume_url,
  s.skills,
  u.email,
  s.created_at
FROM students s
JOIN users u ON s.user_id = u.id;

-- View for getting company profile with user email
CREATE OR REPLACE VIEW company_profiles AS
SELECT 
  c.id,
  c.user_id,
  c.company_name,
  c.description,
  c.location,
  c.website,
  u.email,
  c.created_at
FROM companies c
JOIN users u ON c.user_id = u.id;

-- View for getting job drives with company details
CREATE OR REPLACE VIEW job_drives_with_company AS
SELECT 
  j.id,
  j.company_id,
  j.title,
  j.description,
  j.package,
  j.location,
  j.eligibility,
  j.deadline,
  j.status,
  j.approved_at,
  j.created_at,
  c.company_name,
  c.location as company_location,
  u.email as company_email
FROM job_drives j
JOIN companies c ON j.company_id = c.id
JOIN users u ON c.user_id = u.id;

-- ================== FUNCTIONS ==================

-- Function to count eligible students for a job
CREATE OR REPLACE FUNCTION count_eligible_students(job_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM students s
  WHERE s.cgpa >= (
    SELECT eligibility FROM job_drives WHERE id = $1
  )
  AND s.id NOT IN (
    SELECT student_id FROM applications WHERE job_id = $1
  );
$$ LANGUAGE SQL;

-- Function to get application count for company
CREATE OR REPLACE FUNCTION get_company_application_count(company_id UUID)
RETURNS TABLE(job_id UUID, job_title TEXT, application_count BIGINT) AS $$
  SELECT 
    j.id,
    j.title,
    COUNT(a.id)
  FROM job_drives j
  LEFT JOIN applications a ON j.id = a.job_id
  WHERE j.company_id = $1
  GROUP BY j.id, j.title;
$$ LANGUAGE SQL;

-- ================== SAMPLE DATA ==================

-- IMPORTANT: Do NOT manually insert into users table with hardcoded UUIDs
-- Users are created via Supabase Auth (signup/login in the app)
-- 
-- The auth.users table is managed by Supabase automatically
-- Once a user signs up via the app, their UUID is created and you can insert their profile data
--
-- To add test data:
-- 1. Sign up a user through the app
-- 2. Find their UUID from auth.users via Supabase dashboard
-- 3. Then insert their profile data using that UUID
--
-- Example (replace UUID_FROM_SUPABASE_AUTH with actual UUID):
-- INSERT INTO students (user_id, name, branch, cgpa, skills)
-- VALUES ('UUID_FROM_SUPABASE_AUTH', 'Raj Kumar', 'CSE', 8.5, ARRAY['Python', 'JavaScript', 'React']);

-- ================== TRIGGERS ==================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_drives_updated_at BEFORE UPDATE ON job_drives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================== ENABLE REALTIME ==================

-- Enable Realtime for tables
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE job_drives;
ALTER PUBLICATION supabase_realtime ADD TABLE applications;
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE companies;

-- Done! Schema is ready for deployment.
