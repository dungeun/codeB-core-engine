const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTemplates() {
  try {
    const templates = [
      {
        name: '진정성 있는 지원서',
        content: '안녕하세요! {brand}의 {title} 캠페인에 지원합니다.\n\n저는 {category} 분야에서 활발히 활동하고 있는 인플루언서입니다. 평소 {brand} 브랜드를 좋아하고 있었고, 이번 캠페인을 통해 진정성 있는 콘텐츠를 제작하고 싶습니다.\n\n특히 저의 팔로워들이 {category}에 관심이 많아, 높은 참여율을 기대할 수 있습니다. 감사합니다!',
        isPublic: true,
        category: null // 모든 카테고리에서 사용 가능
      },
      {
        name: '전문성 강조 지원서',
        content: '안녕하세요, {brand} 캠페인 담당자님\n\n{category} 전문 인플루언서로서 {title} 캠페인에 지원합니다.\n\n제가 이 캠페인에 적합한 이유:\n1. {category} 분야 3년 이상 활동\n2. 평균 참여율 5% 이상 유지\n3. 타겟 연령층과 제 팔로워 연령대 일치\n\n고품질 콘텐츠로 브랜드 가치를 높이겠습니다.\n\n포트폴리오: [링크]\n감사합니다.',
        isPublic: true,
        category: null
      },
      {
        name: '창의적인 지원서',
        content: '🌟 {brand}와 함께하는 특별한 콘텐츠를 만들고 싶습니다!\n\n안녕하세요, {title} 캠페인에 지원하는 [이름]입니다.\n\n제가 준비한 콘텐츠 아이디어:\n✨ 언박싱부터 실사용 후기까지 스토리텔링\n✨ 팔로워 참여 이벤트로 브랜드 인지도 상승\n✨ 릴스/쇼츠 제작으로 바이럴 효과 극대화\n\n{brand}만의 특별함을 제 채널에서 빛내드리겠습니다!\n\n#인플루언서 #협업문의 #{category}',
        isPublic: true,
        category: null
      },
      {
        name: '뷰티 전문 템플릿',
        content: '안녕하세요, 뷰티 인플루언서 [이름]입니다 💄\n\n{brand}의 {title} 캠페인에 지원합니다.\n\n✔️ 뷰티 콘텐츠 경력: 5년\n✔️ 주 타겟층: 20-30대 여성\n✔️ 특화 콘텐츠: 메이크업 튜토리얼, 제품 리뷰\n\n특히 제품의 질감, 발색, 지속력 등을 디테일하게 리뷰하여 구매 전환율이 높습니다.\n\n이전 협업 브랜드: [브랜드 리스트]\n평균 조회수: 10만+\n\n감사합니다!',
        isPublic: true,
        category: '뷰티'
      },
      {
        name: '패션 전문 템플릿',
        content: '안녕하세요! 패션 인플루언서 [이름]입니다 👗\n\n{brand} {title} 캠페인 지원 동기:\n\n저는 일상 속에서 입을 수 있는 실용적인 스타일링을 추구합니다. {brand}의 이번 컬렉션이 제 콘텐츠 방향성과 완벽히 일치한다고 생각합니다.\n\n제공 가능한 콘텐츠:\n• 시즌별 스타일링 가이드\n• 체형별 착용 팁\n• 데일리룩 코디 제안\n\n인스타그램: @[계정]\n평균 참여율: 6.5%\n\n협업을 기대하겠습니다!',
        isPublic: true,
        category: '패션'
      },
      {
        name: '푸드 전문 템플릿',
        content: '맛있는 인사드립니다! 푸드 크리에이터 [이름]입니다 🍽️\n\n{brand}의 {title} 캠페인에 지원합니다.\n\n제 채널의 강점:\n📌 정직한 맛 평가로 높은 신뢰도\n📌 시각적으로 매력적인 푸드 촬영\n📌 레시피 활용법 제공으로 실용성 UP\n\n콘텐츠 계획:\n1) 제품 첫인상 & 언박싱\n2) 다양한 조리법 소개\n3) 팔로워 추천 레시피 공유\n\n{brand}의 맛을 제대로 전달하겠습니다!\n\n포트폴리오: [링크]',
        isPublic: true,
        category: '푸드'
      }
    ];

    console.log('기본 템플릿 생성 중...');
    
    for (const template of templates) {
      const existing = await prisma.applicationTemplate.findFirst({
        where: { name: template.name }
      });
      
      if (!existing) {
        await prisma.applicationTemplate.create({
          data: template
        });
        console.log(`템플릿 생성됨: ${template.name}`);
      } else {
        console.log(`템플릿 이미 존재함: ${template.name}`);
      }
    }
    
    console.log('기본 템플릿 생성 완료!');
  } catch (error) {
    console.error('템플릿 생성 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTemplates();