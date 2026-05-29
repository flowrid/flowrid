-- Migration: 添加 hero_image 字段存储 3PL 仓库/品牌大图
-- 在 Supabase SQL Editor 中执行

ALTER TABLE pl_providers ADD COLUMN IF NOT EXISTS hero_image TEXT;
