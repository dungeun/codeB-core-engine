// Product Service - 제품 관련 비즈니스 로직

import { prisma } from '@/lib/prisma'
import { 
  CreateProductInput, 
  UpdateProductInput, 
  ProductFilterInput, 
  ProductSortInput,
  PaginationInput
} from '@/lib/validations/product'
import { ProductWithDetails, ProductsResponse, ProductStats } from '@/types/commerce'
import { Prisma } from '@prisma/client'

export class ProductService {
  /**
   * 제품 목록 조회 (페이지네이션, 필터링, 정렬 지원)
   */
  static async getProducts(
    filters?: ProductFilterInput,
    sort?: ProductSortInput,
    pagination?: PaginationInput
  ): Promise<ProductsResponse> {
    const { page = 1, limit = 12 } = pagination || {}
    const { field = 'createdAt', order = 'desc' } = sort || {}
    const skip = (page - 1) * limit

    // Where 조건 구성
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE' // 기본적으로 활성 상품만 조회
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } }
      ]
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {}
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice
      }
    }

    if (filters?.inStock) {
      where.stock = { gt: 0 }
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags }
    }

    // 데이터 조회
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [field]: order },
        include: {
          category: true,
          images: {
            orderBy: { position: 'asc' }
          },
          variants: true,
          reviews: {
            select: { rating: true }
          }
        }
      }),
      prisma.product.count({ where })
    ])

    // 평균 평점과 리뷰 수 계산
    const productsWithRating: ProductWithDetails[] = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        rating: Math.round(avgRating * 10) / 10, // 소수점 첫째자리까지
        reviewCount: product.reviews.length
      }
    })

    return {
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 제품 상세 조회
   */
  static async getProductById(id: string): Promise<ProductWithDetails | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' }
        },
        variants: {
          orderBy: { createdAt: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                profile: {
                  select: { profileImage: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!product) return null

    // 평균 평점 계산
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      : 0

    return {
      ...product,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length
    }
  }

  /**
   * 슬러그로 제품 조회
   */
  static async getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' }
        },
        variants: {
          orderBy: { createdAt: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                profile: {
                  select: { profileImage: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!product) return null

    // 평균 평점 계산
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      : 0

    return {
      ...product,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length
    }
  }

  /**
   * 제품 생성
   */
  static async createProduct(data: CreateProductInput) {
    const { images, ...productData } = data

    // 슬러그 자동 생성 (제공되지 않은 경우)
    if (!productData.slug) {
      productData.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }

    // 트랜잭션으로 제품과 이미지 생성
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
          publishedAt: productData.status === 'ACTIVE' ? new Date() : null,
          images: {
            create: images?.map((img, index) => ({
              url: img.url,
              alt: img.alt,
              position: img.position ?? index
            })) || []
          }
        },
        include: {
          category: true,
          images: {
            orderBy: { position: 'asc' }
          }
        }
      })

      return product
    })
  }

  /**
   * 제품 수정
   */
  static async updateProduct(data: UpdateProductInput) {
    const { id, images, ...updateData } = data

    return await prisma.$transaction(async (tx) => {
      // 상태가 ACTIVE로 변경되면 publishedAt 설정
      if (updateData.status === 'ACTIVE') {
        const currentProduct = await tx.product.findUnique({
          where: { id },
          select: { publishedAt: true }
        })
        
        if (!currentProduct?.publishedAt) {
          updateData.publishedAt = new Date()
        }
      }

      const product = await tx.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          images: {
            orderBy: { position: 'asc' }
          }
        }
      })

      // 이미지 업데이트 (제공된 경우)
      if (images) {
        // 기존 이미지 삭제
        await tx.productImage.deleteMany({
          where: { productId: id }
        })

        // 새 이미지 생성
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            productId: id,
            url: img.url,
            alt: img.alt,
            position: img.position ?? index
          }))
        })
      }

      return product
    })
  }

  /**
   * 제품 삭제 (소프트 삭제)
   */
  static async deleteProduct(id: string) {
    return await prisma.product.update({
      where: { id },
      data: { 
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    })
  }

  /**
   * 제품 통계 조회
   */
  static async getProductStats(): Promise<ProductStats> {
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      archivedProducts,
      outOfStockProducts,
      lowStockProducts,
      priceStats
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'DRAFT' } }),
      prisma.product.count({ where: { status: 'ARCHIVED' } }),
      prisma.product.count({ where: { stock: 0, trackStock: true } }),
      prisma.product.count({ where: { stock: { lte: 10, gt: 0 }, trackStock: true } }),
      prisma.product.aggregate({
        _avg: { price: true },
        _sum: { price: true }
      })
    ])

    return {
      totalProducts,
      activeProducts,
      draftProducts,
      archivedProducts,
      outOfStockProducts,
      lowStockProducts,
      averagePrice: Math.round(priceStats._avg.price || 0),
      totalValue: priceStats._sum.price || 0
    }
  }

  /**
   * 관련 상품 조회
   */
  static async getRelatedProducts(productId: string, limit: number = 6): Promise<ProductWithDetails[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, tags: true }
    })

    if (!product) return []

    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        status: 'ACTIVE',
        OR: [
          { categoryId: product.categoryId },
          { tags: { hasSome: product.tags } }
        ]
      },
      take: limit,
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return relatedProducts.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        variants: [],
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length
      }
    })
  }

  /**
   * 재고 업데이트
   */
  static async updateStock(productId: string, quantity: number, operation: 'add' | 'subtract' = 'subtract') {
    return await prisma.product.update({
      where: { id: productId },
      data: {
        stock: operation === 'add' 
          ? { increment: quantity }
          : { decrement: quantity }
      }
    })
  }
}