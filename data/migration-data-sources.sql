-- ============================================
-- Migration: 数据来源标注系统
-- 为 pl_providers 增加 data_sources (JSONB) 和 data_last_verified (TIMESTAMPTZ)
-- ============================================

ALTER TABLE pl_providers
ADD COLUMN IF NOT EXISTS data_sources JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS data_last_verified TIMESTAMPTZ;
