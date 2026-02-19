import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, GraduationCap, BookOpen, Calendar, ArrowRight, ShieldCheck, Timer, CheckCircle2, ClipboardList } from 'lucide-react';
import { api } from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [step, setStep] = useState(1); // 1: Basics, 2: OTP, 3: Profile, 4: Success
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        college: '',
        branch: '',
        batch: ''
    });
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.verifyOTP({ email: formData.email, otp });
            localStorage.setItem('ignite_admin_token', res.token);
            localStorage.setItem('ignite_user', JSON.stringify(res.user));
            setStep(3); // Now move to Profile Completion
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.completeProfile({
                phone: formData.phone,
                college: formData.college,
                branch: formData.branch,
                batch: formData.batch
            });
            localStorage.setItem('ignite_user', JSON.stringify(res.user));
            setStep(4); // Success
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 py-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-white/[0.02] border border-white/10 p-8 rounded-3xl backdrop-blur-xl relative z-10"
            >
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                    <User className="w-8 h-8 text-primary" />
                                </div>
                                <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Join Ignite</h1>
                                <p className="text-gray-500 text-sm">Create an account to simplify your event registrations</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs mb-6 text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email" required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password" required
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all mt-8 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-primary/20"
                                >
                                    {loading ? 'Processing...' : (
                                        <>
                                            Continue <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-gray-500 text-xs mt-6">
                                    Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
                                </p>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="py-10 text-center"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                                <ShieldCheck className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Verify Your Email</h2>
                            <p className="text-gray-500 text-sm mb-8">We've sent a 6-digit code to <span className="text-white font-bold">{formData.email}</span></p>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-[10px] mb-6 inline-block uppercase font-black tracking-widest text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleVerify} className="max-w-xs mx-auto text-left">
                                <div className="relative group mb-8">
                                    <Timer className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        type="text" required maxLength={6}
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-5 text-center text-3xl font-black text-white outline-none focus:border-primary/50 tracking-[0.5em] pl-6"
                                        placeholder="000000"
                                    />
                                </div>

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
                                >
                                    {loading ? 'Verifying...' : 'Verify Email'}
                                </button>

                                <p className="text-gray-500 text-[10px] mt-6 uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                                    Didn't receive code? <button type="button" onClick={handleRegister} className="text-primary hover:underline">Resend</button>
                                </p>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                    <ClipboardList className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Complete Your Profile</h2>
                                <p className="text-gray-500 text-sm">Tell us a bit more about yourself to get started</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs mb-6 text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCompleteProfile} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Phone Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="tel" required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">College Name</label>
                                    <div className="relative group">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text" required
                                            value={formData.college}
                                            onChange={e => setFormData({ ...formData, college: e.target.value })}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                            placeholder="BIT Mesra"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Branch</label>
                                        <div className="relative group">
                                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text" required
                                                value={formData.branch}
                                                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                                placeholder="Computer Science"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Batch (Year)</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text" required
                                                value={formData.batch}
                                                onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                                                placeholder="2022-26"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-primary-dark transition-all mt-8 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-primary/20"
                                >
                                    {loading ? 'Saving...' : (
                                        <>
                                            Save & Start <CheckCircle2 className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-20 text-center"
                        >
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                                >
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </motion.div>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">All Set!</h2>
                            <p className="text-gray-500 text-sm">Welcome to the IGNITE community, {formData.name.split(' ')[0]}.</p>
                            <p className="text-primary text-[10px] mt-8 uppercase font-black tracking-widest animate-pulse">Redirecting to your profile...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
