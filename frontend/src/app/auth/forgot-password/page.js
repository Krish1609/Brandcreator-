'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success(res.data.message || 'Reset link sent successfully!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6">
                        <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 35, background: 'linear-gradient(135deg, #4F63FF, #FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Unify</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
                    <p className="text-gray-400">Recover your account password</p>
                </div>

                <div className="glass rounded-3xl p-8">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Mail size={16} />
                                    </span>
                                    <input
                                        type="email"
                                        className="input-field pl-10"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto mb-2 text-2xl font-bold text-center">
                                ✉️
                            </div>
                            <h2 className="text-xl font-semibold">Check your inbox</h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                If that email is registered, we have sent a password reset link to <strong className="text-white">{email}</strong>.
                            </p>
                        </div>
                    )}

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
