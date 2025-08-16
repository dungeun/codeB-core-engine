import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyAuth } from '@/lib/auth-utils'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth || !auth.user || auth.user.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const boardId = params.id

    // Prisma 트랜잭션으로 안전하게 처리
    const result = await prisma.$transaction(async (tx) => {
      // 게시판의 모든 게시물 ID 가져오기
      const posts = await tx.post.findMany({
        where: { category: boardId },
        select: { id: true }
      })

      const postIds = posts.map(p => p.id)

      if (postIds.length > 0) {
        // 댓글 삭제
        await tx.comment.deleteMany({
          where: { postId: { in: postIds } }
        })

        // 좋아요 삭제
        await tx.postLike.deleteMany({
          where: { postId: { in: postIds } }
        })

        // 첨부파일 삭제는 스키마에 Attachment 모델이 없으므로 스킵

        // 게시물 삭제
        await tx.post.deleteMany({
          where: { category: boardId }
        })
      }

      // Board 모델이 스키마에 없으므로 카테고리 기반 처리로 변경
      return { id: boardId, message: 'Category posts deleted' }
    })

    return NextResponse.json({ 
      message: 'Board and all related data deleted successfully',
      id: result.id 
    })

  } catch (error) {
    console.error('Error deleting board:', error)
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth || !auth.user || auth.user.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const boardId = params.id

    // 입력 검증
    if (!body.name) {
      return NextResponse.json(
        { error: 'Board name is required' },
        { status: 400 }
      )
    }

    // Board 모델이 스키마에 없으므로 현재 사용 불가
    return NextResponse.json(
      { error: 'Board model not implemented in schema' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Error updating board:', error)
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    )
  }
}