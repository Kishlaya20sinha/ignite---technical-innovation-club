import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, Users, Calendar, FileText, Brain } from 'lucide-react';
import { api } from '../lib/api';
import { RecruitmentPanel } from '../components/admin/RecruitmentPanel';
import { EventsPanel } from '../components/admin/EventsPanel';
import { ExamPanel } from '../components/admin/ExamPanel';
import { TeamPanel } from '../components/admin/TeamPanel';
import { GalleryPanel } from '../components/admin/GalleryPanel';
import { UsersPanel } from '../components/admin/UsersPanel';
import { Image as ImageIcon } from 'lucide-react';

type Tab = 'recruitment' | 'events' | 'exam' | 'team' | 'gallery' | 'users';

const Admin: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('recruitment');

    // Check existing token
    useEffect(() => {
        const token = localStorage.getItem('ignite_admin_token');
        if (token) {
            api.verifyToken().then(() => setIsLoggedIn(true)).catch(() => localStorage.removeItem('ignite_admin_token'));
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { token } = await api.login({ email: 'admin', password });
            localStorage.setItem('ignite_admin_token', token);
            setIsLoggedIn(true);
            setLoginError('');
        } catch {
            setLoginError('Invalid password');
        }
    };

    const logout = () => {
        localStorage.removeItem('ignite_admin_token');
        setIsLoggedIn(false);
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full mx-auto px-6">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin Password" required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all" />
                        {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
                        <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">Login</button>
                    </form>
                </motion.div>
            </div>
        );
    }

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'recruitment', label: 'Recruitment', icon: <FileText className="w-4 h-4" /> },
        { id: 'events', label: 'Events', icon: <Calendar className="w-4 h-4" /> },
        { id: 'exam', label: 'Exam', icon: <Brain className="w-4 h-4" /> },
        { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
        { id: 'gallery', label: 'Gallery', icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen pt-20 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
                    <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-white/[0.02] p-1 rounded-xl border border-white/5 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        {activeTab === 'recruitment' && <RecruitmentPanel />}
                        {activeTab === 'events' && <EventsPanel />}
                        {activeTab === 'exam' && <ExamPanel />}
                        {activeTab === 'team' && <TeamPanel />}
                        {activeTab === 'gallery' && <GalleryPanel />}
                        {activeTab === 'users' && <UsersPanel />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Admin;
