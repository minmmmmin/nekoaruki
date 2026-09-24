'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import type { Comment } from '@/types/comment'
import { formatPostDate } from '@/lib/dateUtils'
import ActionButtons from './ActionButtons'
import { TrashIcon } from '@heroicons/react/24/outline'

interface CommentItemProps {
  comment: Comment
  user: User | null
  toggleReaction: (commentId: number, wasLiked: boolean) => void
  deleteComment: (commentId: number) => Promise<void>
  style: React.CSSProperties
}

const CommentItem = ({
  comment,
  user,
  toggleReaction,
  deleteComment,
  style,
}: CommentItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwnComment = user?.id === comment.user_id

  const handleDelete = async () => {
    if (!isOwnComment || isDeleting) return
    if (window.confirm('このコメントを本当に削除しますか？')) {
      setIsDeleting(true)
      await deleteComment(comment.comment_id)
      // 削除処理が完了しても isDeleting はそのままでOK（コンポーネントが消えるため）
    }
  }

  return (
    <div
      className={['flex gap-3', 'animate-[commentIn_220ms_ease-out_both]'].join(' ')}
      style={style}
    >
      {/* avatar */}
      <div className="shrink-0">
        <div className="avatar">
          <div className="w-9 h-9 rounded-full ring-1 ring-base-200">
            <Image
              src={comment.users?.avatar_url || '/images/dummycat.png'}
              alt={comment.users?.name || 'user avatar'}
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* main */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm truncate">{comment.users?.name ?? '名無しさん'}</div>
              <div className="text-xs text-base-content/60">
                {formatPostDate(comment.created_at)}
              </div>
            </div>
          </div>
          {isOwnComment && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-base-content/50 hover:text-error disabled:opacity-50 shrink-0 cursor-pointer"
              title="コメントを削除"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-1 text-sm whitespace-pre-wrap break-words leading-relaxed">
          {comment.content}
        </div>

        <div className="mt-1 -ml-2">
          <ActionButtons
            isCommentLiked={comment.isLiked}
            commentLikeCount={comment.likeCount}
            onCommentLike={user ? () => toggleReaction(comment.comment_id, comment.isLiked) : undefined}
          />
        </div>
      </div>
    </div>
  )
}

export default CommentItem
