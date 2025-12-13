import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            setError('');
            const response = await loginApi(data);
            login(response.token, response.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-[350px] space-y-4">
                <div className="bg-white border border-gray-300 p-8 flex flex-col items-center">
                    <h1 className="text-4xl font-sans mb-8 italic">Instagram</h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
                        <Input
                            type="email"
                            placeholder="Email"
                            error={errors.email?.message as string}
                            {...register('email', { required: 'Email is required' })}
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            error={errors.password?.message as string}
                            {...register('password', { required: 'Password is required' })}
                        />

                        <Button type="submit" fullWidth disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Log in'}
                        </Button>
                    </form>

                    {error && <p className="mt-4 text-xs text-red-500 text-center">{error}</p>}

                    <div className="mt-4 flex items-center w-full">
                        <div className="h-px bg-gray-300 flex-1" />
                        <span className="px-4 text-xs text-gray-400 font-semibold">OR</span>
                        <div className="h-px bg-gray-300 flex-1" />
                    </div>

                    <button className="mt-4 text-sm text-[#385185] font-semibold">
                        Log in with Facebook
                    </button>
                </div>

                <div className="bg-white border border-gray-300 p-6 text-center text-sm">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
