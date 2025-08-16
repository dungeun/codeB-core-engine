import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/dashboard - 관리자 대시보드 통계
export async function GET(request: NextRequest) {
  try {
    // 공통 인증 함수 사용
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    const { user } = authResult;

    // 기본 통계 데이터 조회 (스키마에 존재하는 모델만 사용)
    const [
      totalUsers,
      activeUsers,
      totalPayments,
      newUsersToday,
      pendingBusinessProfiles,
      pendingInfluencerProfiles,
      recentUsers
    ] = await Promise.all([
      // 전체 사용자 수
      prisma.user.count(),
      
      // 활성 사용자 수 (최근 7일 이내 로그인)
      prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // 총 결제 금액 (Payment 모델이 존재하는 경우)
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }).catch(() => ({ _sum: { amount: 0 } })),
      
      // 오늘 가입한 사용자 수
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // 승인 대기 중인 비즈니스 프로필
      prisma.businessProfile.count({
        where: { isVerified: false }
      }),
      
      // 승인 대기 중인 인플루언서 프로필
      prisma.profile.count({
        where: { isVerified: false }
      }),
      
      // 최근 가입한 사용자 (5명)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          type: true,
          createdAt: true
        }
      })
    ]);

    // 성장률 계산 (지난 30일 대비)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const previousMonthUsers = await prisma.user.count({
      where: {
        createdAt: { lt: thirtyDaysAgo }
      }
    });
    const growth = previousMonthUsers > 0 
      ? ((totalUsers - previousMonthUsers) / previousMonthUsers * 100).toFixed(1)
      : 0;

    // 최근 활동 데이터 포맷팅 (기본 데이터만 사용)
    const recentActivities = recentUsers.map(user => ({
      id: `user-${user.id}`,
      type: 'user_registered',
      title: '새 사용자 가입',
      description: `${user.type === 'BUSINESS' ? '비즈니스' : '인플루언서'} "${user.name}"님이 가입했습니다.`,
      time: getRelativeTime(user.createdAt),
      icon: '👤'
    }));

    // 시스템 알림 (예시)
    const systemAlerts = [];
    
    // 승인 대기 알림
    const pendingApprovals = pendingBusinessProfiles + pendingInfluencerProfiles;
    if (pendingApprovals > 0) {
      systemAlerts.push({
        id: 'pending-approvals',
        type: 'warning',
        message: `${pendingApprovals}개의 프로필이 승인 대기 중입니다.`,
        time: '지금'
      });
    }

    // 응답 데이터
    const stats = {
      totalUsers,
      activeUsers,
      totalCampaigns: 0, // Campaign 모델이 스키마에 없으므로 기본값
      activeCampaigns: 0, // Campaign 모델이 스키마에 없으므로 기본값
      revenue: totalPayments._sum.amount || 0,
      growth: Number(growth),
      newUsers: newUsersToday,
      pendingApprovals
    };

    return NextResponse.json({
      stats,
      recentActivities,
      systemAlerts
    });

  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '대시보드 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 상대 시간 계산 함수
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}

// 상대 시간을 밀리초로 변환 (정렬용)
function parseRelativeTime(time: string): number {
  const now = Date.now();
  if (time === '방금 전') return now;
  if (time === '지금') return now;
  
  const match = time.match(/(\d+)(분|시간|일|주|개월|년) 전/);
  if (!match) return 0;
  
  const [, num, unit] = match;
  const value = parseInt(num);
  
  switch (unit) {
    case '분': return now - value * 60000;
    case '시간': return now - value * 3600000;
    case '일': return now - value * 86400000;
    case '주': return now - value * 604800000;
    case '개월': return now - value * 2592000000;
    case '년': return now - value * 31536000000;
    default: return 0;
  }
}