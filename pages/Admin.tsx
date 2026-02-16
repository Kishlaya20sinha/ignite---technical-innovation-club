import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock, LogOut, Users, Calendar, FileText, Brain, Plus, Trash2,
    CheckCircle, XCircle, Clock, Eye, ChevronDown, ChevronUp, X,
    Download, RefreshCw
} from 'lucide-react';
import { api } from '../lib/api';

type Tab = 'recruitment' | 'events' | 'exam' | 'team' | 'live';

const Admin: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('recruitment');
    const [liveUsers, setLiveUsers] = useState<any[]>([]);

    // Monitor polling
    useEffect(() => {
        if (activeTab === 'live') {
            const fetchLive = async () => {
                try {
                    const res = await api.get('/exam/active');
                    setLiveUsers(res.data);
                } catch (err) { console.error(err); }
            };
            fetchLive();
            const interval = setInterval(fetchLive, 5000);
            return () => clearInterval(interval);
        }
    }, [activeTab]);

    const sendWarning = async (id: string) => {
        const msg = prompt("Enter warning message:");
        if (!msg) return;
        try {
            await api.post('/exam/warning', { submissionId: id, message: msg });
            alert("Warning sent!");
        } catch (err) { alert("Failed to send"); }
    };

    const [loading, setLoading] = useState(false);

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
            const { token } = await api.login(password);
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
                                ? (tab.id === 'live' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-primary text-white')
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}>
                            {tab.id === 'live' && <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>}
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        {activeTab === 'recruitment' && <RecruitmentPanel />}
                        {activeTab === 'events' && <EventsPanel />}
                        {activeTab === 'live' && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-6 border-b border-white/10">
                                    <h2 className="text-xl font-bold">Live Exam Monitor</h2>
                                    <p className="text-sm text-gray-400">Auto-refreshes every 5 seconds</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Student</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Started At</th>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Violations</th>
                                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {liveUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-white/[0.02]">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-white">{user.name}</div>
                                                        <div className="text-sm text-gray-400">{user.rollNo}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300">
                                                        {new Date(user.startedAt).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${user.violations > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                            {user.violations} Detected
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => sendWarning(user._id)}
                                                            className="text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded hover:bg-yellow-500/20 transition-colors"
                                                        >
                                                            ⚠️ Warn
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {liveUsers.length === 0 && (
                                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No active students</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'exam' && (
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold mb-4">Exam Access Allowlist</h2>
                                    <div className="flex gap-4 items-end mb-6">
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-400">Name</label>
                                            <input id="allowName" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-400">Email</label>
                                            <input id="allowEmail" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-400">Roll No</label>
                                            <input id="allowRoll" className="w-full bg-white/5 border border-white/10 rounded p-2 text-white" />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const name = (document.getElementById('allowName') as HTMLInputElement).value;
                                                const email = (document.getElementById('allowEmail') as HTMLInputElement).value;
                                                const rollNo = (document.getElementById('allowRoll') as HTMLInputElement).value;
                                                if (name && email && rollNo) {
                                                    try {
                                                        await api.request('/api/exam/allowlist', { method: 'POST', body: JSON.stringify({ name, email, rollNo }) });
                                                        alert('User added to allowlist');
                                                        (document.getElementById('allowName') as HTMLInputElement).value = '';
                                                        (document.getElementById('allowEmail') as HTMLInputElement).value = '';
                                                        (document.getElementById('allowRoll') as HTMLInputElement).value = '';
                                                    } catch (e: any) { alert(e.message); }
                                                }
                                            }}
                                            className="bg-primary px-4 py-2 rounded text-white font-bold"
                                        >Add User</button>
                                    </div>
                                </div>
                                <ExamPanel />
                            </div>
                        )}
                        {activeTab === 'team' && <TeamPanel />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// ==================== RECRUITMENT PANEL ====================
function RecruitmentPanel() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try { setApplications(await api.getApplications()); } catch { }
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const deleteApp = async (id: string) => {
        if (!confirm('Delete this application?')) return;
        try {
            await api.deleteApplication(id);
            setApplications(apps => apps.filter(a => a._id !== id));
        } catch { }
    };

    const downloadCSV = () => {
        if (!applications.length) return;

        // Flatten data for CSV
        const data = applications.map(app => ({
            Name: app.name,
            Email: app.email,
            Phone: app.phone,
            RollNo: app.rollNo,
            Branch: app.branch,
            Batch: app.batch,
            Interests: Array.isArray(app.interests) ? app.interests.join(', ') : app.interests,
            EsportsGame: app.esportsGame || '',
            Status: app.status,
            WhyJoin: app.whyJoin,
            Skills: app.skills,
            Github: app.github,
            Portfolio: app.portfolio,
            Date: new Date(app.createdAt).toLocaleDateString()
        }));

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${String((row as any)[header] || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ignite_applications_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Analytics
    const stats = {
        total: applications.length,
        ignite: applications.filter(a => a.interests?.includes('Ignite Club')).length,
        esports: applications.filter(a => a.interests?.includes('BITP Esports')).length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    };

    return (
        <div>
            {/* Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                    <p className="text-gray-500 text-xs uppercase font-bold">Total Applications</p>
                    <p className="text-2xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                    <p className="text-gray-500 text-xs uppercase font-bold">Ignite Club</p>
                    <p className="text-2xl font-bold mt-1 text-primary">{stats.ignite}</p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                    <p className="text-gray-500 text-xs uppercase font-bold">Esports</p>
                    <p className="text-2xl font-bold mt-1 text-purple-400">{stats.esports}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Applications List</h2>
                <div className="flex gap-2">
                    <button onClick={downloadCSV} className="text-sm px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Export CSV
                    </button>
                    <button onClick={load} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 px-3 py-1.5 border border-white/10 rounded-lg">
                        <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                </div>
            </div>
            {
                loading ? <p className="text-gray-500">Loading...</p> : (
                    <div className="space-y-3">
                        {applications.map(app => (
                            <div key={app._id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === app._id ? null : app._id)}>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{app.name}</span>
                                        <span className="text-xs text-gray-500">{app.rollNo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</span>
                                        {expandedId === app._id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </div>
                                </div>
                                {expandedId === app._id && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-4 pb-4 border-t border-white/5 pt-4">
                                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                            <div><span className="text-gray-500">Email:</span> <span className="text-gray-300">{app.email}</span></div>
                                            <div><span className="text-gray-500">Phone:</span> <span className="text-gray-300">{app.phone}</span></div>
                                            <div><span className="text-gray-500">Branch:</span> <span className="text-gray-300">{app.branch}</span></div>
                                            {app.resume && <div><span className="text-gray-500">Resume:</span> <a href={app.resume} target="_blank" className="text-primary hover:underline">View Link</a></div>}
                                        </div>
                                        <div className="text-sm mb-4"><span className="text-gray-500">Why Join:</span><p className="text-gray-300 mt-1">{app.whyJoin}</p></div>
                                        <div className="flex gap-2 flex-wrap">
                                            <button onClick={() => deleteApp(app._id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-400/10 ml-auto">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
};

// ==================== EVENTS PANEL ====================
function EventsPanel() {
    const [events, setEvents] = useState<any[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showRegs, setShowRegs] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '', description: '', date: '', venue: '', type: 'standalone',
        parentId: '', isTeamEvent: false, maxTeamSize: 1, image: '',
        registrationsOpen: true, status: 'upcoming', isFeatured: false
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [expandedMegaId, setExpandedMegaId] = useState<string | null>(null);

    const load = async () => {
        try {
            const allEvents = await api.getAllEvents();
            setEvents(allEvents);
            setRegistrations(await api.getRegistrations());
        } catch { }
    };
    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('date', form.date);
            formData.append('venue', form.venue);
            formData.append('type', form.type);
            formData.append('isTeamEvent', String(form.isTeamEvent));
            formData.append('maxTeamSize', String(form.maxTeamSize));
            formData.append('registrationsOpen', String(form.registrationsOpen));
            formData.append('status', form.status);
            formData.append('isFeatured', String(form.isFeatured));

            if (form.parentId) formData.append('parentId', form.parentId);

            if (form.type === 'sub' && !form.parentId) { alert('Select parent event'); return; }
            // if (form.type === 'sub') formData.set('type', 'standalone'); // Backend handles this logic or ignore

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const token = localStorage.getItem('ignite_admin_token');
            const url = `${(import.meta as any).env?.VITE_API_URL || 'https://ignite-technical-innovation-club.onrender.com'}/api/events${editId ? `/${editId}` : ''}`;

            await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            setShowForm(false);
            resetForm();
            load();
        } catch (err) { console.error(err); }
    };

    const resetForm = () => {
        setForm({ name: '', description: '', date: '', venue: '', type: 'standalone', parentId: '', isTeamEvent: false, maxTeamSize: 1, image: '', registrationsOpen: true, status: 'upcoming', isFeatured: false });
        setImageFile(null);
        setEditId(null);
    };

    const handleEdit = (e: any) => {
        setForm({
            name: e.name, description: e.description, date: e.date ? e.date.split('T')[0] : '',
            venue: e.venue, type: e.parentId ? 'sub' : e.type,
            parentId: e.parentId || '', isTeamEvent: e.isTeamEvent, maxTeamSize: e.maxTeamSize,
            image: e.image || '', registrationsOpen: e.registrationsOpen, status: e.status,
            isFeatured: e.isFeatured || false
        });
        setEditId(e._id);
        setShowForm(true);
    };

    const deleteEvent = async (id: string) => {
        if (!confirm('Delete event and ALL sub-events/registrations?')) return;
        try { await api.deleteEvent(id); load(); } catch { }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm";

    // Group events
    const rootEvents = events.filter(e => !e.parentId);
    const getSubEvents = (parentId: string) => events.filter(e => e.parentId === parentId);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">{events.length} Events ({rootEvents.length} Root)</h2>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors">
                    <Plus className="w-4 h-4" /> Add Event
                </button>
            </div>

            {showForm && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSubmit}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6 space-y-3">

                    <div className="flex gap-4 mb-2 flex-wrap">
                        {/* Type Radios */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="eventType" checked={form.type === 'standalone'} onChange={() => setForm({ ...form, type: 'standalone', parentId: '' })} className="accent-primary" />
                            <span className="text-sm">Single</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="eventType" checked={form.type === 'mega'} onChange={() => setForm({ ...form, type: 'mega', parentId: '' })} className="accent-primary" />
                            <span className="text-sm">Mega</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="eventType" checked={form.type === 'sub'} onChange={() => setForm({ ...form, type: 'sub', parentId: rootEvents.find(e => e.type === 'mega')?._id || '' })} className="accent-primary" />
                            <span className="text-sm">Sub</span>
                        </label>
                    </div>

                    {form.type === 'sub' && (
                        <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} className={inputClass} required>
                            <option value="">Select Parent Mega Event</option>
                            {rootEvents.filter(e => e.type === 'mega').map(e => (
                                <option key={e._id} value={e._id}>{e.name}</option>
                            ))}
                        </select>
                    )}

                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Event Name *" required className={inputClass} />
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className={inputClass} />

                    <div className="flex gap-2 items-center">
                        <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                        {form.image && !imageFile && <span className="text-xs text-green-400">Current: {form.image.split('/').pop()}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputClass} />
                        <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Venue" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4">
                            <span className="text-sm text-gray-400">Status:</span>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="bg-transparent text-white text-sm outline-none w-full">
                                <option value="upcoming">Upcoming</option>
                                <option value="live">Live</option>
                                <option value="ended">Ended</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 px-4 bg-white/5 rounded-xl text-sm text-gray-400 cursor-pointer">
                            <input type="checkbox" checked={form.registrationsOpen} onChange={e => setForm({ ...form, registrationsOpen: e.target.checked })} className="accent-primary" />
                            Registrations Open
                        </label>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input type="checkbox" checked={form.isTeamEvent} onChange={e => setForm({ ...form, isTeamEvent: e.target.checked })} className="accent-primary" /> Team Event
                        </label>
                        {form.isTeamEvent && (
                            <input type="number" value={form.maxTeamSize} onChange={e => setForm({ ...form, maxTeamSize: parseInt(e.target.value) })} min={2} max={10}
                                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white" placeholder="Max size" />
                        )}

                        {form.type === 'mega' && (
                            <label className="flex items-center gap-2 text-sm text-yellow-400">
                                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-yellow-400" />
                                Featured in Navbar
                            </label>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg">{editId ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 border border-white/10 text-sm rounded-lg text-gray-400">Cancel</button>
                    </div>
                </motion.form>
            )}

            <div className="space-y-3">
                {rootEvents.map(event => {
                    const eventRegs = registrations.filter(r => r.eventId?._id === event._id || r.eventId === event._id);
                    const subEvents = getSubEvents(event._id);

                    return (
                        <div key={event._id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                            {/* Main Event Card */}
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {event.type === 'mega' && <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Mega</span>}
                                            {event.isFeatured && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Featured</span>}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${event.status === 'live' ? 'bg-green-500/20 text-green-400' : event.status === 'ended' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{event.status}</span>
                                            {!event.registrationsOpen && <span className="text-[10px] px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full font-bold">Closed</span>}
                                            <h3 className="font-bold">{event.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                            {event.date && <span>{new Date(event.date).toLocaleDateString()}</span>}
                                            {event.venue && <span>{event.venue}</span>}
                                            {event.isTeamEvent && <span>Team (max {event.maxTeamSize})</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(event)} className="p-1.5 text-gray-400 hover:text-white"><FileText className="w-4 h-4" /></button>
                                        {event.type === 'mega' && (
                                            <button onClick={() => setExpandedMegaId(expandedMegaId === event._id ? null : event._id)}
                                                className="text-xs px-2 py-1 bg-white/5 rounded-lg text-gray-400">
                                                {expandedMegaId === event._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        )}
                                        <button onClick={() => setShowRegs(showRegs === event._id ? null : event._id)}
                                            className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-gray-400 hover:text-white flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {eventRegs.length}
                                        </button>
                                        <button onClick={() => deleteEvent(event._id)} className="text-red-400 hover:text-red-300 p-1.5"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                {showRegs === event._id && eventRegs.length > 0 && (
                                    <div className="mt-4 border-t border-white/5 pt-4">
                                        <table className="w-full text-sm">
                                            <thead><tr className="text-gray-500 text-left text-xs">
                                                <th className="pb-2">Name</th><th className="pb-2">Roll No</th><th className="pb-2">Team</th>
                                            </tr></thead>
                                            <tbody>
                                                {eventRegs.map((r: any) => (
                                                    <tr key={r._id} className="border-t border-white/5 text-gray-300">
                                                        <td className="py-2">{r.name}</td><td className="py-2">{r.rollNo}</td>
                                                        <td className="py-2">{r.teamName || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Sub Events */}
                            {event.type === 'mega' && expandedMegaId === event._id && (
                                <div className="bg-black/20 border-t border-white/5 p-4 space-y-2 pl-8">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Sub Events</h4>
                                    {subEvents.map(sub => {
                                        const subRegs = registrations.filter(r => r.eventId?._id === sub._id || r.eventId === sub._id);
                                        return (
                                            <div key={sub._id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm">{sub.name}</p>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase ${sub.status === 'live' ? 'bg-green-500/20 text-green-400' : 'text-gray-500'}`}>{sub.status}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{new Date(sub.date).toLocaleDateString()} • {sub.venue}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(sub)} className="p-1 text-gray-400 hover:text-white"><FileText className="w-3 h-3" /></button>
                                                    <button onClick={() => setShowRegs(showRegs === sub._id ? null : sub._id)}
                                                        className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400">
                                                        {subRegs.length} Regs
                                                    </button>
                                                    <button onClick={() => deleteEvent(sub._id)} className="text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                                {showRegs === sub._id && subRegs.length > 0 && (
                                                    <div className="hidden"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {subEvents.length === 0 && <p className="text-xs text-gray-500 italic">No sub-events added yet.</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ==================== EXAM PANEL ====================
function ExamPanel() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [view, setView] = useState<'questions' | 'submissions'>('questions');
    const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0, difficulty: 'medium' });

    const load = async () => {
        try {
            setQuestions(await api.getAllQuestions());
            setSubmissions(await api.getSubmissions());
        } catch { }
    };
    useEffect(() => { load(); }, []);

    const addQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addQuestion(form);
            setShowForm(false);
            setForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, difficulty: 'medium' });
            load();
        } catch { }
    };

    const deleteQ = async (id: string) => {
        if (!confirm('Delete?')) return;
        try { await api.deleteQuestion(id); load(); } catch { }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm";

    return (
        <div>
            <div className="flex gap-2 mb-6">
                <button onClick={() => setView('questions')} className={`px-4 py-2 text-sm rounded-lg ${view === 'questions' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}>
                    Questions ({questions.length})
                </button>
                <button onClick={() => setView('submissions')} className={`px-4 py-2 text-sm rounded-lg ${view === 'submissions' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}>
                    Submissions ({submissions.length})
                </button>
                {view === 'questions' && (
                    <button onClick={() => setShowForm(!showForm)} className="ml-auto flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm rounded-lg">
                        <Plus className="w-4 h-4" /> Add Question
                    </button>
                )}
            </div>

            {showForm && view === 'questions' && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={addQuestion}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6 space-y-3">
                    <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="Question *" required rows={2} className={inputClass} />
                    {form.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input type="radio" name="correct" checked={form.correctAnswer === i} onChange={() => setForm({ ...form, correctAnswer: i })} className="accent-primary" />
                            <input value={opt} onChange={e => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }); }}
                                placeholder={`Option ${String.fromCharCode(65 + i)} *`} required className={inputClass} />
                        </div>
                    ))}
                    <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className={inputClass}>
                        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg">Add</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-white/10 text-sm rounded-lg text-gray-400">Cancel</button>
                    </div>
                </motion.form>
            )}

            {view === 'questions' && (
                <div className="space-y-3">
                    {questions.map((q, i) => (
                        <div key={q._id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs text-gray-500 mr-2">Q{i + 1}</span>
                                    <span className="font-medium text-sm">{q.question}</span>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {q.options.map((opt: string, j: number) => (
                                            <span key={j} className={`text-xs px-2 py-1 rounded-lg ${j === q.correctAnswer ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-500'}`}>
                                                {String.fromCharCode(65 + j)}. {opt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => deleteQ(q._id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'submissions' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-gray-500 text-left text-xs border-b border-white/5">
                            <th className="pb-3">Rank</th><th className="pb-3">Name</th><th className="pb-3">Roll No</th><th className="pb-3">Score</th>
                            <th className="pb-3">Status</th><th className="pb-3">Violations</th><th className="pb-3">Time</th>
                        </tr></thead>
                        <tbody>
                            {submissions.map((s, i) => (
                                <tr key={s._id} className="border-t border-white/5 text-gray-300">
                                    <td className="py-3 font-bold text-primary">#{i + 1}</td>
                                    <td className="py-3">{s.name}</td>
                                    <td className="py-3 text-gray-500">{s.rollNo}</td>
                                    <td className="py-3 font-bold">{s.score}/{s.totalQuestions}</td>
                                    <td className="py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'submitted' ? 'bg-green-500/10 text-green-400' : s.status === 'auto-submitted' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="py-3">{s.violations > 0 ? <span className="text-yellow-400">{s.violations}</span> : <span className="text-gray-600">0</span>}</td>
                                    <td className="py-3 text-xs text-gray-500">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

function TeamPanel() {
    const [members, setMembers] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', role: '', image: '', order: 0, isActive: true, socials: { linkedin: '', github: '' } });

    const load = async () => {
        try { setMembers(await api.getAllTeam()); } catch { }
    };
    useEffect(() => { load(); }, []);

    const saveMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.updateTeamMember(editId, form);
            } else {
                await api.addTeamMember(form);
            }
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', role: '', image: '', order: 0, isActive: true, socials: { linkedin: '', github: '' } });
            load();
        } catch { }
    };

    const editMember = (m: any) => {
        setForm({ name: m.name, role: m.role, image: m.image || '', order: m.order || 0, isActive: m.isActive, socials: m.socials || { linkedin: '', github: '' } });
        setEditId(m._id);
        setShowForm(true);
    };

    const deleteMember = async (id: string) => {
        if (!confirm('Delete member?')) return;
        try { await api.deleteTeamMember(id); load(); } catch { }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">{members.length} Members</h2>
                <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', role: '', image: '', order: 0, isActive: true, socials: { linkedin: '', github: '' } }); }}
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm rounded-lg">
                    <Plus className="w-4 h-4" /> Add Member
                </button>
            </div>

            {showForm && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={saveMember}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name *" required className={inputClass} />
                        <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role *" required className={inputClass} />
                    </div>
                    <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="Image URL or /team/filename.jpg" className={inputClass} />
                    <div className="grid grid-cols-2 gap-3">
                        <input value={form.socials.linkedin} onChange={e => setForm({ ...form, socials: { ...form.socials, linkedin: e.target.value } })} placeholder="LinkedIn URL" className={inputClass} />
                        <input value={form.socials.github} onChange={e => setForm({ ...form, socials: { ...form.socials, github: e.target.value } })} placeholder="GitHub URL" className={inputClass} />
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) })} className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" placeholder="Order" />
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-primary" /> Active
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg">{editId ? 'Update' : 'Add'}</button>
                        <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 border border-white/10 text-sm rounded-lg text-gray-400">Cancel</button>
                    </div>
                </motion.form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map(m => (
                    <div key={m._id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                            {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-gray-600 m-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{m.name}</p>
                            <p className="text-xs text-gray-500">{m.role}</p>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => editMember(m)} className="p-1.5 text-gray-500 hover:text-primary"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteMember(m._id)} className="p-1.5 text-gray-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;
