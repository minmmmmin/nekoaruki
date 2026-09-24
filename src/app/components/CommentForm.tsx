'use client'

import { useState, useRef, useCallback, useEffect, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface CommentFormProps {
  postId: number
  user: User | null
  onCommentPosted: () => void
}

const CommentForm = ({ postId, user, onCommentPosted }: CommentFormProps) => {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0px'
    const next = Math.min(el.scrollHeight, 140)
    el.style.height = `${next}px`
  }, [])

  useEffect(() => {
    autoResize()
  }, [newComment, autoResize])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting || !user) return

    setIsSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      comment: newComment.trim(),
    })

    if (insertError) {
      console.error('Error posting comment:', insertError)
      setError('コメントの投稿に失敗しました。')
    } else {
      setNewComment('')
      onCommentPosted()
    }

    setIsSubmitting(false)
  }

  if (!user) {
    return (
      <div className="border-t border-base-200 bg-base-100 px-4 py-4 text-center text-sm text-base-content/70">
        コメントを投稿するには{' '}
        <a href="/login" className="bg-secondary text-secondary-content px-3 py-1 rounded-md">
          ログイン
        </a>
        {' '}が必要です。
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-base-200 bg-base-100">
      <div className="px-4 py-3">
        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onInput={autoResize}
          placeholder="コメントを追加…"
          className={['textarea textarea-bordered w-full', 'text-sm leading-relaxed', 'min-h-[44px]', 'resize-none', 'focus:outline-none'].join(' ')}
          rows={1}
          disabled={isSubmitting}
        />
        {error && <p className="text-error text-sm mt-1">{error}</p>}
        <div className="mt-2 flex items-center justify-end">
          <button type="submit" disabled={!newComment.trim() || isSubmitting} className="btn btn-accent btn-sm">
            {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : '投稿'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default CommentForm
