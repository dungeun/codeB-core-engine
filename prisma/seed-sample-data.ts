import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

const SAMPLE_PLATFORMS = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'TWITTER']
const BUSINESS_CATEGORIES = ['패션', '뷰티', '음식', '여행', '기술', '라이프스타일', '스포츠', '게임', '교육', '헬스']
const INFLUENCER_CATEGORIES = ['패션', '뷰티', '음식', '여행', '기술', '라이프스타일', '스포츠', '게임', '교육', '헬스']
const CAMPAIGN_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']

async function createSampleBusinessUsers() {
  console.log('Creating 30 business users...')
  const businesses = []
  
  for (let i = 0; i < 30; i++) {
    const companyName = faker.company.name()
    const business = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: '$2b$10$dummy.hash.for.testing',
        name: faker.person.fullName(),
        type: 'BUSINESS',
        status: 'ACTIVE',
        businessProfile: {
          create: {
            companyName,
            businessNumber: faker.string.numeric(10),
            representativeName: faker.person.fullName(),
            businessAddress: faker.location.streetAddress(),
            businessCategory: faker.helpers.arrayElement(BUSINESS_CATEGORIES),
            isVerified: faker.datatype.boolean(0.7)
          }
        }
      },
      include: {
        businessProfile: true
      }
    })
    businesses.push(business)
  }
  
  console.log(`Created ${businesses.length} business users`)
  return businesses
}

async function createSampleInfluencers() {
  console.log('Creating 30 influencer users...')
  const influencers = []
  
  for (let i = 0; i < 30; i++) {
    const categories = faker.helpers.arrayElements(INFLUENCER_CATEGORIES, { min: 1, max: 3 })
    const influencer = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: '$2b$10$dummy.hash.for.testing',
        name: faker.person.fullName(),
        type: 'INFLUENCER',
        status: 'ACTIVE',
        profile: {
          create: {
            bio: faker.lorem.paragraph(),
            profileImage: faker.image.avatar(),
            phone: faker.phone.number(),
            instagram: `@${faker.internet.userName()}`,
            instagramFollowers: faker.number.int({ min: 1000, max: 500000 }),
            youtube: `${faker.internet.userName()}`,
            youtubeSubscribers: faker.number.int({ min: 500, max: 100000 }),
            tiktok: `@${faker.internet.userName()}`,
            tiktokFollowers: faker.number.int({ min: 2000, max: 200000 }),
            averageEngagementRate: faker.number.float({ min: 1.5, max: 8.5, fractionDigits: 1 }),
            categories: JSON.stringify(categories),
            isVerified: faker.datatype.boolean(0.6)
          }
        }
      },
      include: {
        profile: true
      }
    })
    influencers.push(influencer)
  }
  
  console.log(`Created ${influencers.length} influencer users`)
  return influencers
}

async function createSampleCampaigns(businesses: any[]) {
  console.log('Creating 30 campaigns...')
  const campaigns = []
  
  for (let i = 0; i < 30; i++) {
    const business = faker.helpers.arrayElement(businesses)
    const startDate = faker.date.future({ years: 0.5 })
    const endDate = faker.date.future({ years: 0.5, refDate: startDate })
    const budget = faker.number.float({ min: 500000, max: 10000000, fractionDigits: 0 })
    
    const hashtags = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => 
      `#${faker.word.noun()}`
    )
    
    const campaign = await prisma.campaign.create({
      data: {
        businessId: business.id,
        title: `${faker.company.buzzPhrase()} 캠페인`,
        description: faker.lorem.paragraphs(2),
        platform: faker.helpers.arrayElement(SAMPLE_PLATFORMS),
        budget,
        targetFollowers: faker.number.int({ min: 10000, max: 500000 }),
        startDate,
        endDate,
        requirements: faker.lorem.paragraph(),
        hashtags: JSON.stringify(hashtags),
        imageUrl: faker.image.url(),
        status: faker.helpers.arrayElement(CAMPAIGN_STATUSES),
        isPaid: faker.datatype.boolean(0.3)
      }
    })
    campaigns.push(campaign)
  }
  
  console.log(`Created ${campaigns.length} campaigns`)
  return campaigns
}

async function createSampleApplications(campaigns: any[], influencers: any[]) {
  console.log('Creating sample campaign applications...')
  const applications = []
  
  // Create 2-5 applications per campaign
  for (const campaign of campaigns) {
    const numApplications = faker.number.int({ min: 2, max: 5 })
    const campaignInfluencers = faker.helpers.arrayElements(influencers, numApplications)
    
    for (const influencer of campaignInfluencers) {
      const application = await prisma.campaignApplication.create({
        data: {
          campaignId: campaign.id,
          influencerId: influencer.id,
          message: faker.lorem.paragraph(),
          proposedPrice: faker.number.float({ min: 100000, max: 2000000, fractionDigits: 0 }),
          status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED']),
          reviewedAt: faker.datatype.boolean(0.6) ? faker.date.recent() : null,
          rejectionReason: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null
        }
      })
      applications.push(application)
    }
  }
  
  console.log(`Created ${applications.length} campaign applications`)
  return applications
}

async function createSampleContent(applications: any[]) {
  console.log('Creating sample content...')
  const contents = []
  
  // Create content for approved applications
  const approvedApplications = applications.filter(app => app.status === 'APPROVED')
  
  for (const application of approvedApplications) {
    const numContents = faker.number.int({ min: 1, max: 3 })
    
    for (let i = 0; i < numContents; i++) {
      const content = await prisma.content.create({
        data: {
          applicationId: application.id,
          contentUrl: faker.internet.url(),
          description: faker.lorem.paragraph(),
          platform: faker.helpers.arrayElement(SAMPLE_PLATFORMS),
          status: faker.helpers.arrayElement(['PENDING_REVIEW', 'APPROVED']),
          feedback: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : null,
          reviewedAt: faker.datatype.boolean(0.6) ? faker.date.recent() : null
        }
      })
      contents.push(content)
    }
  }
  
  console.log(`Created ${contents.length} content items`)
  return contents
}

async function createSamplePayments(campaigns: any[], influencers: any[]) {
  console.log('Creating sample payments...')
  const payments = []
  
  // Create payments for some campaigns
  for (let i = 0; i < 20; i++) {
    const campaign = faker.helpers.arrayElement(campaigns)
    const user = faker.helpers.arrayElement([...campaigns.map(c => ({ id: c.businessId })), ...influencers])
    
    const payment = await prisma.payment.create({
      data: {
        orderId: `ORDER_${faker.string.alphanumeric(10)}`,
        campaignId: campaign.id,
        userId: user.id,
        amount: faker.number.float({ min: 50000, max: 2000000, fractionDigits: 0 }),
        type: faker.helpers.arrayElement(['CAMPAIGN_PAYMENT', 'INFLUENCER_SETTLEMENT']),
        status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'FAILED']),
        paymentMethod: faker.helpers.arrayElement(['CARD', 'BANK_TRANSFER']),
        paymentKey: faker.string.uuid(),
        approvedAt: faker.datatype.boolean(0.7) ? faker.date.recent() : null,
        receipt: faker.datatype.boolean(0.8) ? faker.internet.url() : null
      }
    })
    payments.push(payment)
  }
  
  console.log(`Created ${payments.length} payments`)
  return payments
}

async function createSampleNotifications(users: any[]) {
  console.log('Creating sample notifications...')
  const notifications = []
  
  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users)
    const types = ['CAMPAIGN_UPDATE', 'APPLICATION_STATUS', 'PAYMENT_UPDATE', 'CONTENT_REVIEW']
    
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: faker.helpers.arrayElement(types),
        title: faker.lorem.sentence(),
        message: faker.lorem.paragraph(),
        actionUrl: faker.datatype.boolean(0.5) ? faker.internet.url() : null,
        readAt: faker.datatype.boolean(0.4) ? faker.date.recent() : null
      }
    })
    notifications.push(notification)
  }
  
  console.log(`Created ${notifications.length} notifications`)
  return notifications
}

async function createSampleFollows(influencers: any[]) {
  console.log('Creating sample follow relationships...')
  const follows = []
  
  for (let i = 0; i < 40; i++) {
    const follower = faker.helpers.arrayElement(influencers)
    const following = faker.helpers.arrayElement(influencers.filter(inf => inf.id !== follower.id))
    
    try {
      const follow = await prisma.follow.create({
        data: {
          followerId: follower.id,
          followingId: following.id
        }
      })
      follows.push(follow)
    } catch (error) {
      // Skip duplicate follows
    }
  }
  
  console.log(`Created ${follows.length} follow relationships`)
  return follows
}

async function createSamplePosts(users: any[]) {
  console.log('Creating sample community posts...')
  const posts = []
  
  for (let i = 0; i < 25; i++) {
    const author = faker.helpers.arrayElement(users)
    const categories = ['notice', 'tips', 'review', 'question', 'free']
    
    const post = await prisma.post.create({
      data: {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(3),
        authorId: author.id,
        category: faker.helpers.arrayElement(categories),
        status: 'PUBLISHED',
        views: faker.number.int({ min: 0, max: 500 }),
        likes: faker.number.int({ min: 0, max: 50 }),
        isPinned: faker.datatype.boolean(0.1)
      }
    })
    posts.push(post)
  }
  
  console.log(`Created ${posts.length} community posts`)
  return posts
}

async function main() {
  console.log('🚀 Starting sample data generation...')
  
  try {
    // Create users
    const businesses = await createSampleBusinessUsers()
    const influencers = await createSampleInfluencers()
    const allUsers = [...businesses, ...influencers]
    
    // Create campaigns
    const campaigns = await createSampleCampaigns(businesses)
    
    // Create applications
    const applications = await createSampleApplications(campaigns, influencers)
    
    // Create content
    const contents = await createSampleContent(applications)
    
    // Create payments
    const payments = await createSamplePayments(campaigns, allUsers)
    
    // Create notifications
    const notifications = await createSampleNotifications(allUsers)
    
    // Create follows (influencer to influencer)
    const follows = await createSampleFollows(influencers)
    
    // Create community posts
    const posts = await createSamplePosts(allUsers)
    
    console.log('\n✅ Sample data generation completed successfully!')
    console.log(`📊 Generated:`)
    console.log(`   - ${businesses.length} business users`)
    console.log(`   - ${influencers.length} influencers`)
    console.log(`   - ${campaigns.length} campaigns`)
    console.log(`   - ${applications.length} campaign applications`)
    console.log(`   - ${contents.length} content items`)
    console.log(`   - ${payments.length} payments`)
    console.log(`   - ${notifications.length} notifications`)
    console.log(`   - ${follows.length} follow relationships`)
    console.log(`   - ${posts.length} community posts`)
    
  } catch (error) {
    console.error('❌ Error generating sample data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

export { main as generateSampleData }