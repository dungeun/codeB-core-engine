import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPosts() {
  try {
    // 관리자 계정 찾기 또는 생성
    let adminUser = await prisma.user.findFirst({
      where: { type: 'ADMIN' }
    })

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@linkpick.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKpQj6oqFmxGwQq', // password123
          name: '관리자',
          type: 'ADMIN'
        }
      })
    }

    // 테스트 유저들 생성
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'beauty@example.com' },
        update: {},
        create: {
          email: 'beauty@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKpQj6oqFmxGwQq',
          name: '뷰티크리에이터A',
          type: 'INFLUENCER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'fashion@example.com' },
        update: {},
        create: {
          email: 'fashion@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKpQj6oqFmxGwQq',
          name: '패션블로거B',
          type: 'INFLUENCER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'newbie@example.com' },
        update: {},
        create: {
          email: 'newbie@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKpQj6oqFmxGwQq',
          name: '새내기인플루언서',
          type: 'INFLUENCER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'daily@example.com' },
        update: {},
        create: {
          email: 'daily@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKpQj6oqFmxGwQq',
          name: '일상크리에이터',
          type: 'INFLUENCER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'tech@example.com' },
        update: {},
        create: {
          email: 'tech@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKpQj6oqFmxGwQq',
          name: '테크리뷰어C',
          type: 'INFLUENCER'
        }
      }),
      prisma.user.upsert({
        where: { email: 'food@example.com' },
        update: {},
        create: {
          email: 'food@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKpQj6oqFmxGwQq',
          name: '푸드인플루언서D',
          type: 'INFLUENCER'
        }
      })
    ])

    // 공지사항 게시글 (10개)
    const noticePosts = [
      {
        title: '[공지] LinkPick 커뮤니티 이용 규칙 안내',
        content: `안녕하세요, LinkPick 운영팀입니다.

원활한 커뮤니티 운영을 위해 다음과 같은 이용 규칙을 안내드립니다.

1. 상호 존중
- 모든 회원을 존중하고 예의를 지켜주세요.
- 비방, 욕설, 인신공격은 금지됩니다.

2. 건전한 콘텐츠
- 불법적이거나 유해한 콘텐츠는 삭제될 수 있습니다.
- 허위 정보나 과장된 광고는 금지됩니다.

3. 개인정보 보호
- 타인의 개인정보를 무단으로 공개하지 마세요.
- 본인의 개인정보도 신중하게 관리해주세요.

4. 저작권 준수
- 타인의 저작물을 무단으로 사용하지 마세요.
- 출처를 명확히 표기해주세요.

건전한 커뮤니티 문화를 만들어가는 데 함께해주셔서 감사합니다.`,
        category: 'notice',
        authorId: adminUser.id,
        views: 1542,
        likes: 45,
        isPinned: true,
        createdAt: new Date('2025-01-01')
      },
      {
        title: '[업데이트] 새로운 캠페인 매칭 시스템 도입',
        content: `LinkPick의 AI 기반 매칭 시스템이 업그레이드되었습니다!

주요 개선사항:
- 더욱 정확한 인플루언서-브랜드 매칭
- 카테고리별 세분화된 추천
- 과거 캠페인 성과 기반 추천

여러분의 피드백을 기다립니다!`,
        category: 'notice',
        authorId: adminUser.id,
        views: 987,
        likes: 32,
        isPinned: true,
        createdAt: new Date('2025-01-05')
      },
      {
        title: '[이벤트] 2월 베스트 인플루언서 선정 이벤트',
        content: `2월 한 달간 활발한 활동을 한 인플루언서분들께 특별한 혜택을 드립니다!

선정 기준:
- 캠페인 참여도
- 콘텐츠 품질
- 커뮤니티 활동

상품:
1등: 100만원 상당 촬영 장비
2등: 50만원 상품권
3등: 30만원 상품권

많은 참여 부탁드립니다!`,
        category: 'notice',
        authorId: adminUser.id,
        views: 2341,
        likes: 128,
        createdAt: new Date('2025-01-10')
      },
      {
        title: '[안내] 설 연휴 고객센터 운영 시간',
        content: `설 연휴 기간 고객센터 운영 시간을 안내드립니다.

1월 28일(화) ~ 1월 30일(목): 휴무
1월 31일(금): 오후 2시 ~ 6시 운영

긴급 문의는 support@linkpick.com으로 보내주세요.`,
        category: 'notice',
        authorId: adminUser.id,
        views: 567,
        likes: 12,
        createdAt: new Date('2025-01-12')
      },
      {
        title: '[중요] 서비스 이용약관 개정 안내',
        content: `서비스 이용약관이 2월 1일부터 개정됩니다.

주요 변경사항:
- 정산 주기 변경 (월 2회 → 주 1회)
- 캠페인 취소 정책 강화
- 분쟁 해결 절차 개선

자세한 내용은 홈페이지를 참고해주세요.`,
        category: 'notice',
        authorId: adminUser.id,
        views: 1234,
        likes: 23,
        isPinned: true,
        createdAt: new Date('2025-01-08')
      },
      {
        title: '[신규 기능] 실시간 채팅 기능 오픈',
        content: `브랜드와 인플루언서 간 소통을 위한 실시간 채팅 기능이 추가되었습니다.

- 캠페인 진행 중 실시간 소통 가능
- 파일 및 이미지 전송 지원
- 채팅 내역 저장 및 검색 기능

더 나은 협업을 위해 활용해보세요!`,
        category: 'notice',
        authorId: adminUser.id,
        views: 876,
        likes: 67,
        createdAt: new Date('2025-01-07')
      },
      {
        title: '[점검] 1월 25일 시스템 정기 점검 안내',
        content: `시스템 안정성 향상을 위한 정기 점검이 예정되어 있습니다.

일시: 2025년 1월 25일 (토) 오전 3시 ~ 6시
영향: 전체 서비스 이용 불가

불편을 드려 죄송합니다.`,
        category: 'notice',
        authorId: adminUser.id,
        views: 432,
        likes: 8,
        createdAt: new Date('2025-01-11')
      },
      {
        title: '[교육] 인플루언서를 위한 무료 온라인 세미나',
        content: `성공적인 인플루언서 마케팅을 위한 무료 교육을 진행합니다.

주제: 브랜드와의 효과적인 협업 방법
일시: 1월 30일 오후 3시
신청: 홈페이지 이벤트 페이지

선착순 100명!`,
        category: 'notice',
        authorId: adminUser.id,
        views: 1567,
        likes: 89,
        createdAt: new Date('2025-01-09')
      },
      {
        title: '[보안] 2단계 인증 설정 권장',
        content: `계정 보안 강화를 위해 2단계 인증 설정을 권장드립니다.

설정 방법:
1. 마이페이지 > 보안 설정
2. 2단계 인증 활성화
3. 인증 앱 연동

안전한 서비스 이용을 위해 꼭 설정해주세요!`,
        category: 'notice',
        authorId: adminUser.id,
        views: 654,
        likes: 34,
        createdAt: new Date('2025-01-06')
      },
      {
        title: '[FAQ] 자주 묻는 질문 TOP 10 정리',
        content: `많이 주시는 질문들을 정리했습니다.

1. 캠페인 신청 후 얼마나 기다려야 하나요?
2. 정산은 언제 받을 수 있나요?
3. 포트폴리오는 어떻게 등록하나요?
...

자세한 답변은 FAQ 페이지를 확인해주세요!`,
        category: 'notice',
        authorId: adminUser.id,
        views: 2109,
        likes: 156,
        createdAt: new Date('2025-01-03')
      }
    ]

    // 캠페인 팁 게시글 (10개)
    const tipsPosts = [
      {
        title: '인스타그램 릴스 조회수 올리는 꿀팁 공유합니다!',
        content: `릴스 조회수 늘리는 제 노하우를 공유할게요!

1. 첫 3초가 중요해요
- 시선을 끄는 오프닝 만들기
- 궁금증 유발하는 문구 사용

2. 음악 선택
- 트렌디한 음악 사용
- 박자에 맞춰 편집

3. 해시태그 전략
- 대중적인 태그 + 니치 태그 조합
- 10-15개 정도가 적당

4. 업로드 시간
- 타겟 오디언스가 활발한 시간대
- 평일 저녁 7-9시가 골든타임

5. 커버 이미지
- 통일감 있는 피드 유지
- 한눈에 내용 파악 가능하게

이 방법으로 평균 조회수가 3배 늘었어요!`,
        category: 'tips',
        authorId: users[0].id,
        views: 856,
        likes: 32,
        createdAt: new Date('2025-01-14')
      },
      {
        title: '브랜드 협업 제안서 작성하는 방법',
        content: `브랜드에게 어필하는 제안서 작성법!

1. 자기소개는 간단명료하게
2. 포트폴리오 링크 첨부
3. 예상 결과물 시안 제시
4. 구체적인 일정 제안
5. 가격은 협의 가능하다고 표현

이렇게 하니 선정률이 높아졌어요!`,
        category: 'tips',
        authorId: users[1].id,
        views: 1234,
        likes: 78,
        createdAt: new Date('2025-01-13')
      },
      {
        title: '유튜브 썸네일 클릭률 높이는 방법',
        content: `썸네일로 클릭률 2배 올린 비법!

1. 큰 글씨 사용 (모바일에서도 잘 보이게)
2. 표정은 과장되게
3. 대비 강한 색상 조합
4. 궁금증 유발하는 문구
5. A/B 테스트 꼭 하기

특히 표정이 정말 중요해요!`,
        category: 'tips',
        authorId: users[4].id,
        views: 2341,
        likes: 145,
        createdAt: new Date('2025-01-12')
      },
      {
        title: '인플루언서 세금 신고 꿀팁 정리',
        content: `세금 신고 시즌이 다가오네요. 제가 알아본 정보 공유합니다.

1. 사업자 등록 필수
2. 증빙 자료 잘 보관하기
3. 경비 처리 가능한 항목들
4. 부가세 신고 기간 놓치지 않기

세무사 상담 받는 것도 추천해요!`,
        category: 'tips',
        authorId: users[2].id,
        views: 3456,
        likes: 234,
        createdAt: new Date('2025-01-11')
      },
      {
        title: '캠페인 컨텐츠 기획하는 나만의 방법',
        content: `효과적인 컨텐츠 기획 프로세스 공유!

1. 브랜드 분석 (톤앤매너, 타겟)
2. 레퍼런스 수집
3. 스토리보드 작성
4. 촬영 리스트 정리
5. 일정별 체크리스트

준비를 철저히 하면 결과물 퀄리티가 달라져요!`,
        category: 'tips',
        authorId: users[3].id,
        views: 987,
        likes: 67,
        createdAt: new Date('2025-01-10')
      },
      {
        title: '틱톡 알고리즘 공략법 2025년 최신판',
        content: `틱톡 알고리즘이 또 바뀌었어요!

최신 트렌드:
- 시청 완료율이 가장 중요
- 댓글 상호작용 늘리기
- 일관된 업로드 시간
- 니치 타겟팅 강화

저는 이 방법으로 팔로워 10만 달성했어요!`,
        category: 'tips',
        authorId: users[0].id,
        views: 4321,
        likes: 321,
        createdAt: new Date('2025-01-09')
      },
      {
        title: '포트폴리오 만들 때 꼭 넣어야 할 것들',
        content: `브랜드가 보는 포트폴리오 필수 요소!

1. 대표 콘텐츠 5-10개
2. 조회수/참여율 수치
3. 타겟 오디언스 분석
4. 이전 협업 사례
5. 연락처 명확히

깔끔한 PDF로 만드는 것도 중요해요!`,
        category: 'tips',
        authorId: users[1].id,
        views: 1876,
        likes: 123,
        createdAt: new Date('2025-01-08')
      },
      {
        title: '라이브 방송 시청자 늘리는 꿀팁',
        content: `라이브 방송 시청자 유입 방법!

- 사전 공지 필수
- 정기적인 시간대 고정
- 시청자 참여 유도
- 특별 이벤트 진행
- 다시보기 활용

꾸준함이 가장 중요해요!`,
        category: 'tips',
        authorId: users[5].id,
        views: 1234,
        likes: 89,
        createdAt: new Date('2025-01-07')
      },
      {
        title: '브랜드와 가격 협상하는 스마트한 방법',
        content: `가격 협상 팁 공유합니다!

1. 시장 시세 파악하기
2. 본인 가치 정확히 알기
3. 패키지 딜 제안
4. 장기 계약 조건
5. 윈윈할 수 있는 포인트 찾기

무조건 높은 가격보다는 적정 가격이 중요해요!`,
        category: 'tips',
        authorId: users[2].id,
        views: 2109,
        likes: 167,
        createdAt: new Date('2025-01-06')
      },
      {
        title: '촬영 장비 없이도 퀄리티 높이는 방법',
        content: `비싼 장비 없어도 괜찮아요!

- 자연광 최대한 활용
- 스마트폰 카메라 설정 마스터
- 무료 편집 앱 활용법
- 삼각대 대신 쓸 수 있는 것들
- 조명 DIY 팁

창의력이 장비를 이깁니다!`,
        category: 'tips',
        authorId: users[3].id,
        views: 3456,
        likes: 289,
        createdAt: new Date('2025-01-05')
      }
    ]

    // 후기 게시글 (10개)
    const reviewPosts = [
      {
        title: '첫 캠페인 선정됐어요! 너무 기뻐요 ㅠㅠ',
        content: `드디어 첫 캠페인에 선정됐어요!

3개월 동안 꾸준히 콘텐츠 올리고 
포트폴리오 다듬은 보람이 있네요.

뷰티 브랜드 캠페인인데, 제가 평소에 
관심 있던 브랜드라 더 기뻐요.

아직 초보지만 열심히 할게요!
응원해주세요~`,
        category: 'review',
        authorId: users[2].id,
        views: 423,
        likes: 67,
        createdAt: new Date('2025-01-14')
      },
      {
        title: 'LinkPick 통해서 월 수익 500만원 달성!',
        content: `작년에 시작해서 1년 만에 월 500만원 달성했어요!

처음엔 10만원도 못 벌었는데...
꾸준히 하니까 되더라구요.

LinkPick 매칭 시스템이 정말 좋아요.
제 스타일에 맞는 브랜드를 잘 추천해줘서
캠페인 만족도가 높았어요.

포기하지 마세요 여러분!`,
        category: 'review',
        authorId: users[0].id,
        views: 5678,
        likes: 456,
        createdAt: new Date('2025-01-13')
      },
      {
        title: '패션 브랜드 장기 계약 성공 후기',
        content: `단발성 캠페인에서 시작해서
장기 계약까지 성공했어요!

첫 캠페인 때 정말 열심히 했더니
브랜드에서 먼저 제안이 왔어요.

이제 6개월 계약으로 안정적인 수입이 생겼네요.
LinkPick 감사합니다!`,
        category: 'review',
        authorId: users[1].id,
        views: 2341,
        likes: 234,
        createdAt: new Date('2025-01-12')
      },
      {
        title: '캠페인 10개 완료! 그동안 느낀 점',
        content: `벌써 10개 캠페인을 완료했네요.

좋았던 점:
- 다양한 브랜드 경험
- 실력 향상
- 네트워크 확대

아쉬운 점:
- 가끔 소통 어려움
- 일정 조율 스트레스

전반적으로 만족해요!`,
        category: 'review',
        authorId: users[4].id,
        views: 1876,
        likes: 145,
        createdAt: new Date('2025-01-11')
      },
      {
        title: '음식 인플루언서 1년 활동 후기',
        content: `맛집 다니는 걸 좋아해서 시작했는데
이제는 직업이 됐어요!

LinkPick에서 레스토랑, 카페, 
식품 브랜드까지 다양하게 매칭해줘서 좋아요.

월 평균 20개 정도 캠페인 진행 중!`,
        category: 'review',
        authorId: users[5].id,
        views: 3210,
        likes: 298,
        createdAt: new Date('2025-01-10')
      },
      {
        title: '뷰티 인플루언서 수익 공개',
        content: `투명하게 공개합니다!

팔로워 5만 기준
- 월 평균 캠페인 수: 8개
- 캠페인당 평균 단가: 70만원
- 월 수익: 약 560만원
- 세금 제외 실수령: 약 400만원

참고하세요!`,
        category: 'review',
        authorId: users[0].id,
        views: 8765,
        likes: 678,
        createdAt: new Date('2025-01-09')
      },
      {
        title: '처음으로 100만원짜리 캠페인 했어요!',
        content: `드디어 캠페인 단가 100만원 돌파!

팔로워는 3만인데 참여율이 높아서
선정된 것 같아요.

정말 신중하게 콘텐츠 제작했고
브랜드도 만족해하셨어요.

꾸준히 하면 됩니다!`,
        category: 'review',
        authorId: users[3].id,
        views: 2987,
        likes: 267,
        createdAt: new Date('2025-01-08')
      },
      {
        title: 'IT 제품 리뷰어로 전향 성공기',
        content: `원래 일상 브이로그 했는데
IT 제품 리뷰로 전향했어요.

LinkPick에서 테크 카테고리 캠페인이
많아서 도전했는데 잘 맞더라구요.

전문성을 키우니 단가도 올라갔어요!`,
        category: 'review',
        authorId: users[4].id,
        views: 1543,
        likes: 134,
        createdAt: new Date('2025-01-07')
      },
      {
        title: '인플루언서 2년차 솔직 후기',
        content: `2년 동안 활동하면서 느낀 점

장점:
- 자유로운 근무
- 창의적인 일
- 다양한 경험

단점:
- 불안정한 수입
- 악플 스트레스
- 경쟁 치열

그래도 전 만족해요!`,
        category: 'review',
        authorId: users[1].id,
        views: 4321,
        likes: 389,
        createdAt: new Date('2025-01-06')
      },
      {
        title: '팔로워 1000명으로도 캠페인 가능해요!',
        content: `팔로워 적다고 포기하지 마세요!

저도 1000명으로 시작했는데
니치 마켓 공략하니까 캠페인 들어와요.

작은 브랜드부터 시작해서
포트폴리오 쌓으세요!

지금은 팔로워 15000명이에요~`,
        category: 'review',
        authorId: users[2].id,
        views: 5432,
        likes: 512,
        createdAt: new Date('2025-01-05')
      }
    ]

    // 질문 게시글 (10개)
    const questionPosts = [
      {
        title: '캠페인 신청할 때 자기소개서 어떻게 쓰시나요?',
        content: `캠페인 신청할 때마다 자기소개서 쓰는게 어려워요.

어떤 내용을 넣어야 할지...
너무 길게 쓰면 안 읽을 것 같고
짧게 쓰면 어필이 안 될 것 같고...

선배님들은 어떻게 쓰시나요?
팁 좀 알려주세요!`,
        category: 'question',
        authorId: users[1].id,
        views: 234,
        likes: 5,
        createdAt: new Date('2025-01-13')
      },
      {
        title: '인스타그램 vs 유튜브 어디가 더 좋을까요?',
        content: `지금 인스타그램 하고 있는데
유튜브도 시작해볼까 고민이에요.

두 플랫폼 다 하시는 분들 계신가요?
장단점이 궁금해요!`,
        category: 'question',
        authorId: users[2].id,
        views: 567,
        likes: 23,
        createdAt: new Date('2025-01-12')
      },
      {
        title: '캠페인 가격은 어떻게 책정하시나요?',
        content: `팔로워 2만 정도인데 
캠페인 가격을 얼마로 해야 할지 모르겠어요.

시장 시세가 어떻게 되나요?
다들 어떻게 가격 정하시는지 궁금합니다.`,
        category: 'question',
        authorId: users[3].id,
        views: 1234,
        likes: 45,
        createdAt: new Date('2025-01-11')
      },
      {
        title: '사업자 등록 꼭 해야 하나요?',
        content: `이제 막 수익이 생기기 시작했는데
사업자 등록을 해야 할까요?

언제쯤 하는게 좋을까요?
장단점도 알려주세요!`,
        category: 'question',
        authorId: users[0].id,
        views: 2341,
        likes: 67,
        createdAt: new Date('2025-01-10')
      },
      {
        title: '촬영 장비 추천해주세요!',
        content: `유튜브 시작하려고 하는데
카메라랑 마이크 뭐 쓰시나요?

예산은 200만원 정도입니다.
입문자 추천 장비 알려주세요!`,
        category: 'question',
        authorId: users[4].id,
        views: 876,
        likes: 34,
        createdAt: new Date('2025-01-09')
      },
      {
        title: '릴스 편집 어플 추천해주세요',
        content: `릴스 편집할 때 어떤 어플 쓰시나요?

무료 어플 중에 좋은 거 있을까요?
자막도 쉽게 넣을 수 있는 걸로요!`,
        category: 'question',
        authorId: users[5].id,
        views: 1543,
        likes: 56,
        createdAt: new Date('2025-01-08')
      },
      {
        title: '캠페인 중에 컨텐츠 수정 요청 들어오면?',
        content: `캠페인 콘텐츠 올렸는데
브랜드에서 수정 요청이 왔어요.

이미 올린 건데 수정해야 하나요?
다들 어떻게 대처하시나요?`,
        category: 'question',
        authorId: users[1].id,
        views: 432,
        likes: 12,
        createdAt: new Date('2025-01-07')
      },
      {
        title: '해시태그는 몇 개나 다시나요?',
        content: `인스타그램 해시태그 전략이 궁금해요.

몇 개나 다는게 좋을까요?
너무 많으면 스팸처럼 보일까봐 걱정이에요.`,
        category: 'question',
        authorId: users[2].id,
        views: 765,
        likes: 28,
        createdAt: new Date('2025-01-06')
      },
      {
        title: '악플 대처법 좀 알려주세요 ㅠㅠ',
        content: `요즘 악플이 늘어서 스트레스받아요.

무시하는게 답인가요?
아니면 신고를 해야 할까요?

선배님들 조언 부탁드려요!`,
        category: 'question',
        authorId: users[3].id,
        views: 987,
        likes: 89,
        createdAt: new Date('2025-01-05')
      },
      {
        title: '틱톡도 같이 해볼만 한가요?',
        content: `인스타만 하고 있는데
틱톡도 시작해볼까 해요.

근데 영상 스타일이 달라서 고민이네요.
병행하시는 분들 있나요?`,
        category: 'question',
        authorId: users[0].id,
        views: 654,
        likes: 31,
        createdAt: new Date('2025-01-04')
      }
    ]

    // 자유게시판 게시글 (10개)
    const freePosts = [
      {
        title: '오늘 날씨 좋네요~ 다들 촬영 가시나요?',
        content: `날씨가 너무 좋아서 
야외 촬영하기 딱이에요!

저는 한강 가서 봄 룩북 찍으려구요.
다들 오늘 일정 어떠신가요?

화이팅입니다!`,
        category: 'free',
        authorId: users[3].id,
        views: 189,
        likes: 12,
        createdAt: new Date('2025-01-13')
      },
      {
        title: '인플루언서 모임 하실 분~',
        content: `서울에서 인플루언서 모임 만들어볼까 해요!

한 달에 한 번 정도 만나서
정보도 공유하고 네트워킹도 하고...

관심 있으신 분 댓글 달아주세요!`,
        category: 'free',
        authorId: users[0].id,
        views: 876,
        likes: 78,
        createdAt: new Date('2025-01-12')
      },
      {
        title: '다들 하루에 몇 시간 일하세요?',
        content: `인플루언서도 일이잖아요.

저는 콘텐츠 기획, 촬영, 편집하면
하루 8시간은 일하는 것 같아요.

다들 시간 관리 어떻게 하시나요?`,
        category: 'free',
        authorId: users[1].id,
        views: 432,
        likes: 34,
        createdAt: new Date('2025-01-11')
      },
      {
        title: '오늘 팔로워 1만 돌파했어요!!',
        content: `드디어 1만 팔로워 달성!

6개월 걸렸네요 ㅠㅠ
포기하고 싶을 때도 많았는데...

다들 응원해주셔서 감사해요!
앞으로도 열심히 할게요~`,
        category: 'free',
        authorId: users[2].id,
        views: 1234,
        likes: 234,
        createdAt: new Date('2025-01-10')
      },
      {
        title: '커피 마시면서 편집 중...',
        content: `카페에서 편집하는 거 좋아하시나요?

집에서는 집중이 안 돼서
매번 카페 찾아다녀요.

편집하기 좋은 카페 추천해주세요!`,
        category: 'free',
        authorId: users[4].id,
        views: 321,
        likes: 23,
        createdAt: new Date('2025-01-09')
      },
      {
        title: '인플루언서 번아웃 왔어요...',
        content: `매일 콘텐츠 만들어야 한다는 압박감에
번아웃이 온 것 같아요.

쉬고 싶은데 쉬면 팔로워 떨어질까봐...

다들 이런 경험 있으신가요?
극복 방법 공유해주세요 ㅠㅠ`,
        category: 'free',
        authorId: users[5].id,
        views: 2109,
        likes: 189,
        createdAt: new Date('2025-01-08')
      },
      {
        title: '새해 목표 공유해요!',
        content: `2025년 목표!

1. 팔로워 10만 달성
2. 월 수익 1000만원
3. 해외 브랜드 캠페인
4. 유튜브 시작

다들 올해 목표가 뭐예요?`,
        category: 'free',
        authorId: users[0].id,
        views: 765,
        likes: 87,
        createdAt: new Date('2025-01-07')
      },
      {
        title: '촬영 도와주실 분 구해요!',
        content: `혼자 촬영하기 한계가 있어서
서로 도와가며 촬영할 분 구해요!

지역: 서울 강남
시간: 주말 위주

관심 있으신 분 연락주세요~`,
        category: 'free',
        authorId: users[1].id,
        views: 543,
        likes: 45,
        createdAt: new Date('2025-01-06')
      },
      {
        title: '인플루언서 하길 잘했어요',
        content: `회사 다닐 때보다 훨씬 행복해요.

물론 불안정하고 힘들 때도 있지만
제가 좋아하는 일을 하면서
돈도 벌 수 있다는 게 감사해요.

모두들 화이팅!`,
        category: 'free',
        authorId: users[3].id,
        views: 1876,
        likes: 245,
        createdAt: new Date('2025-01-05')
      },
      {
        title: '주말인데 다들 쉬세요~',
        content: `인플루언서는 주말이 없다지만
가끔은 쉬어야죠!

오늘은 촬영도 편집도 안 하고
그냥 쉬려구요.

다들 주말 잘 보내세요~`,
        category: 'free',
        authorId: users[2].id,
        views: 234,
        likes: 56,
        createdAt: new Date('2025-01-04')
      }
    ]

    // 모든 게시글 생성
    const allPosts = [
      ...noticePosts,
      ...tipsPosts,
      ...reviewPosts,
      ...questionPosts,
      ...freePosts
    ]

    for (const postData of allPosts) {
      const { views, likes, ...data } = postData
      
      const post = await prisma.post.create({
        data: {
          ...data,
          views
        }
      })

      // 좋아요 추가 (랜덤 유저가 좋아요)
      const likeUsers = users.sort(() => 0.5 - Math.random()).slice(0, Math.min(likes, users.length))
      for (const user of likeUsers) {
        await prisma.postLike.create({
          data: {
            postId: post.id,
            userId: user.id
          }
        })
      }

      // 댓글 추가 (일부 게시글에만)
      if (Math.random() > 0.5) {
        const commentCount = Math.floor(Math.random() * 5) + 1
        for (let i = 0; i < commentCount; i++) {
          const commentUser = users[Math.floor(Math.random() * users.length)]
          await prisma.comment.create({
            data: {
              postId: post.id,
              authorId: commentUser.id,
              content: getRandomComment(post.category)
            }
          })
        }
      }
    }

    console.log('✅ Posts seeded successfully!')
  } catch (error) {
    console.error('Error seeding posts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getRandomComment(category: string): string {
  const comments = {
    notice: [
      '공지 확인했습니다!',
      '좋은 정보 감사해요',
      '업데이트 기대됩니다',
      '항상 감사합니다'
    ],
    tips: [
      '와 정말 유용한 팁이네요!',
      '저도 해봐야겠어요',
      '공유 감사합니다!',
      '도움이 많이 됐어요'
    ],
    review: [
      '축하드려요!',
      '좋은 후기 감사해요',
      '저도 열심히 해야겠네요',
      '동기부여 됩니다!'
    ],
    question: [
      '저도 궁금했어요',
      '좋은 질문이네요',
      '답변 달아드렸어요!',
      '저는 이렇게 하고 있어요'
    ],
    free: [
      '공감해요!',
      '화이팅입니다!',
      '좋은 하루 보내세요',
      '응원합니다!'
    ]
  }

  const categoryComments = comments[category as keyof typeof comments] || comments.free
  return categoryComments[Math.floor(Math.random() * categoryComments.length)]
}

seedPosts()