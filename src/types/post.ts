import type { Reply } from './reply'
export interface Post {
  post_id: number // ここが主キー（int8）
  user_id: string // uuid
  username: string
  avatar_url?: string
  location?: string

  caption: string | null
  image_url: string | null

  created_at: string
  latitude: number | null
  longitude: number | null

  likeCount: number
  isLiked: boolean

  commentCount: number
  replies: Reply[]
}
