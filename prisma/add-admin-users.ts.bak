import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as bcrypt from 'bcryptjs'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// 랜덤 한국 이름 생성
const KOREAN_LAST_NAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '오', '한', '신', '서', '권']
const KOREAN_FIRST_NAMES = ['민준', '서연', '지호', '민서', '준서', '지민', '수아', '지우', '서준', '하은', '도윤', '서아', '주원', '하윤', '시우']

async function createAdditionalAdmins() {
  console.log('👨‍💼 추가 관리자 계정 2명 생성 중...')
  
  const hashedPassword = await bcrypt.hash('admin123!', 10)
  const admins = []
  
  // 관리자 1
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin2@linkpick.co.kr',
      password: hashedPassword,
      name: '김지원 (운영팀)',
      type: 'ADMIN',
      status: 'ACTIVE',
      verified: true,
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1일 전
    }
  })
  admins.push(admin1)
  
  // 관리자 2
  const admin2 = await prisma.user.create({
    data: {
      email: 'admin3@linkpick.co.kr',
      password: hashedPassword,
      name: '박민수 (개발팀)',
      type: 'ADMIN',
      status: 'ACTIVE',
      verified: true,
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2일 전
    }
  })
  admins.push(admin2)
  
  console.log(`✅ ${admins.length}명의 추가 관리자 생성 완료`)
  return admins
}

async function createAdditionalUsers() {
  console.log('👥 추가 일반 사용자 28명 생성 중...')
  
  const hashedPassword = await bcrypt.hash('user123!', 10)
  const users = []
  const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING', 'INACTIVE', 'SUSPENDED']
  
  for (let i = 0; i < 28; i++) {
    const lastName = KOREAN_LAST_NAMES[Math.floor(Math.random() * KOREAN_LAST_NAMES.length)]
    const firstName = KOREAN_FIRST_NAMES[Math.floor(Math.random() * KOREAN_FIRST_NAMES.length)]
    const name = lastName + firstName
    const isInfluencer = i % 2 === 0
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const user = await prisma.user.create({
      data: {
        email: `user${i + 100}@example.com`,
        password: hashedPassword,
        name: name,
        type: isInfluencer ? 'INFLUENCER' : 'BUSINESS',
        status: status,
        verified: Math.random() > 0.3,
        lastLogin: status === 'ACTIVE' 
          ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30) // 최근 30일 내
          : status === 'INACTIVE'
          ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) // 60일 전
          : null,
        profile: isInfluencer ? {
          create: {
            bio: `안녕하세요, ${name}입니다. 다양한 콘텐츠를 제작하고 있습니다.`,
            instagram: `@${name.toLowerCase().replace(/\s/g, '')}`,
            instagramFollowers: Math.floor(Math.random() * 100000) + 1000,
            youtube: Math.random() > 0.5 ? `youtube.com/@${name.toLowerCase()}` : null,
            youtubeSubscribers: Math.random() > 0.5 ? Math.floor(Math.random() * 50000) + 500 : null,
            categories: JSON.stringify(['뷰티', '패션', '라이프스타일'][Math.floor(Math.random() * 3)])
          }
        } : undefined,
        businessProfile: !isInfluencer ? {
          create: {
            companyName: `${name} 컴퍼니`,
            businessNumber: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90000) + 10000}`,
            representativeName: name,
            businessAddress: `서울시 ${['강남구', '서초구', '송파구', '마포구', '성동구'][Math.floor(Math.random() * 5)]} 도로명 ${Math.floor(Math.random() * 100) + 1}`,
            businessCategory: ['패션', '뷰티', '푸드', '테크', '라이프스타일'][Math.floor(Math.random() * 5)],
            isVerified: status === 'ACTIVE' && Math.random() > 0.3
          }
        } : undefined
      },
      include: {
        profile: true,
        businessProfile: true
      }
    })
    
    users.push(user)
    console.log(`  - ${i + 1}/28: ${name} (${isInfluencer ? '인플루언서' : '업체'}) 생성 완료`)
  }
  
  console.log(`✅ ${users.length}명의 추가 사용자 생성 완료`)
  return users
}

async function main() {
  console.log('🚀 추가 관리자 및 사용자 생성 시작...')
  
  try {
    // 1. 추가 관리자 생성
    const admins = await createAdditionalAdmins()
    
    // 2. 추가 일반 사용자 생성
    const users = await createAdditionalUsers()
    
    console.log('\n🎉 추가 사용자 생성 완료!')
    console.log(`📊 생성된 데이터:`)
    console.log(`   - 관리자: ${admins.length}명`)
    console.log(`   - 일반 사용자: ${users.length}명`)
    console.log(`     - 인플루언서: ${users.filter(u => u.type === 'INFLUENCER').length}명`)
    console.log(`     - 업체: ${users.filter(u => u.type === 'BUSINESS').length}명`)
    
  } catch (error) {
    console.error('❌ 추가 사용자 생성 실패:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })