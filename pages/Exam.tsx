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
    const [phase, setPhase] = useState<'register' | 'exam' | 'result'>('register');
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
        } catch { return true; } // If config fails, allow entry (graceful degradation)
    };

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email) return alert("Please enter email");

        setLoading(true);
        setError('');

        const isTimeOk = await checkTimeWindow();
        if (!isTimeOk) {
            setLoading(false);
            return;
        }

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
                handleStart={handleStart}
                loading={loading}
                error={error}
                maxViolations={MAX_VIOLATIONS}
            />
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
