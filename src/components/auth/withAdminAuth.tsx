// 관리자 인증 HOC (Higher Order Component)
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[] = ['ADMIN', 'admin']
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
      if (!isLoading) {
        // 인증되지 않은 경우
        if (!isAuthenticated) {
          router.push('/login?error=auth_required&redirect=/admin')
          return
        }

        // 권한이 없는 경우
        const userType = user?.type?.toLowerCase()
        const hasPermission = allowedRoles.some(role => 
          role.toLowerCase() === userType
        )

        if (!hasPermission) {
          router.push('/login?error=admin_required&message=관리자 권한이 필요합니다')
        }
      }
    }, [isLoading, isAuthenticated, user, router])

    // 로딩 중
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">권한 확인 중...</p>
          </div>
        </div>
      )
    }

    // 인증 및 권한 확인 완료
    if (isAuthenticated && user) {
      const userType = user.type?.toLowerCase()
      const hasPermission = allowedRoles.some(role => 
        role.toLowerCase() === userType
      )

      if (hasPermission) {
        return <Component {...props} />
      }
    }

    // 권한 없음
    return null
  }
}