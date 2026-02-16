import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';
import { Download, RefreshCw, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

export function RecruitmentPanel() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<string>('All');
    const [activeBatchesConfig, setActiveBatchesConfig] = useState('');

    useEffect(() => {
        fetchApplications();
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/api/config/RECRUITMENT_BATCHES');
            if (res.data) setActiveBatchesConfig(res.data);
        } catch (e) { console.error("Failed to fetch config", e); }
    };

    const saveBatchConfig = async () => {
        try {
            await api.request('/api/config', {
                method: 'POST',
                body: JSON.stringify({ key: 'RECRUITMENT_BATCHES', value: activeBatchesConfig })
            });
            alert("Active batches updated!");
        } catch (e) { alert("Failed to save config"); }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try { setApplications(await api.getApplications()); } catch { }
        setLoading(false);
    };

    const deleteApp = async (id: string) => {
        if (!confirm('Delete this application?')) return;
        try {
            await api.deleteApplication(id);
            setApplications(apps => apps.filter(a => a._id !== id));
        } catch { }
    };

    const downloadCSV = () => {
        if (!applications.length) return;

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

    // Filter applications by batch
    const filteredApps = selectedBatch === 'All' ? applications : applications.filter(a => a.batch === selectedBatch);

    // Get unique batches
    const batches = ['All', ...Array.from(new Set(applications.map(a => a.batch))).filter(Boolean).sort()];

    const stats = {
        total: applications.length,
        ignite: applications.filter(a => a.interests?.includes('Ignite Club')).length,
        esports: applications.filter(a => a.interests?.includes('BITP Esports')).length,
        shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    };

    return (
        <div>
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Total Applications</div>
                    <div className="text-2xl font-bold">{applications.length}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Ignite Club</div>
                    <div className="text-2xl font-bold">{applications.filter(a => a.interests.includes('Ignite Club')).length}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Esports</div>
                    <div className="text-2xl font-bold">{applications.filter(a => a.interests.includes('BITP Esports')).length}</div>
                </div>

                {/* Batch Settings */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Active Batches (Config)</div>
                    <div className="flex gap-2">
                        <input
                            value={activeBatchesConfig}
                            onChange={(e) => setActiveBatchesConfig(e.target.value)}
                            placeholder="e.g. 2024, 2025"
                            className="w-full bg-black/20 border border-white/10 rounded px-2 text-sm text-white"
                        />
                        <button onClick={saveBatchConfig} className="bg-primary px-3 py-1 rounded text-xs font-bold hover:bg-primary-dark">Save</button>
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-lg font-bold">Applications List ({filteredApps.length})</h2>

                <div className="flex gap-2 items-center">
                    <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                        {batches.map(b => <option key={b} value={b} className="bg-black">{b === 'All' ? 'All Batches' : `Batch ${b}`}</option>)}
                    </select>

                    <button onClick={downloadCSV} className="text-sm px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Export CSV
                    </button>
                    <button onClick={fetchApplications} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 px-3 py-1.5 border border-white/10 rounded-lg">
                        <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                </div>
            </div>
            {
                loading ? <p className="text-gray-500">Loading...</p> : (
                    <div className="space-y-3">
                        {filteredApps.map(app => (
                            <div key={app._id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === app._id ? null : app._id)}>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{app.name}</span>
                                        <span className="text-xs text-gray-500">{app.rollNo}</span>
                                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">{app.batch}</span>
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
                        {filteredApps.length === 0 && <p className="text-gray-500 italic p-4 text-center">No applications found for this batch.</p>}
                    </div>
                )
            }
        </div >
    );
}
