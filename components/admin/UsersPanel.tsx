import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, GraduationCap, Calendar, ShieldCheck, ShieldAlert, User, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

export const UsersPanel: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getAdminUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                <div>
                    <h2 className="text-xl font-bold mb-1">Registered Users</h2>
                    <p className="text-gray-400 text-sm">Manage all users registered on the platform</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#1a1a1a] border border-white/5 rounded-xl py-3 pl-12 pr-6 text-sm text-white outline-none focus:border-primary/50 w-full md:w-80 transition-all font-medium"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Fetching users...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="py-20 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                    <User className="w-12 h-12 text-white/5 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No users found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredUsers.map((user) => (
                        <motion.div
                            layout
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#121212] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${user.isVerified ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500'}`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-white text-lg">{user.name}</h3>
                                            {user.isVerified ? (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                                    <ShieldCheck className="w-3 h-3 text-green-500" />
                                                    <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Verified</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                                    <ShieldAlert className="w-3 h-3 text-yellow-500" />
                                                    <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Pending</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                                                <Mail className="w-3.5 h-3.5" /> {user.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                                                <Phone className="w-3.5 h-3.5" /> {user.phone}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-black uppercase tracking-widest">College</div>
                                        <p className="text-xs text-white flex items-center gap-2">
                                            <GraduationCap className="w-3.5 h-3.5 text-primary/50" /> {user.college}
                                        </p>
                                    </div>
                                    <div className="space-y-1 min-w-[120px]">
                                        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-black uppercase tracking-widest">Branch & Batch</div>
                                        <p className="text-xs text-white flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-primary/50" /> {user.branch} ({user.batch})
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};
