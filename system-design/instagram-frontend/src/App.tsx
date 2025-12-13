import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import FeedPage from './pages/feed/FeedPage';
import CreatePage from './pages/create/CreatePage';
import ProfilePage from './pages/profile/ProfilePage';

// Placeholder for Search Page
const SearchPage = () => <div className="text-center p-8">Search Feature Coming Soon</div>;

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route element={<Layout />}>
                    <Route path="/" element={<FeedPage />} />
                    <Route path="/create" element={<CreatePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
