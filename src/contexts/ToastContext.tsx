// 토스트 Context Provider
'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer, ToastMessage, ToastType } from '@/components/ui/toast'

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const newToast: ToastMessage = {
        id,
        type,
        title,
        message,
        duration
      }
      
      setToasts((prev) => [...prev, newToast])
    },
    []
  )

  const showSuccess = useCallback(
    (title: string, message?: string) => showToast('success', title, message),
    [showToast]
  )

  const showError = useCallback(
    (title: string, message?: string) => showToast('error', title, message),
    [showToast]
  )

  const showWarning = useCallback(
    (title: string, message?: string) => showToast('warning', title, message),
    [showToast]
  )

  const showInfo = useCallback(
    (title: string, message?: string) => showToast('info', title, message),
    [showToast]
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider 
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}