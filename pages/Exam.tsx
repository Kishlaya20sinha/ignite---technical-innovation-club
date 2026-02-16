import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, Shield, Eye } from 'lucide-react';
import { api } from '../lib/api';

interface Question {
    _id: string;
    question: string;
    options: string[];
}

const Exam: React.FC = () => {
    const [phase, setPhase] = useState<'register' | 'exam' | 'result'>('register');
    const [form, setForm] = useState({ name: '', email: '', rollNo: '' });
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentQ, setCurrentQ] = useState(0);
    const [submissionId, setSubmissionId] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState({ score: 0, total: 0 });
    const [violations, setViolations] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const MAX_VIOLATIONS = 3;

    // Auto-submit function
    const autoSubmit = useCallback(async () => {
        if (phase !== 'exam') return;
        try {
            const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId, selectedAnswer,
            }));
            const result = await api.submitExam({ submissionId, answers: answerArray, autoSubmit: true });
            setScore(result);
            setPhase('result');
        } catch { }
    }, [answers, submissionId, phase]);

    // Timer
    useEffect(() => {
        if (phase !== 'exam' || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    autoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [phase, timeLeft, autoSubmit]);

    // Anti-cheating: visibility change
    useEffect(() => {
        if (phase !== 'exam') return;
        const handleVisibility = () => {
            if (document.hidden) {
                const newCount = violations + 1;
                setViolations(newCount);
                api.logViolation({ submissionId, type: 'tab-switch' }).catch(() => { });
                if (newCount >= MAX_VIOLATIONS) {
                    autoSubmit();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [phase, violations, submissionId, autoSubmit]);

    // Anti-cheating: prevent copy/paste/right-click
    useEffect(() => {
        if (phase !== 'exam') return;
        const prevent = (e: Event) => { e.preventDefault(); };
        const preventKeys = (e: KeyboardEvent) => {
            if (e.ctrlKey && ['c', 'v', 'x', 'a', 'u'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
            }
        };
        document.addEventListener('contextmenu', prevent);
        document.addEventListener('copy', prevent);
        document.addEventListener('paste', prevent);
        document.addEventListener('cut', prevent);
        document.addEventListener('keydown', preventKeys);
        document.addEventListener('selectstart', prevent);
        return () => {
            document.removeEventListener('contextmenu', prevent);
            document.removeEventListener('copy', prevent);
            document.removeEventListener('paste', prevent);
            document.removeEventListener('cut', prevent);
            document.removeEventListener('keydown', preventKeys);
            document.removeEventListener('selectstart', prevent);
        };
    }, [phase]);

    // Fullscreen
    const enterFullscreen = () => {
        document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => { });
    };

    useEffect(() => {
        if (phase !== 'exam') return;
        const handleFullscreen = () => {
            if (!document.fullscreenElement && phase === 'exam') {
                const newCount = violations + 1;
                setViolations(newCount);
                api.logViolation({ submissionId, type: 'fullscreen-exit' }).catch(() => { });
                if (newCount >= MAX_VIOLATIONS) autoSubmit();
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreen);
        return () => document.removeEventListener('fullscreenchange', handleFullscreen);
    }, [phase, violations, submissionId, autoSubmit]);

    const startExam = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await api.startExam(form);
            setQuestions(data.questions);
            setSubmissionId(data.submissionId);
            setTimeLeft(data.timeLimit * 60);
            enterFullscreen();
            setPhase('exam');
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    const submitExam = async () => {
        setLoading(true);
        try {
            const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId, selectedAnswer,
            }));
            const result = await api.submitExam({ submissionId, answers: answerArray, autoSubmit: false });
            setScore(result);
            setPhase('result');
            document.exitFullscreen?.().catch(() => { });
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all";

    // ===== REGISTER =====
    if (phase === 'register') {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full mx-auto px-6">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-display font-bold mb-2">Aptitude Exam</h1>
                        <p className="text-gray-400 text-sm">Enter your details to start the exam</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-4">
                        <div className="space-y-3 text-sm text-gray-400 mb-6">
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Time-limited exam</div>
                            <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Tab switching is monitored</div>
                            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Fullscreen mode required</div>
                            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /> {MAX_VIOLATIONS} violations = auto-submit</div>
                        </div>
                        <form onSubmit={startExam} className="space-y-4">
                            <input name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name *" required className={inputClass} />
                            <input name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email *" type="email" required className={inputClass} />
                            <input name="rollNo" value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })} placeholder="Roll Number *" required className={inputClass} />
                            {error && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl">{error}</p>}
                            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                                {loading ? 'Loading...' : 'Start Exam'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ===== EXAM =====
    if (phase === 'exam') {
        const q = questions[currentQ];
        return (
            <div className="min-h-screen bg-[#0a0a0a] p-4 select-none" style={{ userSelect: 'none' }}>
                {/* Top bar */}
                <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 mb-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">Q {currentQ + 1}/{questions.length}</span>
                        {violations > 0 && (
                            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> {violations}/{MAX_VIOLATIONS} warnings
                            </span>
                        )}
                    </div>
                    <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-primary'}`}>
                        <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Question */}
                {q && (
                    <motion.div key={q._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto">
                        <h2 className="text-xl font-bold mb-8 leading-relaxed">{q.question}</h2>
                        <div className="space-y-3 mb-8">
                            {q.options.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => setAnswers({ ...answers, [q._id]: i })}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${answers[q._id] === i
                                            ? 'bg-primary/10 border-primary/50 text-white'
                                            : 'bg-white/[0.02] border-white/5 text-gray-300 hover:border-white/15 hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <span className={`inline-block w-8 h-8 rounded-lg text-center leading-8 mr-3 text-sm font-bold ${answers[q._id] === i ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'
                                        }`}>
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {option}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Navigation */}
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                        className="px-5 py-2 border border-white/10 rounded-xl text-sm hover:bg-white/5 disabled:opacity-30 transition-all">
                        Previous
                    </button>

                    {/* Question dots */}
                    <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
                        {questions.map((_, i) => (
                            <button key={i} onClick={() => setCurrentQ(i)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${i === currentQ ? 'bg-primary text-white' : answers[questions[i]._id] !== undefined ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-500'
                                    }`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    {currentQ === questions.length - 1 ? (
                        <button onClick={submitExam} disabled={loading}
                            className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all">
                            Submit Exam
                        </button>
                    ) : (
                        <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                            className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all">
                            Next
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ===== RESULT =====
    return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md mx-auto p-8">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-display font-bold mb-4">Exam Complete!</h2>
                <div className="text-6xl font-display font-bold text-primary mb-2">{score.score}/{score.total}</div>
                <p className="text-gray-400 mb-2">{Math.round((score.score / Math.max(score.total, 1)) * 100)}% correct</p>
                {violations > 0 && <p className="text-yellow-400 text-sm">⚠ {violations} violation(s) recorded</p>}
            </motion.div>
        </div>
    );
};

export default Exam;
