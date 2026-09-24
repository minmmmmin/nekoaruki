'use client'

import { useEffect, useState, Dispatch, SetStateAction } from 'react'
import { useSearchParams } from 'next/navigation'
import PostCard from './PostCard'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/post'
import CommentPanel from './CommentPanel'

type FetchedPost = {
  post_id: number
  user_id: string
  caption: string | null
  image_url: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  users: { name: string; avatar_url: string | null } | null
  comments: { count: number }[] | null
}

type FavoriteRow = {
  post_id: number
  user_id: string
}

interface TimelineProps {
  view: 'split' | 'map' | 'timeline'
  setView: Dispatch<SetStateAction<'split' | 'map' | 'timeline'>>
  isPC?: boolean
  onMoveMap: (lat: number, lng: number) => void
  onImageClick: (imageUrl: string) => void
}

const Timeline = ({ view, setView, isPC, onMoveMap, onImageClick }: TimelineProps) => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null)

  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')

  const handleDeletePost = (postId: number) => {
    setPosts((currentPosts) => currentPosts.filter((p) => p.post_id !== postId))
  }

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let query = supabase.from('posts').select(`
          post_id,
          user_id,
          caption,
          image_url,
          latitude,
          longitude,
          created_at,
          users!posts_user_id_fkey (
            name,
            avatar_url
          ),
          comments!post_id(count)
        `)

      if (filter === 'my_posts' && user) {
        query = query.eq('user_id', user.id)
      } else if (filter === 'favorites' && user) {
        const { data: favoritePosts, error: favError } = await supabase
          .from('favorites')
          .select('post_id')
          .eq('user_id', user.id)

        if (favError) {
          console.error('Error fetching favorites:', favError)
          setError(favError.message)
          setPosts([])
          setLoading(false)
          return
        }

        const postIds = favoritePosts.map((fav) => fav.post_id)
        if (postIds.length === 0) {
          setPosts([])
          setLoading(false)
          return
        }
        query = query.in('post_id', postIds)
      } else if ((filter === 'my_posts' || filter === 'favorites') && !user) {
        setPosts([])
        setLoading(false)
        return
      }

      const { data, error: queryError } = await query.order('created_at', { ascending: false })

      if (queryError) {
        console.error('Error fetching posts:', queryError)
        setError(queryError.message)
        setPosts([])
        setLoading(false)
        return
      }

      const rows = (data as unknown as FetchedPost[] | null) ?? []
      if (rows.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }

      const postIds = rows.map((r) => r.post_id)
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('post_id, user_id')
        .in('post_id', postIds)

      if (favError) {
        console.error('Error fetching favorites:', favError)
        setError(favError.message)
      }

      const favs = (favData as FavoriteRow[] | null) ?? []
      const likeCountMap = new Map<number, number>()
      const likedSet = new Set<number>()

      for (const f of favs) {
        likeCountMap.set(f.post_id, (likeCountMap.get(f.post_id) ?? 0) + 1)
        if (user && f.user_id === user.id) likedSet.add(f.post_id)
      }

      const mappedPosts: Post[] = rows.map((row) => ({
        post_id: row.post_id,
        user_id: row.user_id,
        created_at: row.created_at,
        latitude: row.latitude,
        longitude: row.longitude,
        image_url: row.image_url,
        caption: row.caption,
        username: row.users?.name ?? 'unknown',
        avatar_url: row.users?.avatar_url ?? undefined,
        location: undefined,
        likeCount: likeCountMap.get(row.post_id) ?? 0,
        isLiked: likedSet.has(row.post_id),
        commentCount: row.comments?.[0]?.count ?? 0,
        replies: [],
      }))

      setPosts(mappedPosts)
      setLoading(false)
    }

    fetchPosts()
  }, [filter])

  return (
    <>
      <div className="relative bg-gray-100 h-full overflow-y-auto">
        {view !== 'map' && !isPC && (
          <div className="sticky top-4 z-20 h-0">
            <div className="flex justify-end pr-4">
              <button
                onClick={() => setView(view === 'split' ? 'timeline' : 'split')}
                className="bg-white/70 backdrop-blur-sm p-2 rounded-md shadow-lg hover:bg-white cursor-pointer"
              >
                <Image
                  src={view === 'split' ? '/fullscreen_icon.png' : '/fullscreen_close_icon.png'}
                  alt="Toggle Fullscreen"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>

        )}

        <div className="max-w-xl mx-auto bg-white border-x border-gray-200">
          {loading && <div className="p-4 text-sm opacity-60">読み込み中…</div>}
          {error && <div className="p-4 text-sm text-red-600">取得に失敗しました: {error}</div>}

          {!loading && !error && posts.length === 0 && (
            <div className="p-4 text-sm opacity-60">投稿はまだありません。</div>
          )}

          {!loading &&
            !error &&
            posts.map((post) => (
              <PostCard
                key={post.post_id}
                post={post}
                onMoveMap={onMoveMap}
                onCommentClick={(postId) => setCommentingPostId(postId)}
                onImageClick={onImageClick}
                onDelete={handleDeletePost}
              />
            ))}
        </div>
      </div>

      {commentingPostId !== null && (
        <CommentPanel postId={commentingPostId} onClose={() => setCommentingPostId(null)} />
      )}
    </>
  )
}

export default Timeline
