import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, Trash2, Sparkles, Clock, AlertTriangle, Edit } from 'lucide-react';

export function ExamPanel() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [activeExams, setActiveExams] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [view, setView] = useState<'questions' | 'submissions' | 'live' | 'allowlist' | 'settings'>('questions');
    const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0 as any, type: 'mcq', difficulty: 'medium' });
    const [allowlistForm, setAllowlistForm] = useState({ name: '', email: '', rollNo: '' });
    const [allowlist, setAllowlist] = useState<any[]>([]);
    const [config, setConfig] = useState({ startTime: '', endTime: '' });
    const [generating, setGenerating] = useState(false);

    const [editId, setEditId] = useState<string | null>(null);

    const load = async () => {
        try {
            setQuestions(await api.getAllQuestions());
            setSubmissions(await api.getSubmissions());
            try { setAllowlist(await api.getAllowlist()); } catch { }
            try {
                const cfg = await api.getExamConfig();
                // Format for datetime-local input (YYYY-MM-DDThh:mm)
                const fmt = (d: any) => d ? new Date(d).toISOString().slice(0, 16) : '';
                setConfig({ startTime: fmt(cfg.startTime), endTime: fmt(cfg.endTime) });
            } catch { }
            // catch errors for active exams in case route isn't ready
            try { setActiveExams(await api.getActiveExams()); } catch { }
        } catch { }
    };
    useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.updateQuestion(editId, form);
            } else {
                await api.addQuestion(form);
            }
            setShowForm(false);
            setForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, type: 'mcq', difficulty: 'medium' });
            setEditId(null);
            load();
        } catch (err: any) { alert(err.message); }
    };

    const handleEdit = (q: any) => {
        setForm({
            question: q.question,
            options: q.options || ['', '', '', ''],
            correctAnswer: q.correctAnswer,
            type: (q.type || 'mcq').toLowerCase(), // Normalize
            difficulty: q.difficulty || 'medium'
        });
        setEditId(q._id);
        setShowForm(true);
    };

    const handleGenerate = async () => {
        const topic = prompt("Enter topic for AI generation (e.g., 'React Hooks', 'Data Structures'):", "General Technical Aptitude");
        if (!topic) return;

        const countStr = prompt("How many questions to generate?", "5");
        const count = parseInt(countStr || "5", 10);

        setGenerating(true);
        try {
            await api.generateQuestions(topic, count);
            alert(`Generated ${count} questions and added to bank!`);
            load();
        } catch (err: any) { alert(err.message); }
        setGenerating(false);
    };

    const deleteQ = async (id: string) => {
        if (!confirm('Delete?')) return;
        try { await api.deleteQuestion(id); load(); } catch { }
    };

    const giveViolation = async (submissionId: string) => {
        const reason = prompt("Enter reason for violation (e.g., 'Switching tabs', 'Talking'):", "Admin Manual Violation");
        if (!reason) return;
        try {
            await api.logViolation({ submissionId, type: reason });
            alert("Violation logged.");
            load();
        } catch (err: any) { alert(err.message); }
    };

    const sendWarning = async (submissionId: string) => {
        const message = prompt("Enter warning message:");
        if (!message) return;
        try {
            await api.sendExamWarning(submissionId, message);
            alert("Warning sent!");
            load();
        } catch (err: any) { alert(err.message); }
    };

    const handleAddAllowlist = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addToAllowlist(allowlistForm);
            setAllowlistForm({ name: '', email: '', rollNo: '' });
            load();
        } catch (err: any) { alert(err.message); }
    };

    const handleConfigSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.updateExamConfig(config);
            alert("Settings updated!");
            load();
        } catch (err: any) { alert(err.message); }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm";

    return (
        <div>
            <div className="flex gap-2 mb-6 flex-wrap">
                <button onClick={() => setView('questions')} className={`px-4 py-2 text-sm rounded-lg ${view === 'questions' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}>
                    Questions ({questions.length})
                </button>
                <button onClick={() => setView('submissions')} className={`px-4 py-2 text-sm rounded-lg ${view === 'submissions' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}>
                    Submissions ({submissions.length})
                </button>
                <button onClick={() => setView('live')} className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 ${view === 'live' ? 'bg-green-600 text-white' : 'bg-white/5 text-green-400'}`}>
                    <div className={`w-2 h-2 rounded-full bg-current ${view === 'live' ? 'animate-none' : 'animate-pulse'}`} />
                    Live ({activeExams.length})
                </button>
                <button onClick={() => setView('allowlist')} className={`px-4 py-2 text-sm rounded-lg ${view === 'allowlist' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}>
                    Allowlist ({allowlist.length})
                </button>
                <button onClick={() => setView('settings')} className={`px-4 py-2 text-sm rounded-lg ${view === 'settings' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}>
                    Settings
                </button>

                {view === 'questions' && (
                    <div className="ml-auto flex gap-2">
                        <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50">
                            <Sparkles className="w-4 h-4" /> {generating ? 'Generating...' : 'AI Generate'}
                        </button>
                        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, type: 'mcq', difficulty: 'medium' }); }} className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark">
                            <Plus className="w-4 h-4" /> Add Manual
                        </button>
                    </div>
                )}
            </div>

            {showForm && view === 'questions' && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">{editId ? 'Edit Question' : 'New Question'}</h3>
                        <div className="flex gap-2">
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={`${inputClass} w-auto bg-gray-900 text-white`}>
                                <option value="mcq" className="bg-gray-900 text-white">Multiple Choice</option>
                                <option value="input" className="bg-gray-900 text-white">Text Input</option>
                            </select>
                        </div>
                    </div>

                    <textarea value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="Question *" required rows={2} className={inputClass} />

                    {form.type === 'mcq' && form.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input type="radio" name="correct" checked={Number(form.correctAnswer) === i} onChange={() => setForm({ ...form, correctAnswer: i })} className="accent-primary" />
                            <input value={opt} onChange={e => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }); }}
                                placeholder={`Option ${String.fromCharCode(65 + i)} *`} required className={inputClass} />
                        </div>
                    ))}

                    {form.type === 'input' && (
                        <input value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })}
                            placeholder="Expected Answer / Keyword *" required className={inputClass} />
                    )}

                    <div className="flex gap-2 items-center justify-between mt-2">
                        <p className="text-xs text-gray-500 italic flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            Groq AI generates unique questions automatically at exam start.
                        </p>
                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg">{editId ? 'Update' : 'Add to Bank'}</button>
                            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 border border-white/10 text-sm rounded-lg text-gray-400">Cancel</button>
                        </div>
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
                                    {(q.type || 'mcq').toLowerCase() === 'mcq' && q.options && q.options.length > 0 ? (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {q.options.map((opt: string, j: number) => (
                                                <span key={j} className={`text-xs px-2 py-1 rounded-lg ${j === Number(q.correctAnswer) ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-500'}`}>
                                                    {String.fromCharCode(65 + j)}. {opt}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-lg">
                                                Answer: {q.correctAnswer}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(q)} className="text-blue-400 hover:text-blue-300 p-1 bg-blue-400/10 rounded"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => deleteQ(q._id)} className="text-red-400 hover:text-red-300 p-1 bg-red-400/10 rounded"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'live' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Live Monitoring ({activeExams.length} active)</span>
                        </div>
                        <button
                            onClick={async () => {
                                const mins = prompt("Minutes to add to ALL active students:");
                                if (mins && !isNaN(Number(mins))) {
                                    try {
                                        await api.addExamTimeAll(Number(mins));
                                        alert(`Added ${mins} minutes to all active sessions.`);
                                        load();
                                    } catch (e: any) { alert(e.message); }
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-sm hover:bg-purple-500/20 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Time to All Active
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeExams.map((s, i) => (
                            <div key={i} className="bg-white/[0.02] border border-green-500/30 rounded-xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-20">
                                    <Clock className="w-12 h-12 text-green-500 animate-pulse" />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{s.name}</h3>
                                <p className="text-gray-400 text-xs mb-3">{s.email}</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-white/5 px-2 py-1 rounded">Roll: {s.rollNo}</span>
                                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">Violations: {s.violations}</span>
                                </div>
                                <p className="mt-3 text-xs text-gray-500">Started: {new Date(s.startedAt).toLocaleTimeString()}</p>

                                {/* Violation actions */}
                                <div className="mt-4 border-t border-white/5 pt-3 flex gap-2 justify-end">
                                    <button onClick={() => sendWarning(s._id)} className="text-xs flex items-center gap-1 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded hover:bg-blue-500/20 transition-colors">
                                        <AlertTriangle className="w-3 h-3" /> Warning
                                    </button>
                                    <button onClick={async () => {
                                        const mins = prompt("Minutes to add:");
                                        if (mins && !isNaN(Number(mins))) {
                                            try {
                                                await api.addExamTime({ submissionId: s._id, minutes: Number(mins) });
                                                alert(`Added ${mins} minutes to ${s.name}`);
                                            } catch (e: any) { alert(e.message); }
                                        }
                                    }} className="text-xs flex items-center gap-1 bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded hover:bg-purple-500/20 transition-colors">
                                        <Clock className="w-3 h-3" /> Grant Time
                                    </button>
                                    <button onClick={() => giveViolation(s._id)} className="text-xs flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded hover:bg-yellow-500/20 transition-colors">
                                        <AlertTriangle className="w-3 h-3" /> Report
                                    </button>
                                </div>
                            </div>
                        ))}
                        {activeExams.length === 0 && <p className="text-gray-500 italic col-span-full text-center py-10">No active exams right now.</p>}
                    </div>
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

            {view === 'allowlist' && (
                <div className="space-y-6">
                    <form onSubmit={handleAddAllowlist} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex gap-3 flex-wrap items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                            <input value={allowlistForm.name} onChange={e => setAllowlistForm({ ...allowlistForm, name: e.target.value })} placeholder="John Doe" required className={inputClass} />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
                            <input value={allowlistForm.email} onChange={e => setAllowlistForm({ ...allowlistForm, email: e.target.value })} type="email" placeholder="john@example.com" required className={inputClass} />
                        </div>
                        <div className="w-40">
                            <label className="text-xs text-gray-500 mb-1 block">Roll Number</label>
                            <input value={allowlistForm.rollNo} onChange={e => setAllowlistForm({ ...allowlistForm, rollNo: e.target.value })} placeholder="BTECH/..." required className={inputClass} />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-bold">Add User</button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="text-gray-500 text-left text-xs border-b border-white/5">
                                <th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Roll No</th>
                            </tr></thead>
                            <tbody>
                                {allowlist.map((u: any, i: number) => (
                                    <tr key={i} className="border-t border-white/5 text-gray-300">
                                        <td className="py-3">{u.name}</td>
                                        <td className="py-3">{u.email}</td>
                                        <td className="py-3 text-gray-500 uppercase">{u.rollNo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'settings' && (
                <div className="max-w-xl">
                    <form onSubmit={handleConfigSubmit} className="space-y-6 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Exam Window Settings
                        </h3>
                        <p className="text-sm text-gray-500">Set the time window when the exam is accessible to students.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={config.startTime}
                                    onChange={e => setConfig({ ...config, startTime: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">End Time</label>
                                <input
                                    type="datetime-local"
                                    value={config.endTime}
                                    onChange={e => setConfig({ ...config, endTime: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all">
                                Save Configuration
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
