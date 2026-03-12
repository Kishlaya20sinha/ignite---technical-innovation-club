import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ExamRegister } from '../components/exam/ExamRegister';
import { ExamQuestionView } from '../components/exam/ExamQuestionView';
import { ExamResult } from '../components/exam/ExamResult';

interface Question {
    _id: string;
    question: string;
    options: string[];
    type: 'mcq' | 'input';
}

const Exam: React.FC = () => {
    const [phase, setPhase] = useState<'register' | 'instructions' | 'exam' | 'result'>('register');
    const [form, setForm] = useState({ email: '' });
    const [candidateName, setCandidateName] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<string, number | string>>({});
    const [currentQ, setCurrentQ] = useState(0);
    const [submissionId, setSubmissionId] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState({ score: 0, total: 0 });
    const [violations, setViolations] = useState(0);
    const [warnings, setWarnings] = useState<{ id: number, msg: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [lastWarningCount, setLastWarningCount] = useState(0);
    const [lastExtraMinutes, setLastExtraMinutes] = useState(0);

    const MAX_VIOLATIONS = 3;

    // Load progress from localStorage on mount/exam start
    useEffect(() => {
        if (phase === 'exam' && submissionId) {
            const saved = localStorage.getItem(`exam_progress_${submissionId}`);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setAnswers(parsed.answers || {});
                    setCurrentQ(parsed.currentQ || 0);
                } catch (e) { console.error("Restore failed", e); }
            }
        }
    }, [phase, submissionId]);

    // Save progress to localStorage whenever it changes
    useEffect(() => {
        if (phase === 'exam' && submissionId) {
            localStorage.setItem(`exam_progress_${submissionId}`, JSON.stringify({
                answers,
                currentQ,
                timestamp: Date.now()
            }));
        }
    }, [answers, currentQ, phase, submissionId]);

    // Clear localStorage on result
    useEffect(() => {
        if (phase === 'result' && submissionId) {
            localStorage.removeItem(`exam_progress_${submissionId}`);
        }
    }, [phase, submissionId]);

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
            localStorage.removeItem(`exam_progress_${submissionId}`);
        } catch (err: any) {
            console.error("Auto-submit failed:", err);
            // If it fails (e.g. backend says "already submitted"), force them to result screen anyway
            setPhase('result');
            localStorage.removeItem(`exam_progress_${submissionId}`);
        }
    }, [answers, submissionId, phase]);

    // Timer logic
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

    // Watch for violations hitting limit to trigger submit
    useEffect(() => {
        if (phase === 'exam' && violations >= MAX_VIOLATIONS) {
            autoSubmit();
        }
    }, [violations, phase, autoSubmit]);

    // Anti-cheating: visibility change
    useEffect(() => {
        if (phase !== 'exam') return;
        const handleVisibility = () => {
            if (document.hidden) {
                setViolations(prev => prev + 1);
                setWarnings(prev => [...prev, { id: Date.now(), msg: "⚠️ Warning: Tab switching or minimizing is not allowed. This is recorded as a violation." }]);
                api.logViolation({ submissionId, type: 'tab-switch' }).catch(() => { });
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [phase, submissionId]);

    // Anti-cheating: prevent copy/paste/right-click
    useEffect(() => {
        if (phase !== 'exam') return;
        const warnUser = (action: string) => {
            setWarnings(prev => [...prev, { id: Date.now(), msg: `⚠️ ${action} is disabled during the exam.` }]);
        };
        const prevent = (action: string) => (e: Event) => {
            e.preventDefault();
            warnUser(action);
        };
        const preventKeys = (e: KeyboardEvent) => {
            if (e.ctrlKey && ['c', 'v', 'x', 'a', 'u', 's'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                warnUser('Keyboard shortcuts');
            }
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
                warnUser('Developer tools');
            }
        };

        const preventScreenCapture = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's')) {
                e.preventDefault();
                navigator.clipboard.writeText('').catch(() => { }); // Try to clear clipboard
                setViolations(prev => prev + 1);
                warnUser('Screenshots / Snipping Tool');
                api.logViolation({ submissionId, type: 'screenshot' }).catch(() => { });
            }
        };

        const preventCtx = prevent('Right-click');
        const preventCopy = prevent('Copying');
        const preventPaste = prevent('Pasting');
        const preventCut = prevent('Cutting');
        const preventSelect = prevent('Text selection');

        document.addEventListener('contextmenu', preventCtx);
        document.addEventListener('copy', preventCopy);
        document.addEventListener('paste', preventPaste);
        document.addEventListener('cut', preventCut);
        document.addEventListener('keydown', preventKeys);
        document.addEventListener('keyup', preventScreenCapture);
        document.addEventListener('selectstart', preventSelect);
        return () => {
            document.removeEventListener('contextmenu', preventCtx);
            document.removeEventListener('copy', preventCopy);
            document.removeEventListener('paste', preventPaste);
            document.removeEventListener('cut', preventCut);
            document.removeEventListener('keydown', preventKeys);
            document.removeEventListener('keyup', preventScreenCapture);
            document.removeEventListener('selectstart', preventSelect);
        };
    }, [phase, submissionId]);

    // Fullscreen logic
    const enterFullscreen = () => {
        const doc = document.documentElement as any;
        if (doc.requestFullscreen) doc.requestFullscreen();
        else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen();
        else if (doc.msRequestFullscreen) doc.msRequestFullscreen();
        setIsFullscreen(true);
    };

    useEffect(() => {
        if (phase !== 'exam') return;
        const handleFullscreen = () => {
            const isFull = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
            setIsFullscreen(isFull);
            if (!isFull) {
                setViolations(prev => prev + 1);
                setWarnings(prev => [...prev, { id: Date.now(), msg: "⚠️ Warning: Exiting fullscreen is not allowed. Please click 'Return to Exam' to continue." }]);
                api.logViolation({ submissionId, type: 'fullscreen-exit' }).catch(() => { });
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreen);
        document.addEventListener('webkitfullscreenchange', handleFullscreen);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreen);
            document.removeEventListener('webkitfullscreenchange', handleFullscreen);
        };
    }, [phase, submissionId]);

    const checkTimeWindow = async () => {
        try {
            const config = await api.get('/api/exam/config');
            const now = new Date();

            // config.startTime is 'YYYY-MM-DDTHH:MM' (local time from admin)
            const start = config.startTime ? new Date(config.startTime) : null;
            const end = config.endTime ? new Date(config.endTime) : null;

            if (start && start > now) {
                setError(`Exam has not started yet. It begins at ${start.toLocaleString()}`);
                return false;
            }
            if (end && end < now) {
                setError("Exam has ended. Registrations are closed.");
                return false;
            }
            return true;
        } catch { return true; }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email) return alert("Please enter email");
        setLoading(true);
        setError('');
        const isTimeOk = await checkTimeWindow();
        if (isTimeOk) {
            setPhase('instructions');
        }
        setLoading(false);
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await api.startExam({ email: form.email });
            setSubmissionId(res.submissionId);
            setQuestions(res.questions);
            setTimeLeft(res.timeLimit * 60);
            setCandidateName(res.candidateName);
            enterFullscreen();
            setPhase('exam');
        } catch (err: any) {
            setError(err.message || "Failed to start");
            setPhase('register');
        }
        setLoading(false);
    };

    // Sync answers to server periodically (for Force Submit accuracy)
    useEffect(() => {
        if (phase !== 'exam' || !submissionId) return;
        const interval = setInterval(async () => {
            try {
                const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                    questionId, selectedAnswer,
                }));
                await api.syncAnswers({ submissionId, answers: answerArray });
            } catch (e) { /* background sync, ignore errors */ }
        }, 45000); // Sync every 45s
        return () => clearInterval(interval);
    }, [answers, phase, submissionId]);

    const submitExam = async () => {
        setLoading(true);
        try {
            const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId, selectedAnswer,
            }));
            const result = await api.submitExam({ submissionId, answers: answerArray, autoSubmit: false });
            setScore(result);
            setPhase('result');
            setShowSubmitConfirm(false);
            if (document.fullscreenElement) {
                document.exitFullscreen?.().catch(() => { });
            }
            localStorage.removeItem(`exam_progress_${submissionId}`);
        } catch (err: any) {
            setError(err.message);
            setShowSubmitConfirm(false);
        }
        setLoading(false);
    };

    // Poll for warnings and status updates
    useEffect(() => {
        if (!submissionId || phase !== 'exam') return;

        const interval = setInterval(async () => {
            try {
                const res = await api.getExamStatus(submissionId);
                const warnings = res.adminWarnings || [];
                if (warnings.length > lastWarningCount) {
                    const latest = warnings[warnings.length - 1];
                    setWarnings(prev => [...prev, { id: Date.now(), msg: latest.message }]);
                    setLastWarningCount(warnings.length);
                }

                if (res.extraMinutes > lastExtraMinutes) {
                    const added = (res.extraMinutes - lastExtraMinutes) * 60;
                    setTimeLeft(prev => prev + added);
                    setLastExtraMinutes(res.extraMinutes);
                    setWarnings(prev => [...prev, { id: Date.now(), msg: `⏰ EXTRA TIME GRANTED: +${res.extraMinutes - lastExtraMinutes} minutes!` }]);
                }

                if (res.status === 'submitted' || res.status === 'auto-submitted') {
                    setPhase('result');
                }
            } catch (e) { console.error("Poll failed", e); }
        }, 8000);

        return () => clearInterval(interval);
    }, [submissionId, phase, lastWarningCount]);

    if (phase === 'register') {
        return (
            <ExamRegister
                email={form.email}
                setEmail={e => setForm({ ...form, email: e })}
                handleStart={handleRegister}
                loading={loading}
                error={error}
                maxViolations={MAX_VIOLATIONS}
            />
        );
    }

    if (phase === 'instructions') {
        return (
            <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
                <div className="max-w-2xl w-full mx-auto px-6">
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <h2 className="text-3xl font-display font-bold mb-6 text-white">Exam Instructions</h2>
                        <ul className="space-y-4 text-gray-400 text-sm mb-8">
                            <li className="flex gap-3">
                                <span className="bg-primary/20 text-primary w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <p>This exam consists of <strong>20 Multiple Choice Questions</strong> (5 Easy, 8 Medium, 7 Hard). Total time: <strong>30 Minutes</strong>.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="bg-primary/20 text-primary w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <p><strong>Real-time proctoring is enabled</strong>. Switching tabs, minimizing the browser, or exiting fullscreen will count as a violation.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="bg-primary/20 text-primary w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                <p>Reaching <strong>{MAX_VIOLATIONS} violations</strong> will automatically submit your exam immediately.</p>
                            </li>
                            <li className="flex gap-3">
                                <span className="bg-primary/20 text-primary w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                <p>Progress is <strong>auto-saved</strong>. If your browser crashes, re-enter your email to resume.</p>
                            </li>
                        </ul>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-8">
                            <p className="text-xs text-yellow-500 font-medium">
                                Technical Check: Ensure you have a stable internet connection and your browser supports fullscreen mode.
                            </p>
                        </div>

                        <button
                            onClick={handleStart}
                            disabled={loading}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20"
                        >
                            {loading ? 'Starting...' : 'I Understand, Let\'s Start'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'exam' && questions[currentQ]) {
        return (
            <>
                {/* Fullscreen Blocker Overlay */}
                {!isFullscreen && (
                    <div className="fixed inset-0 z-[9999] bg-[#0a0a0c]/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6">
                        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-red-500/20">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h2 className="text-4xl font-display font-bold text-white mb-4">Fullscreen Required</h2>
                        <p className="text-gray-400 text-lg max-w-lg mb-8 leading-relaxed">
                            You have exited fullscreen mode or opened another app. This has been recorded as a violation. You must remain in fullscreen to continue the exam.
                        </p>
                        <button
                            onClick={enterFullscreen}
                            className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/30"
                        >
                            Return to Exam
                        </button>
                    </div>
                )}

                <ExamQuestionView
                    currentQ={currentQ}
                    totalQ={questions.length}
                    question={questions[currentQ]}
                    answers={answers}
                    setAnswer={(qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }))}
                    timeLeft={timeLeft}
                    violations={violations}
                    maxViolations={MAX_VIOLATIONS}
                    onNext={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                    onPrev={() => setCurrentQ(Math.max(0, currentQ - 1))}
                    onSubmit={() => setShowSubmitConfirm(true)}
                    loading={loading}
                    allQuestions={questions}
                    jumpToQuestion={setCurrentQ}
                    adminWarnings={warnings}
                    clearWarning={(id) => setWarnings(prev => prev.filter(w => w.id !== id))}
                />

                {/* Custom Submit Confirmation Modal */}
                <AnimatePresence>
                    {showSubmitConfirm && (
                        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-[#121214] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                            >
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold text-center mb-2">Submit Exam?</h3>
                                <p className="text-gray-400 text-center mb-8">
                                    Are you sure you want to end your exam? You cannot change your answers after submission.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={submitExam}
                                        disabled={loading}
                                        className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Submitting...' : 'Yes, Submit Now'}
                                    </button>
                                    <button
                                        onClick={() => setShowSubmitConfirm(false)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    return (
        <ExamResult
            score={score.score}
            total={score.total}
            violations={violations}
        />
    );
};

export default Exam;
