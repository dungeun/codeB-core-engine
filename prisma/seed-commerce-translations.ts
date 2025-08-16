/**
 * 커머스 번역 데이터 시딩 스크립트
 * 커머스 관련 모든 번역 키를 데이터베이스에 저장
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 커머스 번역 데이터
const commerceDefaultTranslations = {
  ko: {
    // 제품 관련
    'commerce.product.title': '제품',
    'commerce.product.addToCart': '장바구니 담기',
    'commerce.product.buyNow': '바로 구매',
    'commerce.product.price': '가격',
    'commerce.product.inStock': '재고 있음',
    'commerce.product.outOfStock': '품절',
    
    // 장바구니 관련
    'commerce.cart.title': '장바구니',
    'commerce.cart.empty': '장바구니가 비어있습니다',
    'commerce.cart.checkout': '결제하기',
    'commerce.cart.total': '합계',
    
    // 주문 관련
    'commerce.order.title': '주문',
    'commerce.order.history': '주문 내역',
    'commerce.order.status': '주문 상태',
    
    // 관리자 메뉴
    'commerce.admin.menu.commerce': '커머스',
    'commerce.admin.menu.products': '상품 관리',
    'commerce.admin.menu.orders': '주문 관리',
  },
  en: {
    // Product Related
    'commerce.product.title': 'Product',
    'commerce.product.addToCart': 'Add to Cart',
    'commerce.product.buyNow': 'Buy Now',
    'commerce.product.price': 'Price',
    'commerce.product.inStock': 'In Stock',
    'commerce.product.outOfStock': 'Out of Stock',
    
    // Cart Related
    'commerce.cart.title': 'Shopping Cart',
    'commerce.cart.empty': 'Your cart is empty',
    'commerce.cart.checkout': 'Checkout',
    'commerce.cart.total': 'Total',
    
    // Order Related
    'commerce.order.title': 'Order',
    'commerce.order.history': 'Order History',
    'commerce.order.status': 'Order Status',
    
    // Admin Menu
    'commerce.admin.menu.commerce': 'Commerce',
    'commerce.admin.menu.products': 'Products',
    'commerce.admin.menu.orders': 'Orders',
  },
  ja: {
    // 商品関連
    'commerce.product.title': '商品',
    'commerce.product.addToCart': 'カートに追加',
    'commerce.product.buyNow': '今すぐ購入',
    'commerce.product.price': '価格',
    'commerce.product.inStock': '在庫あり',
    'commerce.product.outOfStock': '在庫切れ',
    
    // カート関連
    'commerce.cart.title': 'ショッピングカート',
    'commerce.cart.empty': 'カートは空です',
    'commerce.cart.checkout': 'レジに進む',
    'commerce.cart.total': '合計',
    
    // 注文関連
    'commerce.order.title': '注文',
    'commerce.order.history': '注文履歴',
    'commerce.order.status': '注文状況',
    
    // 管理メニュー
    'commerce.admin.menu.commerce': 'コマース',
    'commerce.admin.menu.products': '商品管理',
    'commerce.admin.menu.orders': '注文管理',
  }
}

async function seedCommerceTranslations() {
  console.log('🌍 Starting commerce translations seeding...')

  try {
    // 기존 커머스 번역 삭제 (commerce.로 시작하는 키)
    await prisma.languagePack.deleteMany({
      where: {
        key: {
          startsWith: 'commerce.'
        }
      }
    })
    console.log('✅ Cleared existing commerce translations')

    // 각 번역 키에 대해 LanguagePack 레코드 생성
    const translationKeys = Object.keys(commerceDefaultTranslations.ko)
    let count = 0

    for (const key of translationKeys) {
      // 카테고리 결정 (commerce.product.title → commerce.product)
      const parts = key.split('.')
      const category = parts.slice(0, 2).join('.')

      // 각 키에 대한 번역 데이터 준비
      const data = {
        key,
        ko: commerceDefaultTranslations.ko[key as keyof typeof commerceDefaultTranslations.ko],
        en: commerceDefaultTranslations.en[key as keyof typeof commerceDefaultTranslations.en],
        jp: commerceDefaultTranslations.ja[key as keyof typeof commerceDefaultTranslations.ja],
        category,
        description: `Commerce translation for ${key}`,
        isEditable: true
      }

      // Upsert (존재하면 업데이트, 없으면 생성)
      await prisma.languagePack.upsert({
        where: { key },
        update: {
          ko: data.ko,
          en: data.en,
          jp: data.jp,
          category: data.category,
          description: data.description
        },
        create: data
      })
      
      count++
    }

    console.log(`✅ Created/Updated ${count} commerce translations`)

    // 통계 출력
    const stats = await prisma.languagePack.groupBy({
      by: ['category'],
      where: {
        key: {
          startsWith: 'commerce.'
        }
      },
      _count: true
    })

    console.log('\n📊 Commerce Translation Statistics:')
    for (const stat of stats) {
      console.log(`   ${stat.category}: ${stat._count} translations`)
    }

    console.log('\n✨ Commerce translations seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding commerce translations:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 스크립트 실행
seedCommerceTranslations()
  .catch((error) => {
    console.error('Failed to seed commerce translations:', error)
    process.exit(1)
  })