import { useEffect, useState } from 'react';
import { getFeed } from '../../api/posts';
// import { DUMMY_POSTS } from '../../data/dummy';
import { Post } from '../../types';
import PostCard from '../../components/feed/PostCard';
import { Button } from '../../components/ui/Button';

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        try {
            setIsLoading(true);
            const feedData = await getFeed();
            // For now, assuming API returns array directly or { data: [] }
            // This handles both cases for flexibility during integration
            const postsArray = Array.isArray(feedData) ? feedData : feedData.data || [];
            setPosts(postsArray);
        } catch (err) {
            setError('Failed to load feed.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center p-8">Loading posts...</div>;
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={loadFeed} variant="secondary">Try Again</Button>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center p-12">
                <h2 className="text-xl font-bold mb-2">Welcome to Instagram!</h2>
                <p className="text-gray-500">Follow people to see their posts here.</p>
                <div className="mt-8 grid gap-4 max-w-sm mx-auto">
                    {/* Mock empty state suggestions would go here */}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[470px] mx-auto py-4">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
