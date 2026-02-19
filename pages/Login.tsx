import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.login(formData);
            localStorage.setItem('ignite_admin_token', res.token);

            if (res.role === 'admin') {
                navigate('/admin');
            } else {
                localStorage.setItem('ignite_user', JSON.stringify(res.user));
                navigate('/profile');
            }
        } catch (err: any) {
            if (err.message === 'Please verify your email first') {
                setError('Please verify your email first');
                // Optionally redirect to a resend OTP page
            } else {
                setError('Invalid email or password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white/[0.02] border border-white/10 p-10 rounded-3xl backdrop-blur-xl relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 text-sm italic">"Keep the IGNITE burning within you"</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs mb-6 flex items-center gap-3">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Email / Username</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text" required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                placeholder="admin or email@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Password</label>
                            <Link to="/forgot-password" size="sm" className="text-[10px] text-primary/50 hover:text-primary font-bold uppercase tracking-widest">Forgot?</Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password" required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all mt-8 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-primary/20"
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                Sign In Now <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-gray-500 text-xs mt-8">
                        Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register for Ignite</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
