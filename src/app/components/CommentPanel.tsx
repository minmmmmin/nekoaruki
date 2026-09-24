'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useComments } from '@/lib/hooks/useComments'
import CommentPanelHeader from './CommentPanelHeader'
import CommentList from './CommentList'
import CommentForm from './CommentForm'

interface CommentPanelProps {
  postId: number
  onClose: () => void
}

const CLOSE_ANIM_MS = 180

const CommentPanel = ({ postId, onClose }: CommentPanelProps) => {
  const {
    loading,
    error,
    user,
    sort,
    setSort,
    visibleComments,
    fetchComments,
    toggleReaction,
    deleteComment,
  } = useComments(postId)

  const [mounted, setMounted] = useState(true)
  const [closing, setClosing] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  const safeClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => {
      setMounted(false)
      onClose()
    }, CLOSE_ANIM_MS)
  }, [closing, onClose])

  // esc close + body scroll lock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') safeClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [safeClose])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 z-[101] flex items-end sm:items-center sm:justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="コメント"
    >
      {/* overlay */}
      <button
        type="button"
        aria-label="閉じる"
        onClick={safeClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* panel */}
      <div
        className={`relative w-full sm:max-w-2xl bg-base-100 text-base-content rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden transition-transform duration-200 will-change-transform ${closing ? 'translate-y-6 sm:translate-y-2' : 'translate-y-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <CommentPanelHeader
          loading={loading}
          commentCount={visibleComments.length}
          sort={sort}
          setSort={setSort}
          onClose={safeClose}
        />

        {/* body */}
        <div className="h-[64vh] sm:h-[72vh] flex flex-col">
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3">
            <CommentList
              loading={loading}
              error={error}
              comments={visibleComments}
              user={user}
              toggleReaction={toggleReaction}
              deleteComment={deleteComment}
            />
          </div>

          <CommentForm postId={postId} user={user} onCommentPosted={fetchComments} />
        </div>

        <style jsx global>{`
          @keyframes commentIn {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes reactionPop {
            0% {
              transform: scale(0.9);
            }
            60% {
              transform: scale(1.15);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  )
}

export default CommentPanel