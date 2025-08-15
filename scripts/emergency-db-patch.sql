-- Emergency patch for production database
-- This adds missing columns with safe defaults
-- Run this directly on the production database

-- Add missing columns to campaigns table one by one
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deliverables TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "detailedRequirements" TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '전국';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "maxApplicants" INTEGER DEFAULT 100;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "productImages" TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "productIntro" TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "viewCount" INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "detailImages" TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS platforms TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS "rewardAmount" DOUBLE PRECISION DEFAULT 0;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name IN (
    'deliverables', 
    'detailedRequirements', 
    'location', 
    'maxApplicants', 
    'productImages', 
    'productIntro', 
    'viewCount', 
    'detailImages', 
    'platforms', 
    'rewardAmount'
)
ORDER BY column_name;