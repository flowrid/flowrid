-- Migration: 创建 saved_3pls 表用于收藏
-- 在 Supabase SQL Editor 中执行

CREATE TABLE IF NOT EXISTS saved_3pls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- 允许用户读取自己的收藏
ALTER TABLE saved_3pls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own saved 3PLs" ON saved_3pls
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved 3PLs" ON saved_3pls
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved 3PLs" ON saved_3pls
  FOR DELETE USING (auth.uid() = user_id);
