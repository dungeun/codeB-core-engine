const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting local database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@linkpick.co.kr' },
    update: {},
    create: {
      email: 'admin@linkpick.co.kr',
      password: adminPassword,
      name: 'LinkPick Admin',
      type: 'ADMIN',
      status: 'ACTIVE',
      verified: true,
    }
  })
  console.log('✅ Admin user created:', admin.email)

  // Create test business user
  const businessPassword = await bcrypt.hash('business123!', 10)
  const businessUser = await prisma.user.upsert({
    where: { email: 'business@company.com' },
    update: {},
    create: {
      email: 'business@company.com',
      password: businessPassword,
      name: '테스트 기업',
      type: 'BUSINESS',
      status: 'ACTIVE',
      verified: true,
      businessProfile: {
        create: {
          companyName: '테스트 주식회사',
          businessNumber: '123-45-67890',
          representativeName: '김대표',
          businessAddress: '서울특별시 강남구 테헤란로 123',
          businessCategory: '이커머스',
          isVerified: true,
        }
      }
    }
  })
  console.log('✅ Business user created:', businessUser.email)

  // Create test influencer user
  const influencerPassword = await bcrypt.hash('user123!', 10)
  const influencerUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: influencerPassword,
      name: '테스트 인플루언서',
      type: 'INFLUENCER',
      status: 'ACTIVE',
      verified: true,
      profile: {
        create: {
          bio: '패션과 라이프스타일을 공유하는 인플루언서입니다.',
          instagram: '@test_influencer',
          instagramFollowers: 50000,
          youtube: 'TestInfluencer',
          youtubeSubscribers: 30000,
          categories: JSON.stringify(['패션', '라이프스타일']),
          isVerified: true,
        }
      }
    }
  })
  console.log('✅ Influencer user created:', influencerUser.email)

  // Create sample campaign
  const campaign = await prisma.campaign.create({
    data: {
      businessId: businessUser.id,
      title: 'LinkPick 테스트 캠페인',
      description: 'LinkPick 플랫폼 테스트를 위한 캠페인입니다.',
      platform: 'INSTAGRAM',
      budget: 5000000,
      targetFollowers: 10000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      requirements: '- 팔로워 1만명 이상\n- 참여율 3% 이상',
      hashtags: JSON.stringify(['LinkPick', '테스트']),
      status: 'ACTIVE',
      isPaid: true,
    }
  })
  console.log('✅ Sample campaign created:', campaign.title)

  console.log('✅ Local database seed completed!')
  console.log('\n📝 Login credentials:')
  console.log('Admin: admin@linkpick.co.kr / admin123!')
  console.log('Business: business@company.com / business123!')
  console.log('Influencer: user@example.com / user123!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })