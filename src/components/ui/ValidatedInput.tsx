// 검증된 입력 컴포넌트
'use client'

import React, { forwardRef } from 'react'

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  variant?: 'default' | 'outlined'
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, error, helpText, required, variant = 'default', className = '', ...props }, ref) => {
    const inputId = props.id || props.name || 'input'
    const hasError = !!error

    const baseInputClasses = `
      w-full px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      ${variant === 'outlined' 
        ? 'border border-gray-300 rounded-md' 
        : 'border-b-2 border-gray-200 bg-transparent'
      }
      ${hasError 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : 'border-gray-300 focus:border-blue-500'
      }
      ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    `

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1 ${hasError ? 'text-red-700' : 'text-gray-700'}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`${baseInputClasses} ${className}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />
        
        {error && (
          <p 
            id={`${inputId}-error`} 
            className="mt-1 text-sm text-red-600 flex items-center"
            role="alert"
          >
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

ValidatedInput.displayName = 'ValidatedInput'

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  variant?: 'default' | 'outlined'
}

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({ label, error, helpText, required, variant = 'default', className = '', ...props }, ref) => {
    const textareaId = props.id || props.name || 'textarea'
    const hasError = !!error

    const baseTextareaClasses = `
      w-full px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      ${variant === 'outlined' 
        ? 'border border-gray-300 rounded-md' 
        : 'border-b-2 border-gray-200 bg-transparent'
      }
      ${hasError 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : 'border-gray-300 focus:border-blue-500'
      }
      ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
      resize-y min-h-[80px]
    `

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className={`block text-sm font-medium mb-1 ${hasError ? 'text-red-700' : 'text-gray-700'}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={`${baseTextareaClasses} ${className}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined}
          {...props}
        />
        
        {error && (
          <p 
            id={`${textareaId}-error`} 
            className="mt-1 text-sm text-red-600 flex items-center"
            role="alert"
          >
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={`${textareaId}-help`} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

ValidatedTextarea.displayName = 'ValidatedTextarea'

interface ValidatedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  variant?: 'default' | 'outlined'
  options: { value: string; label: string; disabled?: boolean }[]
  placeholder?: string
}

export const ValidatedSelect = forwardRef<HTMLSelectElement, ValidatedSelectProps>(
  ({ label, error, helpText, required, variant = 'default', options, placeholder, className = '', ...props }, ref) => {
    const selectId = props.id || props.name || 'select'
    const hasError = !!error

    const baseSelectClasses = `
      w-full px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      ${variant === 'outlined' 
        ? 'border border-gray-300 rounded-md' 
        : 'border-b-2 border-gray-200 bg-transparent'
      }
      ${hasError 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
        : 'border-gray-300 focus:border-blue-500'
      }
      ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    `

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className={`block text-sm font-medium mb-1 ${hasError ? 'text-red-700' : 'text-gray-700'}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={`${baseSelectClasses} ${className}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p 
            id={`${selectId}-error`} 
            className="mt-1 text-sm text-red-600 flex items-center"
            role="alert"
          >
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={`${selectId}-help`} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

ValidatedSelect.displayName = 'ValidatedSelect'