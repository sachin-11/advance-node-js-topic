import { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { Post } from '../../types';
import { likePost, unlikePost } from '../../api/interactions';
import clsx from 'clsx'; // Assuming clsx is installed, if not use string template

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const [liked, setLiked] = useState(false); // Default to false as backend doesn't send this yet
    const [likesCount, setLikesCount] = useState(post.like_count || 0);
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    const handleLike = async () => {
        if (isLikeLoading) return;
        try {
            setIsLikeLoading(true);
            const newLiked = !liked;
            setLiked(newLiked);
            setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

            if (newLiked) {
                await likePost(post.id);
            } else {
                await unlikePost(post.id);
            }
        } catch (error) {
            console.error('Failed to toggle like', error);
            // Revert on error
            setLiked(!liked);
            setLikesCount(prev => !liked ? prev + 1 : prev - 1);
        } finally {
            setIsLikeLoading(false);
        }
    };

    return (
        <article className="border-b border-gray-200 pb-4 mb-4 last:border-none">
            {/* Header */}
            <div className="flex items-center justify-between py-3 px-1">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                        {post.user?.avatar_url ? (
                            <img src={post.user.avatar_url} alt={post.user.username} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full bg-gray-300" />
                        )}
                    </div>
                    <span className="font-semibold text-sm cursor-pointer hover:opacity-70">
                        {post.user?.username}
                    </span>
                </div>
                <button className="text-gray-500 font-bold">...</button>
            </div>

            {/* Image */}
            <div className="aspect-square w-full bg-gray-100 rounded border border-gray-200 overflow-hidden">
                <img src={post.image_url} alt="Post content" className="w-full h-full object-cover" />
            </div>

            {/* Actions */}
            <div className="mt-3">
                <div className="flex justify-between mb-2">
                    <div className="flex gap-4">
                        <Heart
                            className={clsx("h-6 w-6 cursor-pointer hover:opacity-50 transition-colors", {
                                "fill-red-500 text-red-500": liked,
                                "text-black": !liked
                            })}
                            onClick={handleLike}
                        />
                        <MessageCircle className="h-6 w-6 cursor-pointer hover:text-gray-500" />
                        <Send className="h-6 w-6 cursor-pointer hover:text-gray-500" />
                    </div>
                    <Bookmark className="h-6 w-6 cursor-pointer hover:text-gray-500" />
                </div>

                <p className="font-semibold text-sm mb-1">{likesCount} likes</p>

                <div className="text-sm">
                    <span className="font-semibold mr-2">{post.user?.username}</span>
                    <span>{post.caption}</span>
                </div>

                {post.comment_count > 0 && (
                    <button className="text-gray-500 text-sm mt-1 cursor-pointer hover:text-gray-700">
                        View all {post.comment_count} comments
                    </button>
                )}

                <p className="text-gray-500 text-xs mt-1 uppercase">
                    {new Date(post.created_at).toLocaleDateString()}
                </p>
            </div>
        </article >
    );
}
