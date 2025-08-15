'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'

export default function DashboardRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // 로그인 상태 확인 및 사용자 타입별 리다이렉트
    const currentUser = AuthService.getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    // 사용자 타입에 따라 적절한 대시보드로 리다이렉트
    const userType = currentUser.type?.toUpperCase()
    
    switch (userType) {
      case 'ADMIN':
        router.push('/admin')
        break
      case 'BUSINESS':
        router.push('/mypage?tab=business')
        break
      case 'INFLUENCER':
      case 'USER':
      default:
        router.push('/mypage?tab=influencer')
        break
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">대시보드로 이동 중...</h1>
        <p className="text-gray-600">사용자 타입에 따라 적절한 대시보드로 이동합니다.</p>
      </div>
    </div>
  )

}