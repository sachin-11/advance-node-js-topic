import { Home, Search, PlusSquare, User, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Search, label: 'Search', path: '/search' },
        { icon: PlusSquare, label: 'Create', path: '/create' },
        { icon: User, label: 'Profile', path: `/profile/${user?.id}` },
    ];

    return (
        <div className="fixed left-0 top-0 h-full w-[245px] border-r border-gray-300 bg-white px-3 py-8 hidden md:flex flex-col">
            <div className="mb-10 px-3">
                <h1 className="text-2xl font-sans italic">Instagram</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-gray-50 transition-colors",
                                isActive ? "font-bold" : "font-normal"
                            )
                        }
                    >
                        <item.icon className="h-6 w-6" />
                        <span className="text-base">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={handleLogout}
                className="flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-gray-50 transition-colors w-full text-left"
            >
                <LogOut className="h-6 w-6" />
                <span className="text-base">Log out</span>
            </button>
        </div>
    );
}
