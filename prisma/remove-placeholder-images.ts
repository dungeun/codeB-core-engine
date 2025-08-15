import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function removePlaceholderImages() {
  console.log('Removing placeholder image references from database...')
  
  try {
    // Campaign 테이블에서 placeholder 이미지 제거
    const campaignResult = await prisma.campaign.updateMany({
      where: {
        OR: [
          { imageUrl: 'placeholder-image.jpg' },
          { imageUrl: '/placeholder-image.jpg' },
          { headerImageUrl: 'placeholder-image.jpg' },
          { headerImageUrl: '/placeholder-image.jpg' },
          { thumbnailImageUrl: 'placeholder-image.jpg' },
          { thumbnailImageUrl: '/placeholder-image.jpg' }
        ]
      },
      data: {
        imageUrl: null,
        headerImageUrl: null,
        thumbnailImageUrl: null
      }
    })
    console.log(`Updated ${campaignResult.count} campaigns`)

    // Profile 테이블에서 placeholder 이미지 제거 (인플루언서)
    const profileResult = await prisma.profile.updateMany({
      where: {
        OR: [
          { profileImage: 'placeholder-image.jpg' },
          { profileImage: '/placeholder-image.jpg' }
        ]
      },
      data: {
        profileImage: null
      }
    })
    console.log(`Updated ${profileResult.count} influencer profiles`)

    // BusinessProfile은 profileImage 필드가 없으므로 스킵
    console.log('BusinessProfile table does not have profileImage field - skipping')

    // Post 테이블도 thumbnailUrl 필드가 없으므로 스킵
    console.log('Post table does not have thumbnailUrl field - skipping')

    // detailImages와 productImages JSON 필드 처리
    const campaignsWithJsonImages = await prisma.campaign.findMany({
      where: {
        OR: [
          { detailImages: { not: null } },
          { productImages: { not: null } }
        ]
      }
    })

    let jsonUpdatedCount = 0
    for (const campaign of campaignsWithJsonImages) {
      let updated = false
      const updateData: any = {}

      // detailImages 처리
      if (campaign.detailImages && Array.isArray(campaign.detailImages)) {
        const filteredDetailImages = (campaign.detailImages as string[]).filter(
          img => img !== 'placeholder-image.jpg' && img !== '/placeholder-image.jpg'
        )
        if (filteredDetailImages.length !== (campaign.detailImages as string[]).length) {
          updateData.detailImages = filteredDetailImages.length > 0 ? filteredDetailImages : null
          updated = true
        }
      }

      // productImages 처리
      if (campaign.productImages && Array.isArray(campaign.productImages)) {
        const filteredProductImages = (campaign.productImages as string[]).filter(
          img => img !== 'placeholder-image.jpg' && img !== '/placeholder-image.jpg'
        )
        if (filteredProductImages.length !== (campaign.productImages as string[]).length) {
          updateData.productImages = filteredProductImages.length > 0 ? filteredProductImages : null
          updated = true
        }
      }

      if (updated) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: updateData
        })
        jsonUpdatedCount++
      }
    }
    console.log(`Updated ${jsonUpdatedCount} campaigns with JSON image fields`)

    console.log('\n✅ Successfully removed all placeholder image references!')
    
  } catch (error) {
    console.error('❌ Error removing placeholder images:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
removePlaceholderImages()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

export { removePlaceholderImages }