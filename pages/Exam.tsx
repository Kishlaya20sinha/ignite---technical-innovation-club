import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
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
        } catch { }
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
            if (e.ctrlKey && ['c', 'v', 'x', 'a', 'u', 's'].includes(e.key.toLowerCase())) {
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
            if (!document.fullscreenElement && phase === 'exam') {
                const newCount = violations + 1;
                setViolations(newCount);
                api.logViolation({ submissionId, type: 'fullscreen-exit' }).catch(() => { });
                if (newCount >= MAX_VIOLATIONS) autoSubmit();
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreen);
        document.addEventListener('webkitfullscreenchange', handleFullscreen);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreen);
            document.removeEventListener('webkitfullscreenchange', handleFullscreen);
        };
    }, [phase, violations, submissionId, autoSubmit]);

    const checkTimeWindow = async () => {
        try {
            const config = await api.get('/api/exam/config');
            const now = new Date();
            if (config.startTime && new Date(config.startTime) > now) {
                const startStr = new Date(config.startTime).toLocaleString();
                setError(`Exam has not started yet. It begins at ${startStr}`);
                return false;
            }
            if (config.endTime && new Date(config.endTime) < now) {
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
        if (!confirm("Are you sure you want to submit?")) return;
        setLoading(true);
        try {
            const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId, selectedAnswer,
            }));
            const result = await api.submitExam({ submissionId, answers: answerArray, autoSubmit: false });
            setScore(result);
            setPhase('result');
            if (document.fullscreenElement) {
                document.exitFullscreen?.().catch(() => { });
            }
            localStorage.removeItem(`exam_progress_${submissionId}`);
        } catch (err: any) {
            setError(err.message);
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
                    alert(`⚠️ ADMIN WARNING:\n${latest.message}`);
                    setLastWarningCount(warnings.length);
                }

                if (res.extraMinutes > lastExtraMinutes) {
                    const added = (res.extraMinutes - lastExtraMinutes) * 60;
                    setTimeLeft(prev => prev + added);
                    setLastExtraMinutes(res.extraMinutes);
                    alert(`⏰ EXTRA TIME GRANTED: +${res.extraMinutes - lastExtraMinutes} minutes!`);
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
                onSubmit={submitExam}
                loading={loading}
                allQuestions={questions}
                jumpToQuestion={setCurrentQ}
            />
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
