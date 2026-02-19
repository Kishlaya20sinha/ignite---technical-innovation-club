import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { User, ClipboardList, BookOpen, UserCheck, LogOut, ShieldCheck, GraduationCap, Calendar, Mail, Phone, Book } from 'lucide-react';

const Profile: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('ignite_user');
        if (!storedUser) {
            navigate('/register');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchProfile(parsedUser.email);
    }, []);

    const fetchProfile = async (email: string) => {
        setLoading(true);
        try {
            const res = await api.getProfile(email);
            setData(res);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('ignite_admin_token');
        localStorage.removeItem('ignite_user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Syncing Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 min-h-screen bg-[#0a0a0a] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Header Card */}
                <div className="max-w-5xl mx-auto mb-12">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl group-hover:bg-primary/40 transition-all" />
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#121212] border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden">
                                    <User className="w-12 h-12 md:w-16 md:h-16 text-primary" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">{user?.name}</h1>
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                                        <span className="text-[10px] text-green-500 font-black uppercase tracking-widest italic">Verified Account</span>
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-500">
                                    <div className="flex items-center justify-center md:justify-start gap-3 group">
                                        <Mail className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                                        <span className="group-hover:text-white transition-colors">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 group">
                                        <Phone className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                                        <span className="group-hover:text-white transition-colors">{data?.user?.phone || 'Not set'}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 group">
                                        <GraduationCap className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                                        <span className="group-hover:text-white transition-colors truncate">{data?.user?.college || 'Not set'}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 group">
                                        <Book className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                                        <span className="group-hover:text-white transition-colors">{data?.user?.branch} • {data?.user?.batch}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-gray-400 hover:text-red-500 rounded-2xl transition-all flex items-center gap-3 font-bold text-xs uppercase tracking-widest"
                            >
                                <LogOut className="w-4 h-4" /> Log Out
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto">
                    <AnimatePresence mode="wait">
                        {data && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                            >
                                {/* Recruitment Info */}
                                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
                                    <div className="p-3 bg-purple-500/10 rounded-2xl w-fit mb-6">
                                        <UserCheck className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">Recruitment</h3>
                                    {data.recruitment ? (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.recruitment.status === 'accepted' ? 'bg-green-500/10 text-green-400' :
                                                    data.recruitment.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-yellow-500/10 text-yellow-400'
                                                    }`}>
                                                    {data.recruitment.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Applied For</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {data.recruitment.interests?.map((i: string) => (
                                                        <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5 text-gray-400">
                                                            {i}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No application found.</p>
                                    )}
                                </div>

                                {/* Registered Events */}
                                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl w-fit mb-6">
                                        <ClipboardList className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">Events</h3>
                                    {data.events?.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.events.map((reg: any) => (
                                                <div key={reg._id} className="border-b border-white/5 pb-3 last:border-0 hover:bg-white/[0.01] transition-colors rounded-lg p-2 -mx-2">
                                                    <p className="font-bold text-sm text-gray-200">{reg.eventId?.name}</p>
                                                    <p className="text-[10px] text-gray-500">{new Date(reg.eventId?.date).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No event registrations.</p>
                                    )}
                                </div>

                                {/* Exam Results */}
                                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md">
                                    <div className="p-3 bg-green-500/10 rounded-2xl w-fit mb-6">
                                        <BookOpen className="w-6 h-6 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">Exam Results</h3>
                                    {data.exams?.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.exams.map((exam: any) => (
                                                <div key={exam._id} className="border-b border-white/5 pb-3 last:border-0 hover:bg-white/[0.01] transition-colors rounded-lg p-2 -mx-2">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded ${exam.status === 'submitted' || exam.status === 'auto-submitted' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                                            }`}>
                                                            {exam.status}
                                                        </span>
                                                        <span className="font-bold text-primary">{exam.score}/{exam.totalQuestions}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 italic">Attempted: {new Date(exam.startedAt).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No exam attempts found.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Profile;
