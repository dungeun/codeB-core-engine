-- Add missing columns to campaigns table
-- Run this SQL in your production database

-- Check if columns exist before adding them
DO $$ 
BEGIN
    -- Add deliverables column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='deliverables') THEN
        ALTER TABLE campaigns ADD COLUMN deliverables TEXT;
    END IF;
    
    -- Add maxApplicants column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='maxApplicants') THEN
        ALTER TABLE campaigns ADD COLUMN "maxApplicants" INTEGER DEFAULT 100;
    END IF;
    
    -- Add detailedRequirements column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='detailedRequirements') THEN
        ALTER TABLE campaigns ADD COLUMN "detailedRequirements" TEXT;
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='location') THEN
        ALTER TABLE campaigns ADD COLUMN location TEXT DEFAULT '전국';
    END IF;
    
    -- Add productImages column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='productImages') THEN
        ALTER TABLE campaigns ADD COLUMN "productImages" TEXT;
    END IF;
    
    -- Add productIntro column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='productIntro') THEN
        ALTER TABLE campaigns ADD COLUMN "productIntro" TEXT;
    END IF;
    
    -- Add viewCount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='viewCount') THEN
        ALTER TABLE campaigns ADD COLUMN "viewCount" INTEGER DEFAULT 0;
    END IF;
    
    -- Add detailImages column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='detailImages') THEN
        ALTER TABLE campaigns ADD COLUMN "detailImages" TEXT;
    END IF;
    
    -- Add platforms column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='platforms') THEN
        ALTER TABLE campaigns ADD COLUMN platforms TEXT;
    END IF;
    
    -- Add rewardAmount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='campaigns' AND column_name='rewardAmount') THEN
        ALTER TABLE campaigns ADD COLUMN "rewardAmount" DOUBLE PRECISION DEFAULT 0;
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
AND column_name IN ('deliverables', 'maxApplicants', 'detailedRequirements', 'location', 
                    'productImages', 'productIntro', 'viewCount', 'detailImages', 
                    'platforms', 'rewardAmount')
ORDER BY column_name;