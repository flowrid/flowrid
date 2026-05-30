-- Migration: 创建 avatars 存储桶
-- 在 Supabase SQL Editor 中执行，然后在 Storage 页面创建 bucket

-- 1. 在 Supabase Dashboard → Storage → 创建新 bucket
--    Name: avatars
--    Public bucket: ON
--    File size limit: 5MB
--    Allowed MIME types: image/png, image/jpeg, image/webp, image/gif

-- 2. 设置公开访问策略
-- 在 Supabase Storage → avatars → Policies 中创建：
--    Policy name: Public read access
--    Allowed operation: SELECT
--    Target roles: (leave blank for public)
--    USING expression: true

-- 3. 设置上传策略
--    Policy name: Users can upload their own avatar
--    Allowed operation: INSERT
--    Target roles: authenticated
--    USING expression: (storage.foldername(name))[1] = auth.uid()::text
