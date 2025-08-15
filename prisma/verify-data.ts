import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function verifyData() {
  console.log('🔍 Verifying sample data in database...\n')
  
  try {
    // Count users by type
    const businessCount = await prisma.user.count({
      where: { type: 'BUSINESS' }
    })
    
    const influencerCount = await prisma.user.count({
      where: { type: 'INFLUENCER' }
    })
    
    console.log(`👥 Users:`)
    console.log(`   - Business users: ${businessCount}`)
    console.log(`   - Influencers: ${influencerCount}`)
    console.log(`   - Total users: ${businessCount + influencerCount}\n`)
    
    // Count campaigns by status
    const campaignsByStatus = await prisma.campaign.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })
    
    console.log(`📋 Campaigns by status:`)
    campaignsByStatus.forEach(group => {
      console.log(`   - ${group.status}: ${group._count.status}`)
    })
    
    const totalCampaigns = await prisma.campaign.count()
    console.log(`   - Total campaigns: ${totalCampaigns}\n`)
    
    // Count campaign applications by status
    const applicationsByStatus = await prisma.campaignApplication.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })
    
    console.log(`📝 Campaign applications by status:`)
    applicationsByStatus.forEach(group => {
      console.log(`   - ${group.status}: ${group._count.status}`)
    })
    
    const totalApplications = await prisma.campaignApplication.count()
    console.log(`   - Total applications: ${totalApplications}\n`)
    
    // Count content by status
    const contentByStatus = await prisma.content.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })
    
    console.log(`📄 Content by status:`)
    contentByStatus.forEach(group => {
      console.log(`   - ${group.status}: ${group._count.status}`)
    })
    
    const totalContent = await prisma.content.count()
    console.log(`   - Total content: ${totalContent}\n`)
    
    // Count payments by status
    const paymentsByStatus = await prisma.payment.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })
    
    console.log(`💰 Payments by status:`)
    paymentsByStatus.forEach(group => {
      console.log(`   - ${group.status}: ${group._count.status}`)
    })
    
    const totalPayments = await prisma.payment.count()
    console.log(`   - Total payments: ${totalPayments}\n`)
    
    // Count other data
    const notificationCount = await prisma.notification.count()
    const followCount = await prisma.follow.count()
    const postCount = await prisma.post.count()
    
    console.log(`📊 Other data:`)
    console.log(`   - Notifications: ${notificationCount}`)
    console.log(`   - Follow relationships: ${followCount}`)
    console.log(`   - Community posts: ${postCount}\n`)
    
    // Sample queries to demonstrate relationships
    console.log(`🔗 Sample relationship queries:`)
    
    // Get a business with their campaigns
    const businessWithCampaigns = await prisma.user.findFirst({
      where: { type: 'BUSINESS' },
      include: {
        campaigns: {
          take: 3,
          select: {
            id: true,
            title: true,
            status: true,
            budget: true
          }
        },
        businessProfile: {
          select: {
            companyName: true,
            businessCategory: true
          }
        }
      }
    })
    
    if (businessWithCampaigns) {
      console.log(`   - Business: ${businessWithCampaigns.businessProfile?.companyName}`)
      console.log(`     Campaigns (first 3):`)
      businessWithCampaigns.campaigns.forEach(campaign => {
        console.log(`       • ${campaign.title} (${campaign.status}) - ₩${campaign.budget.toLocaleString()}`)
      })
      console.log()
    }
    
    // Get an influencer with their applications
    const influencerWithApplications = await prisma.user.findFirst({
      where: { type: 'INFLUENCER' },
      include: {
        applications: {
          take: 3,
          select: {
            id: true,
            status: true,
            proposedPrice: true,
            campaign: {
              select: {
                title: true
              }
            }
          }
        },
        profile: {
          select: {
            instagramFollowers: true,
            averageEngagementRate: true
          }
        }
      }
    })
    
    if (influencerWithApplications) {
      console.log(`   - Influencer: ${influencerWithApplications.name}`)
      console.log(`     Instagram followers: ${influencerWithApplications.profile?.instagramFollowers?.toLocaleString()}`)
      console.log(`     Engagement rate: ${influencerWithApplications.profile?.averageEngagementRate}%`)
      console.log(`     Applications (first 3):`)
      influencerWithApplications.applications.forEach(app => {
        console.log(`       • ${app.campaign.title} (${app.status}) - ₩${app.proposedPrice?.toLocaleString()}`)
      })
      console.log()
    }
    
    // Get campaign with applications and content
    const campaignWithDetails = await prisma.campaign.findFirst({
      where: {
        applications: {
          some: {
            status: 'APPROVED'
          }
        }
      },
      include: {
        business: {
          select: {
            name: true,
            businessProfile: {
              select: {
                companyName: true
              }
            }
          }
        },
        applications: {
          where: {
            status: 'APPROVED'
          },
          take: 3,
          select: {
            id: true,
            influencer: {
              select: {
                name: true
              }
            },
            contents: {
              take: 2,
              select: {
                platform: true,
                status: true
              }
            }
          }
        }
      }
    })
    
    if (campaignWithDetails) {
      console.log(`   - Campaign: ${campaignWithDetails.title}`)
      console.log(`     Business: ${campaignWithDetails.business.businessProfile?.companyName}`)
      console.log(`     Budget: ₩${campaignWithDetails.budget.toLocaleString()}`)
      console.log(`     Approved applications (first 3):`)
      campaignWithDetails.applications.forEach(app => {
        console.log(`       • ${app.influencer.name}`)
        app.contents.forEach(content => {
          console.log(`         - ${content.platform} content (${content.status})`)
        })
      })
      console.log()
    }
    
    console.log('✅ Database verification completed successfully!')
    console.log('🎉 All sample data has been inserted and is accessible via relationships!')
    
  } catch (error) {
    console.error('❌ Error during verification:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the verification
verifyData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })