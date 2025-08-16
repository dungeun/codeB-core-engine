// /api/commerce/products - 제품 목록 조회 및 생성 API

import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/services/product.service'
import { 
  ProductQuerySchema, 
  CreateProductSchema,
  ProductFilterSchema 
} from '@/lib/validations/product'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/commerce/products - 제품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // 쿼리 파라미터 검증
    const validatedQuery = ProductQuerySchema.parse(queryParams)
    const { page, limit, sort, order, status, category, search } = validatedQuery

    // 필터 구성
    const filters = ProductFilterSchema.parse({
      categoryId: category,
      search,
      status
    })

    // 정렬 구성
    const sortOptions = { field: sort, order }
    
    // 페이지네이션 구성
    const pagination = { page, limit }

    // 제품 목록 조회
    const result = await ProductService.getProducts(filters, sortOptions, pagination)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching products:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: '잘못된 요청 파라미터입니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '제품 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/commerce/products - 새 제품 생성 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인 (사용자 타입 체크)
    // 실제 구현에서는 사용자의 role을 확인해야 함
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { type: true }
    })

    if (!user || user.type !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // 입력 데이터 검증
    const validatedData = CreateProductSchema.parse(body)

    // 제품 생성
    const product = await ProductService.createProduct(validatedData)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('validation') || error.message.includes('required')) {
        return NextResponse.json(
          { error: '입력 데이터가 올바르지 않습니다.', details: error.message },
          { status: 400 }
        )
      }
      
      if (error.message.includes('unique') || error.message.includes('Unique')) {
        return NextResponse.json(
          { error: '이미 존재하는 제품 정보입니다. (SKU 또는 슬러그 중복)' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: '제품 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}