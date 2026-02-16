import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, Trash2, Sparkles, Clock, AlertTriangle } from 'lucide-react';

export function ExamPanel() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [activeExams, setActiveExams] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [view, setView] = useState<'questions' | 'submissions' | 'live'>('questions');
    const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0 as any, type: 'mcq', difficulty: 'medium' });
    const [generating, setGenerating] = useState(false);

    const load = async () => {
        try {
            setQuestions(await api.getAllQuestions());
            setSubmissions(await api.getSubmissions());
            // catch errors for active exams in case route isn't ready
            try { setActiveExams(await api.getActiveExams()); } catch { }
        } catch { }
    };
    useEffect(() => { load(); const i = setInterval(load, 5000); return () => clearInterval(i); }, []);

    const addQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.addQuestion(form);
            setShowForm(false);
            setForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, type: 'mcq', difficulty: 'medium' });
            load();
        } catch { }
    };

    const handleGenerate = async () => {
        const topic = prompt("Enter topic for AI generation (e.g., 'React Hooks', 'Data Structures'):", "General Technical Aptitude");
        if (!topic) return;
        setGenerating(true);
        try {
            await api.generateQuestions(topic);
            alert('Questions generated and added to bank!');
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

                {view === 'questions' && (
                    <div className="ml-auto flex gap-2">
                        <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50">
                            <Sparkles className="w-4 h-4" /> {generating ? 'Generating...' : 'AI Generate'}
                        </button>
                        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark">
                            <Plus className="w-4 h-4" /> Add Manual
                        </button>
                    </div>
                )}
            </div>

            {showForm && view === 'questions' && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={addQuestion}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">New Question</h3>
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
                            <input type="radio" name="correct" checked={form.correctAnswer === i} onChange={() => setForm({ ...form, correctAnswer: i })} className="accent-primary" />
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
                            <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg">Add to Bank</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-white/10 text-sm rounded-lg text-gray-400">Cancel</button>
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

            {view === 'live' && (
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
                            <div className="mt-4 border-t border-white/5 pt-3 flex justify-end">
                                <button onClick={() => giveViolation(s._id)} className="text-xs flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded hover:bg-yellow-500/20 transition-colors">
                                    <AlertTriangle className="w-3 h-3" /> Report Violation
                                </button>
                            </div>
                        </div>
                    ))}
                    {activeExams.length === 0 && <p className="text-gray-500 italic col-span-full text-center py-10">No active exams right now.</p>}
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
}
