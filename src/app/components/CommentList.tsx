'use client'

import type { User } from '@supabase/supabase-js'
import type { Comment } from '@/types/comment'
import CommentItem from './CommentItem'

interface CommentListProps {
  loading: boolean
  error: string | null
  comments: Comment[]
  user: User | null
  toggleReaction: (commentId: number, wasLiked: boolean) => void
  deleteComment: (commentId: number) => Promise<void>
}

const CommentList = ({
  loading,
  error,
  comments,
  user,
  toggleReaction,
  deleteComment,
}: CommentListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="loading loading-spinner loading-md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span className="text-sm">{error}</span>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center text-sm text-base-content/60 py-10">まだコメントはありません。</div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, idx) => (
        <CommentItem
          key={comment.comment_id}
          comment={comment}
          user={user}
          toggleReaction={toggleReaction}
          deleteComment={deleteComment}
          style={{ animationDelay: `${Math.min(idx * 18, 180)}ms` }}
        />
      ))}
    </div>
  )
}

export default CommentList
