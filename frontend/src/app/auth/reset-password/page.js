'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('Reset token is missing from the URL.');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { token, password });
            toast.success(res.data.message || 'Password reset successfully!');
            router.push('/auth/login');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center py-6">
                <p className="text-red-500 font-bold mb-4">Error: Invalid Reset Link</p>
                <p className="text-gray-400 text-sm mb-6">
                    The password reset link is invalid, incomplete, or has expired. Please request a new link.
                </p>
                <Link href="/auth/forgot-password" className="btn-primary inline-block text-sm">
                    Request Reset Link
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <div className="relative">
                    <input
                        type={showPass ? 'text' : 'password'}
                        className="input-field pl-10 pr-10"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                <div className="relative">
                    <input
                        type={showConfirmPass ? 'text' : 'password'}
                        className="input-field pl-10 pr-10"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Reset Password'}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6">
                        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 35, background: 'linear-gradient(135deg, #4F63FF, #FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Unify</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
                    <p className="text-gray-400">Choose a new password for your account</p>
                </div>

                <div className="glass rounded-3xl p-8">
                    <Suspense fallback={<div className="text-center py-6 text-gray-400">Loading form...</div>}>
                        <ResetPasswordForm />
                    </Suspense>

                    <div className="mt-6 text-center">
                        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft size={16} />
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
