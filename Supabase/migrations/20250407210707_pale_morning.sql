/*
  # Add Teacher Codes and Student Relationships

  1. New Tables
    - teacher_codes
      - id (uuid, primary key)
      - teacher_id (uuid, foreign key)
      - code (text)
      - created_at (timestamp)
    - student_teachers
      - id (uuid, primary key)
      - student_id (uuid, foreign key)
      - teacher_id (uuid, foreign key)
      - created_at (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for teachers and students
*/

-- Teacher codes table
CREATE TABLE IF NOT EXISTS teacher_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teacher_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their codes"
  ON teacher_codes
  FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Student-teacher relationships table
CREATE TABLE IF NOT EXISTS student_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, teacher_id)
);

ALTER TABLE student_teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their students"
  ON student_teachers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view their teachers"
  ON student_teachers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Add view for teacher to see student conversations
CREATE VIEW teacher_student_conversations AS
SELECT 
  c.*,
  st.teacher_id
FROM conversations c
JOIN student_teachers st ON c.user_id = st.student_id;

-- Add RLS policy for the view
ALTER VIEW teacher_student_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their students' conversations"
  ON teacher_student_conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);
