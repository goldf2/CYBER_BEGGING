-- Supabase 初始化脚本
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 创建捐赠记录表
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount INT NOT NULL,
  donor_name VARCHAR(100) DEFAULT '匿名用户',
  transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全 (RLS)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取捐赠记录（公开展示）
CREATE POLICY "Allow public read access on donations"
  ON donations FOR SELECT
  USING (true);

-- service_role_key 会自动绕过 RLS，无需额外写入策略

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_donations_created_at
  ON donations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_donations_transaction_id
  ON donations (transaction_id);

COMMENT ON TABLE donations IS '捐赠记录表';
COMMENT ON COLUMN donations.amount IS '捐赠金额（单位：分）';
COMMENT ON COLUMN donations.donor_name IS '捐赠者名称';
COMMENT ON COLUMN donations.transaction_id IS '交易号';
