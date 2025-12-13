import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Grid, Bookmark, User as UserIcon } from 'lucide-react'; // Renaming User to UserIcon to avoid conflict with type
import { getProfile } from '../../api/user';
import { getUserPosts } from '../../api/posts';
import { User, Post } from '../../types';
import { Button } from '../../components/ui/Button';

export default function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) loadProfile(parseInt(id));
    }, [id]);

    const loadProfile = async (userId: number) => {
        try {
            setIsLoading(true);
            const [userData, userPosts] = await Promise.all([
                getProfile(userId),
                getUserPosts(userId)
            ]);
            setProfile(userData);
            setPosts(userPosts);
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center">User not found</div>;

    return (
        <div>
            {/* Profile Header */}
            <header className="flex flex-col md:flex-row gap-8 mb-12 px-4 md:px-12">
                <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-32 h-32 md:w-[150px] md:h-[150px] rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <UserIcon className="w-16 h-16 text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <h2 className="text-xl font-normal truncate">{profile.username}</h2>
                        <div className="flex gap-2">
                            <Button className="px-4 py-1.5 h-8 text-sm" variant="secondary">
                                Edit Profile
                            </Button>
                            <Button className="px-2 py-1.5 h-8 w-8 !p-0" variant="secondary">
                                <Settings className="w-4 h-4 text-black" />
                            </Button>
                        </div>
                    </div>

                    <ul className="flex justify-around md:justify-start gap-10 mb-4 text-base">
                        <li><span className="font-semibold">{profile.posts_count}</span> posts</li>
                        <li><span className="font-semibold">{profile.followers_count}</span> followers</li>
                        <li><span className="font-semibold">{profile.following_count}</span> following</li>
                    </ul>

                    <div className="text-sm">
                        <p className="font-semibold">{profile.username}</p> {/* Usually full name, fallback to username */}
                        <p className="whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="border-t border-gray-200 mb-1">
                <div className="flex justify-center gap-12 text-xs font-semibold tracking-wider uppercase text-gray-500">
                    <button className="flex items-center gap-1.5 py-4 border-t border-black text-black -mt-px">
                        <Grid className="w-3 h-3" /> Posts
                    </button>
                    <button className="flex items-center gap-1.5 py-4 disabled:opacity-50">
                        <Bookmark className="w-3 h-3" /> Saved
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-1 md:gap-7">
                {posts.map((post) => (
                    <div key={post.id} className="relative aspect-square bg-gray-100 group cursor-pointer overflow-hidden">
                        <img src={post.image_url} alt="" className="w-full h-full object-cover" />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center gap-6 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1">
                                <HeartFilledIcon className="w-5 h-5 fill-white" />
                                {post.like_count}
                            </div>
                        </div>
                    </div>
                ))}
                {posts.length === 0 && (
                    <div className="col-span-3 py-10 text-center text-gray-500">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                                <Grid className="w-8 h-8 text-black" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-black mb-2">No Posts Yet</h3>
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple internal icon for hover state
const HeartFilledIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 48 48" className={className} width="24" height="24">
        <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
    </svg>
);
