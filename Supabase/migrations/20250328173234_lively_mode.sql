/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text)
      - role (text)
      - created_at (timestamp)
    - conversations
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - title (text)
      - created_at (timestamp)
    - messages
      - id (uuid, primary key)
      - conversation_id (uuid, foreign key)
      - content (text)
      - role (text)
      - created_at (timestamp)
    - essays
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - title (text)
      - content (text)
      - feedback (text)
      - created_at (timestamp)
    - study_plans
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - title (text)
      - description (text)
      - schedule (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD messages in their conversations"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Essays table
CREATE TABLE IF NOT EXISTS essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own essays"
  ON essays
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Study plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  schedule jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own study plans"
  ON study_plans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
