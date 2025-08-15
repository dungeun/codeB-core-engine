const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJsonFields() {
  try {
    const campaigns = await prisma.campaign.findMany({
      take: 5
    });
    
    console.log('Checking JSON fields in first 5 campaigns:\n');
    
    campaigns.forEach((campaign, index) => {
      console.log(`Campaign ${index + 1}: ${campaign.title}`);
      console.log('- hashtags:', campaign.hashtags);
      console.log('- is valid JSON?', isValidJson(campaign.hashtags));
      console.log('- detailedRequirements:', campaign.detailedRequirements?.substring(0, 50) + '...');
      console.log('- is valid JSON?', isValidJson(campaign.detailedRequirements));
      console.log('- deliverables:', campaign.deliverables?.substring(0, 50) + '...');
      console.log('- is valid JSON?', isValidJson(campaign.deliverables));
      console.log('- productImages:', campaign.productImages);
      console.log('- is valid JSON?', isValidJson(campaign.productImages));
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function isValidJson(str) {
  if (!str) return false;
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

checkJsonFields();