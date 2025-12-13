import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../api/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            setError('');
            const response = await registerApi(data);
            login(response.token, response.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-[350px] space-y-4">
                <div className="bg-white border border-gray-300 p-8 flex flex-col items-center">
                    <h1 className="text-4xl font-sans mb-4 italic">Instagram</h1>
                    <p className="mb-6 text-text-gray font-semibold text-center leading-5">
                        Sign up to see photos and videos from your friends.
                    </p>

                    <Button fullWidth className="mb-4">Log in with Facebook</Button>

                    <div className="flex items-center w-full mb-4">
                        <div className="h-px bg-gray-300 flex-1" />
                        <span className="px-4 text-xs text-gray-400 font-semibold">OR</span>
                        <div className="h-px bg-gray-300 flex-1" />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
                        <Input
                            type="text"
                            placeholder="Username"
                            error={errors.username?.message as string}
                            {...register('username', {
                                required: 'Username is required',
                                minLength: { value: 3, message: 'Minimum 3 characters' }
                            })}
                        />
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
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Minimum 6 characters' }
                            })}
                        />

                        <p className="text-xs text-text-gray text-center my-4">
                            By signing up, you agree to our Terms, Privacy Policy and Cookies Policy.
                        </p>

                        <Button type="submit" fullWidth disabled={isSubmitting}>
                            {isSubmitting ? 'Signing up...' : 'Sign up'}
                        </Button>
                    </form>

                    {error && <p className="mt-4 text-xs text-red-500 text-center">{error}</p>}
                </div>

                <div className="bg-white border border-gray-300 p-6 text-center text-sm">
                    <p>
                        Have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
