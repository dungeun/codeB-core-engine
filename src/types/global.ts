// 전역 타입 정의
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface User extends BaseEntity {
  email: string
  name: string
  role: UserRole
  status: UserStatus
  emailVerified?: boolean
  lastLogin?: string
  preferences?: UserPreferences
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED'
}

export interface UserPreferences {
  language: string
  theme: 'light' | 'dark' | 'system'
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    profilePublic: boolean
    activityPublic: boolean
  }
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
  requestId?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  path?: string
  timestamp: string
}

// 필터 및 정렬 타입
export interface BaseFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: SortOrder
  dateFrom?: string
  dateTo?: string
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

// 메타데이터 타입
export interface EntityMetadata {
  version: number
  tags?: string[]
  source?: string
  lastModifiedBy?: string
  archived?: boolean
  draft?: boolean
}

// 파일 관련 타입
export interface FileUpload {
  file: File
  url?: string
  progress?: number
  error?: string
  uploaded?: boolean
}

export interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  metadata?: Record<string, any>
  uploadedAt: string
  uploadedBy?: string
}

// 주소 타입
export interface Address {
  id?: string
  fullName: string
  phone: string
  email?: string
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault?: boolean
  type?: 'shipping' | 'billing'
}

// 통화 및 가격 타입
export interface Money {
  amount: number
  currency: string
  formatted?: string
}

export interface PriceRange {
  min: Money
  max: Money
}

// 언어 및 로케일
export interface Locale {
  code: string
  name: string
  flag?: string
  rtl?: boolean
}

export interface Translation {
  key: string
  value: string
  locale: string
  namespace?: string
  pluralization?: Record<string, string>
}

// 권한 및 역할
export interface Permission {
  id: string
  name: string
  description?: string
  resource: string
  action: string
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
  isSystem?: boolean
}

// 알림 타입
export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  userId: string
  data?: Record<string, any>
  createdAt: string
  expiresAt?: string
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ORDER = 'order',
  SYSTEM = 'system'
}

// 세션 타입
export interface SessionData {
  id: string
  userId?: string
  cartId?: string
  createdAt: Date
  expiresAt: Date
  metadata?: Record<string, any>
}

// 폼 관련 타입
export interface FormField<T = any> {
  name: string
  value: T
  error?: string
  touched?: boolean
  disabled?: boolean
  required?: boolean
}

export interface FormState<T = Record<string, any>> {
  data: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  isDirty: boolean
}

// 테이블 및 리스트 타입
export interface TableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: T) => React.ReactNode
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    current: number
    total: number
    pageSize: number
    onChange: (page: number, pageSize: number) => void
  }
  selection?: {
    selectedKeys: string[]
    onChange: (selectedKeys: string[]) => void
  }
  actions?: {
    create?: () => void
    edit?: (record: T) => void
    delete?: (record: T) => void
    view?: (record: T) => void
  }
}

// 컴포넌트 공통 Props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
  id?: string
  'data-testid'?: string
}

export interface LoadingProps {
  loading?: boolean
  loadingText?: string
  skeleton?: boolean
}

export interface ErrorProps {
  error?: string | Error | null
  onRetry?: () => void
  fallback?: React.ReactNode
}

// 상태 관리 타입
export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  lastFetch?: Date
}

export interface CacheConfig {
  ttl?: number // Time to live in milliseconds
  maxAge?: number
  staleWhileRevalidate?: boolean
}

// 환경 및 설정
export interface AppConfig {
  apiUrl: string
  environment: 'development' | 'staging' | 'production'
  version: string
  features: Record<string, boolean>
  analytics?: {
    enabled: boolean
    provider: string
    trackingId?: string
  }
  storage: {
    provider: 'local' | 's3' | 'cloudinary'
    bucket?: string
    region?: string
  }
}

// 로그 및 모니터링
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
  userId?: string
  sessionId?: string
}

export interface HealthCheck {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  responseTime?: number
  error?: string
  metadata?: Record<string, any>
}