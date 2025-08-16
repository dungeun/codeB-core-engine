/**
 * 기본 번역 데이터
 * 데이터베이스에 번역이 없을 때 사용되는 폴백 번역
 */

export const defaultTranslations = {
  ko: {
    // 홈페이지
    'homepage.campaigns.title': '인기 캠페인',
    'homepage.campaigns.viewAll': '전체보기',
    'homepage.campaigns.apply': '지원하기',
    'homepage.campaigns.deadline': '마감일',
    'homepage.campaigns.budget': '예산',
    'homepage.campaigns.participants': '참여자',
    
    // 메뉴
    'menu.home': '홈',
    'menu.campaigns': '캠페인',
    'menu.influencers': '인플루언서',
    'menu.about': '소개',
    'menu.login': '로그인',
    'menu.signup': '회원가입',
    'menu.mypage': '마이페이지',
    'menu.logout': '로그아웃',
    'menu.admin': '관리자',
    'menu.business': '비즈니스',
    'menu.community': '커뮤니티',
    'menu.pricing': '요금제',
    'menu.dashboard': '대시보드',
    'menu.user_management': '사용자 관리',
    'menu.campaign_management': '캠페인 관리',
    'menu.my': '마이',
    
    // 헤더 메뉴
    'header.menu.campaigns': '캠페인',
    'header.menu.influencers': '인플루언서',
    'header.menu.community': '커뮤니티',
    'header.menu.pricing': '요금제',
    
    // 언어 선택기
    'language.selector.label': '언어 선택',
    'language.korean': '한국어',
    'language.english': 'English',
    'language.japanese': '日本語',
    
    // 공통
    'common.loading': '로딩 중...',
    'common.error': '오류가 발생했습니다',
    'common.retry': '다시 시도',
    'common.confirm': '확인',
    'common.cancel': '취소',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.edit': '수정',
    'common.search': '검색',
    'common.filter': '필터',
    'common.sort': '정렬',
    'common.noData': '데이터가 없습니다',
    
    // 인증
    'auth.login.title': '로그인',
    'auth.login.email': '이메일',
    'auth.login.password': '비밀번호',
    'auth.login.remember': '로그인 상태 유지',
    'auth.login.forgot': '비밀번호 찾기',
    'auth.signup.title': '회원가입',
    'auth.signup.name': '이름',
    'auth.signup.confirmPassword': '비밀번호 확인',
    'auth.signup.terms': '이용약관에 동의합니다',
    'auth.signup.privacy': '개인정보처리방침에 동의합니다',
    
    // 알림
    'notification.title': '알림',
    'notification.empty': '알림이 없습니다',
    
    // 커머스 - 제품
    'commerce.product.title': '제품',
    'commerce.product.addToCart': '장바구니 담기',
    'commerce.product.buyNow': '바로 구매',
    'commerce.product.price': '가격',
    'commerce.product.inStock': '재고 있음',
    'commerce.product.outOfStock': '품절',
    
    // 커머스 - 장바구니
    'commerce.cart.title': '장바구니',
    'commerce.cart.empty': '장바구니가 비어있습니다',
    'commerce.cart.checkout': '결제하기',
    'commerce.cart.total': '합계',
    
    // 커머스 - 주문
    'commerce.order.title': '주문',
    'commerce.order.history': '주문 내역',
    'commerce.order.status': '주문 상태',
    
    // 커머스 - 관리자 메뉴
    'commerce.admin.menu.commerce': '커머스',
    'commerce.admin.menu.products': '상품 관리',
    'commerce.admin.menu.orders': '주문 관리',
  },
  en: {
    // Homepage
    'homepage.campaigns.title': 'Popular Campaigns',
    'homepage.campaigns.viewAll': 'View All',
    'homepage.campaigns.apply': 'Apply',
    'homepage.campaigns.deadline': 'Deadline',
    'homepage.campaigns.budget': 'Budget',
    'homepage.campaigns.participants': 'Participants',
    
    // Menu
    'menu.home': 'Home',
    'menu.campaigns': 'Campaigns',
    'menu.influencers': 'Influencers',
    'menu.about': 'About',
    'menu.login': 'Login',
    'menu.signup': 'Sign Up',
    'menu.mypage': 'My Page',
    'menu.logout': 'Logout',
    'menu.admin': 'Admin',
    'menu.business': 'Business',
    'menu.community': 'Community',
    'menu.pricing': 'Pricing',
    'menu.dashboard': 'Dashboard',
    'menu.user_management': 'User Management',
    'menu.campaign_management': 'Campaign Management',
    'menu.my': 'My',
    
    // Header Menu
    'header.menu.campaigns': 'Campaigns',
    'header.menu.influencers': 'Influencers',
    'header.menu.community': 'Community',
    'header.menu.pricing': 'Pricing',
    
    // Language Selector
    'language.selector.label': 'Select Language',
    'language.korean': 'Korean',
    'language.english': 'English',
    'language.japanese': 'Japanese',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.noData': 'No data available',
    
    // Auth
    'auth.login.title': 'Login',
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.remember': 'Remember me',
    'auth.login.forgot': 'Forgot password?',
    'auth.signup.title': 'Sign Up',
    'auth.signup.name': 'Name',
    'auth.signup.confirmPassword': 'Confirm Password',
    'auth.signup.terms': 'I agree to the Terms of Service',
    'auth.signup.privacy': 'I agree to the Privacy Policy',
    
    // Notifications
    'notification.title': 'Notifications',
    'notification.empty': 'No notifications',
    
    // Commerce - Product
    'commerce.product.title': 'Product',
    'commerce.product.addToCart': 'Add to Cart',
    'commerce.product.buyNow': 'Buy Now',
    'commerce.product.price': 'Price',
    'commerce.product.inStock': 'In Stock',
    'commerce.product.outOfStock': 'Out of Stock',
    
    // Commerce - Cart
    'commerce.cart.title': 'Shopping Cart',
    'commerce.cart.empty': 'Your cart is empty',
    'commerce.cart.checkout': 'Checkout',
    'commerce.cart.total': 'Total',
    
    // Commerce - Order
    'commerce.order.title': 'Order',
    'commerce.order.history': 'Order History',
    'commerce.order.status': 'Order Status',
    
    // Commerce - Admin Menu
    'commerce.admin.menu.commerce': 'Commerce',
    'commerce.admin.menu.products': 'Products',
    'commerce.admin.menu.orders': 'Orders',
  },
  ja: {
    // ホームページ
    'homepage.campaigns.title': '人気キャンペーン',
    'homepage.campaigns.viewAll': 'すべて見る',
    'homepage.campaigns.apply': '応募する',
    'homepage.campaigns.deadline': '締切',
    'homepage.campaigns.budget': '予算',
    'homepage.campaigns.participants': '参加者',
    
    // メニュー
    'menu.home': 'ホーム',
    'menu.campaigns': 'キャンペーン',
    'menu.influencers': 'インフルエンサー',
    'menu.about': '紹介',
    'menu.login': 'ログイン',
    'menu.signup': '会員登録',
    'menu.mypage': 'マイページ',
    'menu.logout': 'ログアウト',
    'menu.admin': '管理者',
    'menu.business': 'ビジネス',
    'menu.community': 'コミュニティ',
    'menu.pricing': '料金プラン',
    'menu.dashboard': 'ダッシュボード',
    'menu.user_management': 'ユーザー管理',
    'menu.campaign_management': 'キャンペーン管理',
    'menu.my': 'マイ',
    
    // ヘッダーメニュー
    'header.menu.campaigns': 'キャンペーン',
    'header.menu.influencers': 'インフルエンサー',
    'header.menu.community': 'コミュニティ',
    'header.menu.pricing': '料金プラン',
    
    // 言語セレクター
    'language.selector.label': '言語選択',
    'language.korean': '韓国語',
    'language.english': '英語',
    'language.japanese': '日本語',
    
    // 共通
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.retry': '再試行',
    'common.confirm': '確認',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.search': '検索',
    'common.filter': 'フィルター',
    'common.sort': '並べ替え',
    'common.noData': 'データがありません',
    
    // 認証
    'auth.login.title': 'ログイン',
    'auth.login.email': 'メールアドレス',
    'auth.login.password': 'パスワード',
    'auth.login.remember': 'ログイン状態を保持',
    'auth.login.forgot': 'パスワードを忘れた方',
    'auth.signup.title': '会員登録',
    'auth.signup.name': '名前',
    'auth.signup.confirmPassword': 'パスワード確認',
    'auth.signup.terms': '利用規約に同意します',
    'auth.signup.privacy': 'プライバシーポリシーに同意します',
    
    // 通知
    'notification.title': '通知',
    'notification.empty': '通知はありません',
    
    // コマース - 商品
    'commerce.product.title': '商品',
    'commerce.product.addToCart': 'カートに追加',
    'commerce.product.buyNow': '今すぐ購入',
    'commerce.product.price': '価格',
    'commerce.product.inStock': '在庫あり',
    'commerce.product.outOfStock': '在庫切れ',
    
    // コマース - カート
    'commerce.cart.title': 'ショッピングカート',
    'commerce.cart.empty': 'カートは空です',
    'commerce.cart.checkout': 'レジに進む',
    'commerce.cart.total': '合計',
    
    // コマース - 注文
    'commerce.order.title': '注文',
    'commerce.order.history': '注文履歴',
    'commerce.order.status': '注文状況',
    
    // コマース - 管理メニュー
    'commerce.admin.menu.commerce': 'コマース',
    'commerce.admin.menu.products': '商品管理',
    'commerce.admin.menu.orders': '注文管理',
  }
}

export type TranslationKey = keyof typeof defaultTranslations.ko
export type Language = keyof typeof defaultTranslations

export function getDefaultTranslation(key: string, language: Language = 'ko'): string {
  return defaultTranslations[language]?.[key as TranslationKey] || key
}