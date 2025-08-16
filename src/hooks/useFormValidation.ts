// 폼 검증 훅
'use client'

import { useState, useCallback } from 'react'
import { z } from 'zod'
import { useToast } from '@/contexts/ToastContext'

interface ValidationError {
  field: string
  message: string
}

interface UseFormValidationOptions {
  showToastOnError?: boolean
  scrollToError?: boolean
}

export function useFormValidation<T extends z.ZodTypeAny>(
  schema: T,
  options: UseFormValidationOptions = {}
) {
  const { showToastOnError = true, scrollToError = true } = options
  const { showError } = useToast()
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)

  const validate = useCallback(
    (data: unknown): { success: boolean; data?: z.infer<T>; errors?: ValidationError[] } => {
      setIsValidating(true)
      
      try {
        const result = schema.parse(data)
        setErrors({})
        setIsValidating(false)
        return { success: true, data: result }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors: ValidationError[] = []
          const errorMap: Record<string, string> = {}
          
          error.errors.forEach((err) => {
            const field = err.path.join('.')
            const message = err.message
            
            validationErrors.push({ field, message })
            errorMap[field] = message
          })
          
          setErrors(errorMap)
          
          // 첫 번째 오류에 대한 토스트 표시
          if (showToastOnError && validationErrors.length > 0) {
            showError('입력 오류', validationErrors[0].message)
          }
          
          // 첫 번째 오류 필드로 스크롤
          if (scrollToError && validationErrors.length > 0) {
            setTimeout(() => {
              const errorField = document.querySelector(`[name="${validationErrors[0].field}"]`) as HTMLElement
              if (errorField) {
                errorField.focus()
                errorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }, 100)
          }
          
          setIsValidating(false)
          return { success: false, errors: validationErrors }
        }
        
        // 예상치 못한 오류
        console.error('Validation error:', error)
        setIsValidating(false)
        return { success: false, errors: [{ field: '', message: '검증 중 오류가 발생했습니다.' }] }
      }
    },
    [schema, showToastOnError, scrollToError, showError]
  )

  const validateField = useCallback(
    (fieldName: string, value: unknown, parentData?: unknown): boolean => {
      try {
        // 전체 데이터가 있으면 해당 필드만 추출하여 검증
        if (parentData && typeof parentData === 'object') {
          const fieldSchema = schema.shape?.[fieldName]
          if (fieldSchema) {
            fieldSchema.parse(value)
          }
        } else {
          // 부분 스키마로 검증
          const partialSchema = schema.partial()
          partialSchema.parse({ [fieldName]: value })
        }
        
        // 해당 필드의 오류 제거
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[fieldName]
          return newErrors
        })
        
        return true
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find(err => err.path.join('.') === fieldName)
          if (fieldError) {
            setErrors(prev => ({
              ...prev,
              [fieldName]: fieldError.message
            }))
          }
        }
        return false
      }
    },
    [schema]
  )

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  const hasErrors = Object.keys(errors).length > 0
  const getFieldError = useCallback((fieldName: string) => errors[fieldName], [errors])

  return {
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    errors,
    hasErrors,
    getFieldError,
    isValidating
  }
}

// 실시간 검증을 위한 훅
export function useRealtimeValidation<T extends z.ZodTypeAny>(
  schema: T,
  initialData: Partial<z.infer<T>> = {},
  options: UseFormValidationOptions = {}
) {
  const [data, setData] = useState<Partial<z.infer<T>>>(initialData)
  const { validate, validateField, errors, hasErrors, getFieldError, clearFieldError } = useFormValidation(schema, options)

  const updateField = useCallback((fieldName: string, value: unknown) => {
    setData(prev => {
      const newData = { ...prev, [fieldName]: value }
      
      // 실시간 필드 검증 (디바운싱 없이)
      setTimeout(() => validateField(fieldName, value, newData), 0)
      
      return newData
    })
  }, [validateField])

  const updateData = useCallback((newData: Partial<z.infer<T>>) => {
    setData(newData)
  }, [])

  const validateAll = useCallback(() => {
    return validate(data)
  }, [validate, data])

  const reset = useCallback((resetData: Partial<z.infer<T>> = {}) => {
    setData(resetData)
    clearFieldError('')
  }, [clearFieldError])

  return {
    data,
    updateField,
    updateData,
    validate: validateAll,
    validateField,
    reset,
    errors,
    hasErrors,
    getFieldError,
    clearFieldError
  }
}

// 폼 필드 컴포넌트를 위한 props 생성 유틸리티
export function getFieldProps(
  fieldName: string,
  value: unknown,
  updateField: (field: string, value: unknown) => void,
  getFieldError: (field: string) => string | undefined
) {
  return {
    name: fieldName,
    value: value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      updateField(fieldName, e.target.value)
    },
    error: getFieldError(fieldName),
    'aria-invalid': !!getFieldError(fieldName),
    'aria-describedby': getFieldError(fieldName) ? `${fieldName}-error` : undefined
  }
}