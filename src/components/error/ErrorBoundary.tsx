// 에러 바운더리 컴포넌트
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { useToast } from '@/contexts/ToastContext'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  level?: 'page' | 'component' | 'section'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 사용자 정의 에러 핸들러 실행
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 에러 리포팅 서비스로 전송 (예: Sentry, LogRocket 등)
    if (typeof window !== 'undefined') {
      try {
        // 에러 정보를 서버로 전송하거나 외부 서비스로 리포팅
        this.reportError(error, errorInfo)
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError)
      }
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      level: this.props.level || 'component'
    }

    // 에러 리포팅 API 호출
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      })
    } catch (networkError) {
      console.error('Failed to send error report:', networkError)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private copyErrorDetails = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      errorId: this.state.errorId
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => alert('에러 세부사항이 클립보드에 복사되었습니다.'))
      .catch(() => console.error('클립보드 복사 실패'))
  }

  render() {
    if (this.state.hasError) {
      // 사용자 정의 fallback UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 레벨에 따른 다른 에러 UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          level={this.props.level || 'component'}
          showDetails={this.props.showDetails || false}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onCopyDetails={this.copyErrorDetails}
        />
      )
    }

    return this.props.children
  }
}

// 에러 폴백 UI 컴포넌트
interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  level: 'page' | 'component' | 'section'
  showDetails: boolean
  onRetry: () => void
  onReload: () => void
  onCopyDetails: () => void
}

function ErrorFallback({
  error,
  errorInfo,
  errorId,
  level,
  showDetails,
  onRetry,
  onReload,
  onCopyDetails
}: ErrorFallbackProps) {
  const getErrorIcon = () => {
    switch (level) {
      case 'page':
        return (
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case 'section':
        return (
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getErrorTitle = () => {
    switch (level) {
      case 'page':
        return '페이지를 불러올 수 없습니다'
      case 'section':
        return '섹션을 불러올 수 없습니다'
      default:
        return '일시적인 오류가 발생했습니다'
    }
  }

  const getErrorMessage = () => {
    switch (level) {
      case 'page':
        return '페이지를 표시하는 중에 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.'
      case 'section':
        return '이 섹션을 불러오는 중에 오류가 발생했습니다. 다시 시도하거나 페이지를 새로고침해주세요.'
      default:
        return '컴포넌트를 표시하는 중에 오류가 발생했습니다. 다시 시도해주세요.'
    }
  }

  const containerClass = level === 'page' 
    ? 'min-h-screen flex items-center justify-center bg-gray-50' 
    : level === 'section'
    ? 'min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200'
    : 'min-h-[100px] flex items-center justify-center bg-gray-50 rounded border border-gray-200'

  return (
    <div className={containerClass}>
      <div className="text-center p-6 max-w-md mx-auto">
        {getErrorIcon()}
        
        <h2 className={`font-semibold text-gray-900 mb-2 ${
          level === 'page' ? 'text-xl' : level === 'section' ? 'text-lg' : 'text-base'
        }`}>
          {getErrorTitle()}
        </h2>
        
        <p className={`text-gray-600 mb-4 ${
          level === 'page' ? 'text-base' : 'text-sm'
        }`}>
          {getErrorMessage()}
        </p>

        <div className="space-y-2">
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
          
          {level === 'page' && (
            <button
              onClick={onReload}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              페이지 새로고침
            </button>
          )}
        </div>

        {showDetails && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              에러 세부사항 보기
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-32">
              <div className="mb-2">
                <strong>에러 ID:</strong> {errorId}
              </div>
              <div className="mb-2">
                <strong>메시지:</strong> {error.message}
              </div>
              {error.stack && (
                <div className="mb-2">
                  <strong>스택:</strong>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              )}
              <button
                onClick={onCopyDetails}
                className="mt-2 text-xs text-blue-500 hover:text-blue-700"
              >
                세부사항 복사
              </button>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

// 에러 바운더리 HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// 에러 바운더리 훅 (함수형 컴포넌트용)
export function useErrorHandler() {
  const { showError } = useToast()

  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error)
    showError('오류 발생', error.message)
    
    // 에러 리포팅
    if (typeof window !== 'undefined') {
      fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(reportError => {
        console.error('Failed to report error:', reportError)
      })
    }
  }, [showError])

  return { handleError }
}

// 비동기 에러 바운더리 훅
export function useAsyncError() {
  const [, setError] = React.useState()

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}

// 기본 에러 바운더리 export
export const ErrorBoundary = ErrorBoundaryClass