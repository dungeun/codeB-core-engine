#!/usr/bin/env node

/**
 * Production database migration script
 * This script generates and applies Prisma migrations to production database
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting production database migration...\n');

try {
  // Load production environment variables
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });
  
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n🔄 Creating migration...');
  execSync('npx prisma migrate dev --name add_missing_campaign_fields --create-only', { stdio: 'inherit' });
  
  console.log('\n🚀 Applying migration to production database...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('\n✅ Migration completed successfully!');
  
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}