export interface Comment {
  comment_id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  users: {
    name: string;
    avatar_url: string | null;
  } | null;

  likeCount: number;
  isLiked: boolean;
}
