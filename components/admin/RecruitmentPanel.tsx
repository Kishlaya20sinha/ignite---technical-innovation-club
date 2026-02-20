import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';
import {
    Download, RefreshCw, ChevronUp, ChevronDown, Trash2,
    MessageCircle, Save, Power, PowerOff, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';

type SortField = 'name' | 'batch' | 'createdAt' | 'interests';
type SortDir = 'asc' | 'desc';

const interestColor: Record<string, string> = {
    'Ignite Club': 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    'BITP Esports': 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
};

export function RecruitmentPanel() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<string>('All');
    const [selectedInterest, setSelectedInterest] = useState<string>('All');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // Settings
    const [whatsappLink, setWhatsappLink] = useState('');
    const [whatsappSaving, setWhatsappSaving] = useState(false);
    const [whatsappSaved, setWhatsappSaved] = useState(false);
    const [recruitmentOpen, setRecruitmentOpen] = useState<boolean | null>(null);
    const [toggleSaving, setToggleSaving] = useState(false);

    useEffect(() => {
        fetchApplications();
        api.getConfig('whatsappGroupLink').then((v: string | null) => { if (v) setWhatsappLink(v); }).catch(() => { });
        api.getConfig('recruitmentOpen').then((v: boolean | null) => setRecruitmentOpen(v !== false)).catch(() => setRecruitmentOpen(true));
    }, []);

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

    const saveWhatsappLink = async () => {
        setWhatsappSaving(true);
        try {
            await api.setConfig('whatsappGroupLink', whatsappLink);
            setWhatsappSaved(true);
            setTimeout(() => setWhatsappSaved(false), 2500);
        } catch { }
        setWhatsappSaving(false);
    };

    const toggleRecruitment = async () => {
        setToggleSaving(true);
        const newVal = !recruitmentOpen;
        try {
            await api.setConfig('recruitmentOpen', newVal);
            setRecruitmentOpen(newVal);
        } catch { }
        setToggleSaving(false);
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
            WhyJoin: app.whyJoin,
            Date: new Date(app.createdAt).toLocaleDateString()
        }));
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${String((row as any)[h] || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ignite_applications_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-600" />;
        return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />;
    };

    // Filter
    let filtered = applications
        .filter(a => selectedBatch === 'All' || a.batch === selectedBatch)
        .filter(a => selectedInterest === 'All' || (Array.isArray(a.interests) ? a.interests.includes(selectedInterest) : a.interests === selectedInterest));

    // Sort
    filtered = [...filtered].sort((a, b) => {
        let av: any = a[sortField];
        let bv: any = b[sortField];
        if (sortField === 'interests') { av = Array.isArray(av) ? av.join(', ') : av; bv = Array.isArray(bv) ? bv.join(', ') : bv; }
        if (sortField === 'createdAt') { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const batches = ['All', ...Array.from(new Set(applications.map(a => a.batch))).filter(Boolean).sort() as string[]];
    const stats = {
        total: applications.length,
        ignite: applications.filter(a => a.interests?.includes('Ignite Club')).length,
        esports: applications.filter(a => a.interests?.includes('BITP Esports')).length,
        both: applications.filter(a => a.interests?.includes('Ignite Club') && a.interests?.includes('BITP Esports')).length,
    };

    return (
        <div>
            {/* Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Recruitment Toggle */}
                <div className={`border rounded-xl p-5 ${recruitmentOpen ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {recruitmentOpen ? <Power className="w-4 h-4 text-green-400" /> : <PowerOff className="w-4 h-4 text-red-400" />}
                                <h3 className="font-semibold text-sm text-white">Recruitment Status</h3>
                            </div>
                            <p className="text-xs text-gray-400">
                                {recruitmentOpen === null ? 'Loading...' : recruitmentOpen ? '🟢 Form is currently OPEN — applicants can submit.' : '🔴 Form is CLOSED — submissions are blocked.'}
                            </p>
                        </div>
                        <button
                            onClick={toggleRecruitment}
                            disabled={toggleSaving || recruitmentOpen === null}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${recruitmentOpen ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'}`}
                        >
                            {toggleSaving ? 'Saving...' : recruitmentOpen ? 'Close Recruitment' : 'Open Recruitment'}
                        </button>
                    </div>
                </div>

                {/* WhatsApp Link */}
                <div className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        <h3 className="font-semibold text-sm text-white">WhatsApp Group Link</h3>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={whatsappLink}
                            onChange={e => setWhatsappLink(e.target.value)}
                            placeholder="https://chat.whatsapp.com/..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#25D366]/50"
                        />
                        <button
                            onClick={saveWhatsappLink}
                            disabled={whatsappSaving || !whatsappLink}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${whatsappSaved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/30'} disabled:opacity-50`}
                        >
                            <Save className="w-3.5 h-3.5" />
                            {whatsappSaved ? 'Saved!' : whatsappSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'Total', value: stats.total, color: 'text-white' },
                    { label: 'Ignite Club', value: stats.ignite, color: 'text-orange-400' },
                    { label: 'BITP Esports', value: stats.esports, color: 'text-blue-400' },
                    { label: 'Both', value: stats.both, color: 'text-purple-400' },
                ].map(s => (
                    <div key={s.label} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <div className="text-gray-400 text-xs mb-1">{s.label}</div>
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                <h2 className="text-lg font-bold">Applications ({filtered.length})</h2>
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Batch filter */}
                    <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
                        {batches.map(b => <option key={b} value={b} className="bg-black">{b === 'All' ? 'All Batches' : `Batch ${b}`}</option>)}
                    </select>
                    {/* Interest filter */}
                    <select value={selectedInterest} onChange={e => setSelectedInterest(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
                        {['All', 'Ignite Club', 'BITP Esports'].map(i => <option key={i} value={i} className="bg-black">{i === 'All' ? 'All Clubs' : i}</option>)}
                    </select>
                    <button onClick={downloadCSV} className="text-sm px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 flex items-center gap-1">
                        <Download className="w-3 h-3" /> Export CSV
                    </button>
                    <button onClick={fetchApplications} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 px-3 py-1.5 border border-white/10 rounded-lg">
                        <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                </div>
            </div>

            {/* Sort header */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-500 px-4 mb-2">
                <button onClick={() => handleSort('name')} className="col-span-3 flex items-center gap-1 hover:text-gray-300 text-left">Name <SortIcon field="name" /></button>
                <span className="col-span-2">Roll No</span>
                <button onClick={() => handleSort('interests')} className="col-span-2 flex items-center gap-1 hover:text-gray-300">Club <SortIcon field="interests" /></button>
                <button onClick={() => handleSort('batch')} className="col-span-1 flex items-center gap-1 hover:text-gray-300">Batch <SortIcon field="batch" /></button>
                <span className="col-span-2">Branch</span>
                <button onClick={() => handleSort('createdAt')} className="col-span-2 flex items-center gap-1 hover:text-gray-300">Date <SortIcon field="createdAt" /></button>
            </div>

            {loading ? <p className="text-gray-500 p-4">Loading...</p> : (
                <div className="space-y-2">
                    {filtered.map(app => (
                        <div key={app._id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                            {/* Row summary */}
                            <div
                                className="grid grid-cols-12 gap-2 items-center p-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
                                onClick={() => setExpandedId(expandedId === app._id ? null : app._id)}
                            >
                                <div className="col-span-3 font-medium text-sm truncate">{app.name}</div>
                                <div className="col-span-2 text-xs text-gray-400 truncate">{app.rollNo}</div>
                                <div className="col-span-2 flex flex-wrap gap-1">
                                    {(Array.isArray(app.interests) ? app.interests : [app.interests]).filter(Boolean).map((i: string) => (
                                        <span key={i} className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${interestColor[i] || 'bg-white/10 text-gray-400'}`}>
                                            {i === 'Ignite Club' ? 'Ignite' : 'Esports'}
                                        </span>
                                    ))}
                                </div>
                                <div className="col-span-1 text-xs text-gray-400">{app.batch}</div>
                                <div className="col-span-2 text-xs text-gray-400 truncate">{app.branch}</div>
                                <div className="col-span-2 flex items-center justify-between gap-2">
                                    <span className="text-xs text-gray-500 hidden md:block">{new Date(app.createdAt).toLocaleDateString()}</span>
                                    {expandedId === app._id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                </div>
                            </div>

                            {/* Expanded full details */}
                            {expandedId === app._id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-white/5 px-5 py-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-5">
                                        <Field label="Full Name" value={app.name} />
                                        <Field label="Email" value={app.email} />
                                        <Field label="Phone" value={app.phone} />
                                        <Field label="Roll Number" value={app.rollNo} />
                                        <Field label="Branch" value={app.branch} />
                                        <Field label="Batch" value={app.batch} />
                                        <div>
                                            <div className="text-gray-500 text-xs mb-1">Interested In</div>
                                            <div className="flex flex-wrap gap-1">
                                                {(Array.isArray(app.interests) ? app.interests : [app.interests]).filter(Boolean).map((i: string) => (
                                                    <span key={i} className={`text-xs px-2 py-1 rounded-md font-medium ${interestColor[i] || 'bg-white/10 text-gray-400'}`}>{i}</span>
                                                ))}
                                            </div>
                                        </div>
                                        {app.esportsGame && <Field label="Esports Game" value={app.esportsGame} />}
                                        <Field label="Applied On" value={new Date(app.createdAt).toLocaleString()} />
                                    </div>

                                    <div className="mb-5">
                                        <div className="text-gray-500 text-xs mb-1">Why Join IGNITE</div>
                                        <p className="text-gray-200 text-sm bg-white/5 rounded-lg p-3 leading-relaxed">{app.whyJoin}</p>
                                    </div>

                                    {/* Delete */}
                                    <div className="flex justify-end">
                                        <button onClick={() => deleteApp(app._id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-400/10 flex items-center gap-1">
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="text-gray-500 italic p-4 text-center">No applications match the selected filters.</p>}
                </div>
            )}
        </div>
    );
}

// Small helper component
const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
        <div className="text-gray-500 text-xs mb-0.5">{label}</div>
        <div className="text-gray-200 text-sm">{value || '—'}</div>
    </div>
);
