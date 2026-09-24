import React from 'react';
import { HeartIcon as HeartOutlineIcon, ChatBubbleLeftIcon, HandThumbUpIcon as HandThumbUpOutlineIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';

interface ActionButtonsProps {
  // Props for post actions
  isLiked?: boolean;
  likeCount?: number;
  onLike?: () => void;
  commentCount?: number;
  onOpenComments?: () => void;

  // Props for comment specific good button (optional)
  isCommentLiked?: boolean;
  commentLikeCount?: number;
  onCommentLike?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isLiked,
  likeCount,
  onLike,
  commentCount,
  onOpenComments,
  isCommentLiked,
  commentLikeCount,
  onCommentLike,
}) => {
  const showPostActions = onLike !== undefined && onOpenComments !== undefined;
  const showCommentActions = onCommentLike !== undefined;

  return (
    <div className="flex items-center space-x-4 text-gray-500">
      {/* Post Actions */}
      {showPostActions && (
        <>
          {/* Like Button */}
          <button
            onClick={onLike}
            className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            aria-label={isLiked ? 'いいねを取り消す' : 'いいねする'}
          >
            {isLiked ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartOutlineIcon className="w-5 h-5 hover:text-red-500" />
            )}
            <span className="text-sm font-medium">{likeCount ?? 0}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={onOpenComments}
            className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            aria-label="コメントを開く"
          >
            <ChatBubbleLeftIcon className="w-5 h-5 hover:text-blue-500" />
            <span className="text-sm font-medium">{commentCount ?? 0}</span>
          </button>
        </>
      )}

      {/* Comment Good Button - Optional */}
      {showCommentActions && (
        <button
          onClick={onCommentLike}
          className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
          aria-label={isCommentLiked ? 'グッドを取り消す' : 'グッドする'}
        >
          {isCommentLiked ? (
            <HandThumbUpSolidIcon className="w-5 h-5 text-blue-500" />
          ) : (
            <HandThumbUpOutlineIcon className="w-5 h-5 hover:text-blue-500" />
          )}
          <span className="text-sm font-medium">{commentLikeCount ?? 0}</span>
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
