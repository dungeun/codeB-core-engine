import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_TEMPLATES = [
  {
    name: '열정적인 콘텐츠 크리에이터',
    content: `안녕하세요! 저는 [플랫폼]에서 활동하는 콘텐츠 크리에이터입니다.

귀사의 캠페인에 관심을 갖게 된 이유:
- [구체적인 이유 1]
- [구체적인 이유 2]

제가 만들 콘텐츠의 특징:
- 고품질의 사진/영상 촬영
- 진정성 있는 리뷰와 스토리텔링
- 타겟 고객층과의 높은 상호작용

기대되는 성과:
- 브랜드 인지도 향상
- 실질적인 구매 전환
- 장기적인 브랜드 팬 확보

감사합니다!`,
    isPublic: true,
    category: 'general'
  },
  {
    name: '전문 리뷰어 소개',
    content: `안녕하세요, 전문 리뷰어 [이름]입니다.

[카테고리] 분야에서 [기간]년간 활동하며 다음과 같은 경험을 쌓았습니다:
- 누적 리뷰 콘텐츠 [숫자]개 이상 제작
- 평균 조회수 [숫자]회
- 팔로워 참여율 [퍼센트]%

이번 캠페인에서 제공할 수 있는 가치:
1. 상세하고 객관적인 제품 분석
2. 고품질 사진/영상 콘텐츠
3. SEO 최적화된 리뷰 작성
4. 팔로워들과의 적극적인 소통

귀사와 함께 성공적인 캠페인을 만들어가고 싶습니다.`,
    isPublic: true,
    category: 'general'
  },
  {
    name: '라이프스타일 인플루언서',
    content: `안녕하세요! 일상 속 특별함을 전하는 라이프스타일 인플루언서입니다.

제 콘텐츠의 강점:
✨ 자연스러운 일상 속 제품 노출
✨ 스토리텔링을 통한 감성적 접근
✨ 다양한 포맷 활용 (릴스, 스토리, 피드)

타겟 오디언스:
- [연령대] 여성/남성
- [관심사] 관심층
- 높은 구매력을 가진 팔로워

제안하는 콘텐츠 방향:
1. 언박싱 & 첫인상 리뷰
2. 일상 속 활용 모습
3. Before & After 비교
4. 팔로워 참여 이벤트

진정성 있는 콘텐츠로 브랜드 가치를 전달하겠습니다!`,
    isPublic: true,
    category: 'lifestyle'
  },
  {
    name: '뷰티/패션 전문가',
    content: `안녕하세요, 뷰티/패션 전문 크리에이터입니다.

전문 분야:
• 메이크업 튜토리얼 & 제품 리뷰
• 패션 스타일링 & 코디 제안
• 트렌드 분석 & 추천

콘텐츠 제작 계획:
1. 제품 상세 리뷰 (질감, 발색, 지속력 등)
2. 튜토리얼 영상 (사용법, 팁)
3. 비포&애프터 비교
4. 다양한 스타일링 제안

보유 채널 & 실적:
- Instagram: [팔로워 수]
- YouTube: [구독자 수]
- 평균 참여율: [퍼센트]%

귀사 제품의 매력을 제 팔로워들에게 효과적으로 전달하겠습니다.`,
    isPublic: true,
    category: 'beauty'
  }
]

async function main() {
  console.log('Start seeding templates...')
  
  // 시스템 사용자 찾기 또는 생성
  let systemUser = await prisma.user.findFirst({
    where: { email: 'system@linkpick.com' }
  })
  
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: 'system@linkpick.com',
        name: 'LinkPick System',
        type: 'ADMIN',
        password: '$2a$10$dummy.hash.for.system.user', // 시스템 사용자는 로그인 불가
        status: 'ACTIVE',
        verified: true
      }
    })
  }
  
  // 기본 템플릿 생성
  for (const template of DEFAULT_TEMPLATES) {
    const existing = await prisma.applicationTemplate.findFirst({
      where: {
        name: template.name,
        userId: systemUser.id
      }
    })
    
    if (!existing) {
      await prisma.applicationTemplate.create({
        data: {
          ...template,
          userId: systemUser.id,
          useCount: 0
        }
      })
      console.log(`Created template: ${template.name}`)
    } else {
      console.log(`Template already exists: ${template.name}`)
    }
  }
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })