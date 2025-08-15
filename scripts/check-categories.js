const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    // 모든 비즈니스 프로필의 카테고리 확인
    const businessProfiles = await prisma.businessProfile.findMany({
      include: {
        user: {
          include: {
            campaigns: true
          }
        }
      }
    });

    console.log('=== 비즈니스 프로필 카테고리 현황 ===');
    const categoryCount = {};
    
    businessProfiles.forEach(profile => {
      const category = profile.businessCategory || 'None';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      
      if (profile.user.campaigns.length > 0) {
        console.log(`Company: ${profile.companyName}, Category: ${category}, Campaigns: ${profile.user.campaigns.length}`);
      }
    });
    
    console.log('\n=== 카테고리별 비즈니스 수 ===');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`${category}: ${count}`);
    });

    // 캠페인과 비즈니스 카테고리 매칭 확인
    const campaigns = await prisma.campaign.findMany({
      include: {
        business: {
          include: {
            businessProfile: true
          }
        }
      },
      take: 10
    });

    console.log('\n=== 캠페인 샘플 (10개) ===');
    campaigns.forEach(campaign => {
      const category = campaign.business.businessProfile?.businessCategory || 'None';
      console.log(`Campaign: ${campaign.title}`);
      console.log(`  Business: ${campaign.business.businessProfile?.companyName || campaign.business.name}`);
      console.log(`  Category: ${category}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();