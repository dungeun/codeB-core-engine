import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function createRealAccounts() {
  console.log('Creating real accounts with proper passwords...')
  
  try {
    // 실제 비밀번호 해시 생성
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // 관리자 계정 생성/업데이트
    const admin = await prisma.user.upsert({
      where: { email: 'admin@linkpick.co.kr' },
      update: {
        password: hashedPassword,
        name: '관리자',
        type: 'ADMIN',
        status: 'ACTIVE'
      },
      create: {
        email: 'admin@linkpick.co.kr',
        password: hashedPassword,
        name: '관리자',
        type: 'ADMIN',
        status: 'ACTIVE'
      }
    })
    console.log('Admin account created/updated:', admin.email)
    
    // 비즈니스 계정 생성/업데이트
    const business = await prisma.user.upsert({
      where: { email: 'business@company.com' },
      update: {
        password: hashedPassword,
        name: '테스트 비즈니스',
        type: 'BUSINESS',
        status: 'ACTIVE'
      },
      create: {
        email: 'business@company.com',
        password: hashedPassword,
        name: '테스트 비즈니스',
        type: 'BUSINESS',
        status: 'ACTIVE',
        businessProfile: {
          create: {
            companyName: '(주)테스트기업',
            businessNumber: '123-45-67890',
            representativeName: '홍길동',
            businessAddress: '서울시 강남구 테헤란로 123',
            businessCategory: '마케팅',
            isVerified: true
          }
        }
      },
      include: {
        businessProfile: true
      }
    })
    console.log('Business account created/updated:', business.email)
    
    // 인플루언서 계정 생성/업데이트
    const influencer = await prisma.user.upsert({
      where: { email: 'influencer@example.com' },
      update: {
        password: hashedPassword,
        name: '테스트 인플루언서',
        type: 'INFLUENCER',
        status: 'ACTIVE'
      },
      create: {
        email: 'influencer@example.com',
        password: hashedPassword,
        name: '테스트 인플루언서',
        type: 'INFLUENCER',
        status: 'ACTIVE',
        profile: {
          create: {
            bio: '테스트 인플루언서입니다',
            profileImage: 'https://example.com/profile.jpg',
            instagram: '@test_influencer',
            instagramFollowers: 50000,
            categories: JSON.stringify(['패션', '뷰티']),
            isVerified: true
          }
        }
      },
      include: {
        profile: true
      }
    })
    console.log('Influencer account created/updated:', influencer.email)
    
    // 추가 테스트 계정들 생성
    const testAccounts = [
      {
        email: 'test.business@example.com',
        name: '테스트 비즈니스 2',
        type: 'BUSINESS' as const,
        businessProfile: {
          companyName: '테스트 컴퍼니',
          businessNumber: '987-65-43210',
          representativeName: '김영희',
          businessAddress: '서울시 송파구 올림픽로 300',
          businessCategory: 'IT',
          isVerified: true
        }
      },
      {
        email: 'test.influencer@example.com',
        name: '테스트 인플루언서 2',
        type: 'INFLUENCER' as const,
        profile: {
          bio: '라이프스타일 인플루언서',
          profileImage: 'https://example.com/profile2.jpg',
          instagram: '@lifestyle_influencer',
          instagramFollowers: 30000,
          categories: JSON.stringify(['라이프스타일', '여행']),
          isVerified: true
        }
      }
    ]
    
    for (const account of testAccounts) {
      const user = await prisma.user.upsert({
        where: { email: account.email },
        update: {
          password: hashedPassword,
          name: account.name,
          type: account.type,
          status: 'ACTIVE'
        },
        create: {
          email: account.email,
          password: hashedPassword,
          name: account.name,
          type: account.type,
          status: 'ACTIVE',
          ...(account.type === 'BUSINESS' && account.businessProfile ? {
            businessProfile: {
              create: account.businessProfile
            }
          } : {}),
          ...(account.type === 'INFLUENCER' && account.profile ? {
            profile: {
              create: account.profile
            }
          } : {})
        }
      })
      console.log(`${account.type} account created/updated:`, user.email)
    }
    
    console.log('\n✅ Real accounts created successfully!')
    console.log('\n로그인 정보:')
    console.log('- 관리자: admin@linkpick.co.kr / password123')
    console.log('- 비즈니스: business@company.com / password123')
    console.log('- 인플루언서: influencer@example.com / password123')
    console.log('- 테스트 비즈니스 2: test.business@example.com / password123')
    console.log('- 테스트 인플루언서 2: test.influencer@example.com / password123')
    
  } catch (error) {
    console.error('❌ Error creating real accounts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
createRealAccounts()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

export { createRealAccounts }