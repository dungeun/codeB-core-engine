import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJWT } from '@/lib/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/content/[id] - 콘텐츠 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authorization 헤더 또는 쿠키에서 토큰 가져오기
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    
    if (!token) {
      const cookieStore = cookies()
      token = cookieStore.get('auth-token')?.value || cookieStore.get('accessToken')?.value
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // JWT 토큰 검증
    const user = await verifyJWT(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (user.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Content 모델이 스키마에 없으므로 현재 사용 불가
    return NextResponse.json(
      { error: 'Content model not implemented in schema' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Admin content detail API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authorization 헤더 또는 쿠키에서 토큰 가져오기
    const authHeader = request.headers.get('authorization')
    let token = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    
    if (!token) {
      const cookieStore = cookies()
      token = cookieStore.get('auth-token')?.value || cookieStore.get('accessToken')?.value
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // JWT 토큰 검증
    const user = await verifyJWT(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (user.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { status, feedback } = await request.json()

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Content 모델이 스키마에 없으므로 현재 사용 불가
    return NextResponse.json(
      { error: 'Content model not implemented in schema' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Content status update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}