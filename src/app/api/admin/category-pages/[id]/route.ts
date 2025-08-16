import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/admin/category-pages/[id] - 특정 카테고리 페이지 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CategoryPage 모델이 스키마에 없으므로 현재 사용 불가
    return NextResponse.json(
      { error: 'CategoryPage model not implemented in schema' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error fetching category page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category page' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/category-pages/[id] - 카테고리 페이지 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CategoryPage 모델이 스키마에 없으므로 현재 사용 불가
    return NextResponse.json(
      { error: 'CategoryPage model not implemented in schema' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error updating category page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update category page' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/category-pages/[id] - 카테고리 페이지 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // CategoryPage 모델이 스키마에 없으므로 현재 사용 불가
    return NextResponse.json(
      { error: 'CategoryPage model not implemented in schema' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error deleting category page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category page' },
      { status: 500 }
    )
  }
}