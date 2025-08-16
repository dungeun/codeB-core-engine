import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { authenticateJWT } from '@/lib/auth-middleware'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // JWT 인증
    const user = await authenticateJWT(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ADMIN 권한 체크
    if (user.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 기본 통계 데이터 (임시)
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)

    const totalUsers = await prisma.user.count()
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })
    const userGrowth = totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0

    const usersByType = await prisma.user.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    })

    // 임시 데이터 반환
    return NextResponse.json({
      overview: {
        totalUsers,
        userGrowth,
        totalCampaigns: 0,
        totalRevenue: 0,
        revenueGrowth: 0,
        totalSettlements: 0,
        settlementGrowth: 0
      },
      usersByType: usersByType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      userTrend: [],
      campaignsByStatus: [],
      campaignsByCategory: [],
      monthlyStats: [],
      paymentMethods: [],
      topInfluencers: [],
      topCampaigns: []
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}