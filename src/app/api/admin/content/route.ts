import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyJWT } from '@/lib/auth/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 필터 조건 구성
    const where: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (type && type !== 'all') {
      where.type = type
    }
    
    if (platform && platform !== 'all') {
      where.campaign = {
        platform: platform
      }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { campaign: { title: { contains: search, mode: 'insensitive' } } },
        { influencer: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Content 모델이 스키마에 없으므로 현재 사용 불가
    return NextResponse.json(
      { error: 'Content model not implemented in schema' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Admin content API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}