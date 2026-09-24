'use client'

import { useState, useContext } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatPostDate } from '@/lib/dateUtils'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/post'
import { LayoutContext } from '@/lib/contexts/LayoutContext'

import { MapPinIcon, TrashIcon } from '@heroicons/react/24/outline'

import ActionButtons from './ActionButtons'

const supabase = createClient()

interface PostCardProps {
  post: Post
  onCommentClick: (postId: number) => void
  onMoveMap: (lat: number, lng: number) => void
  onImageClick: (imageUrl: string) => void
  onDelete?: (postId: number) => void
}

const PostCard = ({ post, onCommentClick, onMoveMap, onImageClick, onDelete }: PostCardProps) => {
  const router = useRouter()
  const layoutContext = useContext(LayoutContext)
  if (!layoutContext) {
    throw new Error('LayoutContext must be used within a LayoutProvider')
  }
  const { user, setIsLoginPromptOpen } = layoutContext

  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [pending, setPending] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLikeClick = async () => {
    if (pending) return
    if (!user) {
      setIsLoginPromptOpen(true)
      return
    }

    setPending(true)

    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1))

    try {
      if (nextLiked) {
        const { error } = await supabase.from('favorites').insert({
          post_id: post.post_id,
          user_id: user.id,
        })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('post_id', post.post_id)
          .eq('user_id', user.id)
        if (error) throw error
      }
    } catch (e) {
      setIsLiked(!nextLiked)
      setLikeCount((prev) => prev - (nextLiked ? 1 : -1))
      console.error(e)
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async () => {
    if (!user || user.id !== post.user_id || isDeleting) return

    if (window.confirm('この投稿を本当に削除しますか？')) {
      setIsDeleting(true)
      try {
        const response = await fetch(`/api/posts/${post.post_id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          // APIから返されたエラーメッセージを取得
          const errorData = await response.json().catch(() => ({})) // JSONパース失敗時は空オブジェクト
          throw new Error(errorData.error || `サーバーエラー: ${response.status}`)
        }

        // 成功時、親コンポーネントのコールバックを呼ぶか、ページを再更新する
        if (onDelete) {
          onDelete(post.post_id)
        } else {
          router.refresh()
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : '不明なエラーが発生しました。'
        console.error('削除に失敗しました:', errorMessage)
        alert(`投稿の削除に失敗しました: ${errorMessage}`)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const isOwnPost = user?.id === post.user_id

  return (
    <div className="relative flex space-x-3 p-4 border-b border-gray-200">
      {/* Created At & Delete Button */}
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <span className="text-xs text-gray-400">
          {post.created_at && formatPostDate(post.created_at)}
        </span>
        {isOwnPost && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 disabled:opacity-50 cursor-pointer"
            title="投稿を削除"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={post.avatar_url || '/images/dummycat.png'}
            alt={post.username || 'user avatar'}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
      </div>

      {/* Post content */}
      <div className="flex-1">
        {/* User Info */}
        <div className="flex items-center space-x-2">
          <span className="text-base text-black">{post.username}</span>

          {post.location && <span className="text-xs text-gray-500">{post.location}</span>}

          {/* 地図移動ボタン */}
          {post.latitude && post.longitude && (
            <button
              type="button"
              className="btn btn-xs btn-outline gap-1 text-gray-700 cursor-pointer"
              title="地図で場所を見る"
              onClick={() => onMoveMap(post.latitude!, post.longitude!)}
            >
              <MapPinIcon className="w-4 h-4" aria-hidden="true" />
              地図で見る
            </button>
          )}
        </div>

        {/* Post Body */}
        <p className="text-sm mt-1">{post.caption}</p>

        {/* Post Image */}
        {post.image_url && (
          <div
            className="mt-3 rounded-2xl overflow-hidden cursor-pointer hover:opacity-90"
            onClick={() => onImageClick(post.image_url!)}
          >
            <Image
              src={post.image_url}
              alt="猫の画像"
              width={500}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3">
          <ActionButtons
            isLiked={isLiked}
            likeCount={likeCount}
            onLike={handleLikeClick}
            commentCount={post.commentCount}
            onOpenComments={() => onCommentClick(post.post_id)}
          />
        </div>
      </div>
    </div>
  )
}

export default PostCard
