'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Comment } from '@/types/comment'

type CommentRow = {
  comment_id: number
  post_id: number
  user_id: string
  content: string
  created_at: string
  users:
    | { name: string | null; avatar_url: string | null }
    | { name: string | null; avatar_url: string | null }[]
    | null
  comment_favorites?: { count: number }[] | null
}

export type SortType = 'popular' | 'new'

export const useComments = (postId: number) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [sort, setSort] = useState<SortType>('popular')

  const supabase = useMemo(() => createClient(), [])

  const fetchComments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // ユーザー情報を取得
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      // コメント一覧を取得
      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(
          `
          comment_id,
          post_id,
          user_id,
          content:comment,
          created_at,
          users!comments_user_id_fkey (
            name,
            avatar_url
          ),
          comment_favorites(count)
        `,
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (fetchError) {
        console.error('Error fetching comments:', fetchError)
        setError('コメントの取得に失敗しました。')
        setComments([])
        return
      }

      const rows = (data as CommentRow[] | null) ?? []

      const baseComments: Comment[] = rows.map((row) => {
        const u = Array.isArray(row.users) ? row.users[0] : row.users
        const likeCount = row.comment_favorites?.[0]?.count ?? 0

        return {
          comment_id: row.comment_id,
          post_id: row.post_id,
          user_id: row.user_id,
          content: row.content,
          created_at: row.created_at,
          users: u ? { name: u.name ?? '名無しさん', avatar_url: u.avatar_url ?? null } : null,
          likeCount,
          isLiked: false,
        }
      })

      // ログインしていない場合はいいね状態をチェックせずに終了
      if (!user) {
        setComments(baseComments)
        return
      }

      const commentIds = baseComments.map((c) => c.comment_id)
      if (commentIds.length === 0) {
        setComments(baseComments)
        return
      }

      const { data: likedRows, error: likedError } = await supabase
        .from('comment_favorites')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds)

      if (likedError) {
        console.error('Error fetching comment favorites:', likedError)
        setComments(baseComments) // いいね取得失敗でもコメントは表示
        return
      }

      const likedSet = new Set((likedRows ?? []).map((r) => r.comment_id))

      setComments(
        baseComments.map((c) => ({
          ...c,
          isLiked: likedSet.has(c.comment_id),
        })),
      )
    } finally {
      setLoading(false)
    }
  }, [supabase, postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const visibleComments = useMemo(() => {
    const arr = [...comments]

    if (sort === 'new') {
      return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    // 人気順：likeCount desc → 同点なら新しい方を上
    return arr.sort((a, b) => {
      const d = (b.likeCount ?? 0) - (a.likeCount ?? 0)
      if (d !== 0) return d
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [comments, sort])

  const toggleReaction = useCallback(
    async (commentId: number, wasLiked: boolean) => {
      if (!user) return

      // optimistic update
      setComments((prev) =>
        prev.map((c) => {
          if (c.comment_id !== commentId) return c
          const nextLiked = !wasLiked
          return {
            ...c,
            isLiked: nextLiked,
            likeCount: (c.likeCount ?? 0) + (nextLiked ? 1 : -1),
          }
        }),
      )

      try {
        if (!wasLiked) {
          const { error } = await supabase.from('comment_favorites').insert({
            comment_id: commentId,
            user_id: user.id,
          })
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('comment_favorites')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
          if (error) throw error
        }
      } catch (e) {
        console.error(e)
        // rollback
        setComments((prev) =>
          prev.map((c) => {
            if (c.comment_id !== commentId) return c
            return {
              ...c,
              isLiked: wasLiked,
              likeCount: (c.likeCount ?? 0) + (wasLiked ? 1 : -1),
            }
          }),
        )
      }
    },
    [supabase, user],
  )

  const deleteComment = useCallback(
    async (commentId: number) => {
      if (!user) return

      const originalComments = comments
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId))

      try {
        const { error } = await supabase.from('comments').delete().eq('comment_id', commentId)

        if (error) throw error
      } catch (e) {
        console.error('コメントの削除に失敗しました:', e)
        setComments(originalComments)
        alert('コメントの削除に失敗しました。')
      }
    },
    [supabase, user, comments],
  )

  return {
    comments,
    loading,
    error,
    user,
    sort,
    setSort,
    visibleComments,
    fetchComments,
    toggleReaction,
    deleteComment,
  }
}
