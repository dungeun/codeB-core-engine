import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { withAuth } from '@/lib/auth/middleware'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/boards - 게시판 목록 조회
export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request)
    if ('error' in authResult) {
      return authResult.error
    }
    
    const { user } = authResult
    
    // 관리자 권한 확인
    if (user.type !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    // Board 모델이 스키마에 없으므로 현재 사용 불가
    return NextResponse.json(
      { error: 'Board model not implemented in schema' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Failed to get boards:', error)
    return NextResponse.json(
      { success: false, error: '게시판 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/admin/boards - 새 게시판 생성
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request)
    if ('error' in authResult) {
      return authResult.error
    }
    
    const { user } = authResult
    
    // 관리자 권한 확인
    if (user.type !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, category, visibility } = body

    // Board 모델이 스키마에 없으므로 현재 사용 불가
    return NextResponse.json(
      { error: 'Board model not implemented in schema' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Failed to create board:', error)
    return NextResponse.json(
      { success: false, error: '게시판 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}