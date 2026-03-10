import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface Question {
    _id: string;
    question: string;
    options: string[];
    type: 'mcq' | 'input';
}

interface ExamQuestionViewProps {
    currentQ: number;
    totalQ: number;
    question: Question;
    answers: Record<string, any>;
    setAnswer: (qId: string, val: any) => void;
    timeLeft: number;
    violations: number;
    maxViolations: number;
    onNext: () => void;
    onPrev: () => void;
    onSubmit: () => void;
    loading: boolean;
    allQuestions: Question[];
    jumpToQuestion: (index: number) => void;
    adminWarnings?: { id: number; msg: string }[];
    clearWarning?: (id: number) => void;
}

export const ExamQuestionView: React.FC<ExamQuestionViewProps> = ({
    currentQ, totalQ, question, answers, setAnswer, timeLeft,
    violations, maxViolations, onNext, onPrev, onSubmit, loading,
    allQuestions, jumpToQuestion, adminWarnings = [], clearWarning
}) => {
    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // Auto-clear warnings after 8 seconds
    useEffect(() => {
        adminWarnings.forEach(w => {
            const timer = setTimeout(() => clearWarning?.(w.id), 8000);
            return () => clearTimeout(timer);
        });
    }, [adminWarnings, clearWarning]);

    // Handle Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                if (currentQ < totalQ - 1) onNext();
            } else if (e.key === 'ArrowLeft') {
                if (currentQ > 0) onPrev();
            } else if (['1', '2', '3', '4'].includes(e.key)) {
                const idx = parseInt(e.key) - 1;
                if (question.options[idx]) setAnswer(question._id, idx);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentQ, totalQ, onNext, onPrev, question, setAnswer]);

    const isAnswered = (idx: number) => answers[allQuestions[idx]._id] !== undefined;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col select-none font-sans" style={{ userSelect: 'none' }}>
            
            {/* Header / Navbar */}
            <header className="h-16 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6 shrink-0 z-10 sticky top-0 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 font-display">
                        <span className="text-primary font-bold text-sm">IG</span>
                    </div>
                    <span className="font-semibold tracking-wide font-display text-gray-200">Ignite Technical Exam</span>
                </div>

                {violations > 0 && (
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <AlertTriangle className="w-4 h-4" />
                        Violations: {violations}/{maxViolations}
                    </div>
                )}
            </header>

            <div className="flex-1 flex flex-col lg:flex-row relative">
                
                {/* Main Content Area (Left) */}
                <main className="flex-1 p-6 lg:p-12 flex flex-col max-w-5xl mx-auto w-full">
                    
                    {/* Question Stats */}
                    <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                        <div>
                            <span className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Question {currentQ + 1} of {totalQ}</span>
                            <div className="text-sm text-gray-500 mt-1">{answeredCount} Answered • {totalQ - answeredCount} Remaining</div>
                        </div>
                    </div>

                    {/* Question Box */}
                    <motion.div 
                        key={question._id} 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        className="flex-1"
                    >
                        <div className="text-xl md:text-2xl font-medium leading-relaxed mb-10 w-full text-gray-100">
                            {(() => {
                                const text = question.question;
                                const codeMatch = text.match(/```([\s\S]*?)```/);
                                if (codeMatch) {
                                    const parts = text.split(/```[\s\S]*?```/);
                                    return (
                                        <>
                                            <span className="leading-relaxed whitespace-pre-wrap block mb-4">{parts[0]}</span>
                                            <pre className="mt-6 mb-6 p-6 bg-[#121214] border border-white/10 rounded-2xl overflow-x-auto text-sm font-mono text-emerald-400 whitespace-pre leading-relaxed shadow-inner">
                                                <code>{codeMatch[1].trim()}</code>
                                            </pre>
                                            {parts[1] && <span className="leading-relaxed whitespace-pre-wrap block mt-4 text-gray-300">{parts[1]}</span>}
                                        </>
                                    );
                                }
                                if (text.includes('\n') && text.split('\n').length > 2) {
                                    const lines = text.split('\n');
                                    const questionLine = lines[0];
                                    const codeLines = lines.slice(1).join('\n').trim();
                                    return (
                                        <>
                                            <span className="leading-relaxed block mb-4">{questionLine}</span>
                                            {codeLines && (
                                                <pre className="mt-6 mb-6 p-6 bg-[#121214] border border-white/10 rounded-2xl overflow-x-auto text-sm font-mono text-emerald-400 whitespace-pre leading-relaxed shadow-inner">
                                                    <code>{codeLines}</code>
                                                </pre>
                                            )}
                                        </>
                                    );
                                }
                                return <span className="leading-relaxed whitespace-pre-wrap">{text}</span>;
                            })()}
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 gap-4 mb-12 mt-8">
                            {question.options.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => setAnswer(question._id, i)}
                                    className={`group relative flex items-center p-5 rounded-xl border transition-all duration-200 text-left ${
                                        answers[question._id] === i
                                            ? 'bg-primary/10 border-primary ring-1 ring-primary shadow-lg shadow-primary/5'
                                            : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold mr-5 shrink-0 transition-colors shadow-sm ${
                                        answers[question._id] === i
                                            ? 'bg-primary text-white shadow-primary/40'
                                            : 'bg-white/10 text-gray-400 group-hover:text-gray-300'
                                    }`}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <span className={`text-base md:text-lg transition-colors leading-relaxed ${
                                        answers[question._id] === i ? 'text-white font-semibold' : 'text-gray-300'
                                    }`}>
                                        {option}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bottom Action Bar */}
                    <div className="flex justify-between items-center pt-6 mt-8 border-t border-white/5">
                        <button 
                            onClick={onPrev} 
                            disabled={currentQ === 0}
                            className="px-8 py-4 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            Previous
                        </button>

                        {currentQ === totalQ - 1 ? (
                            <button 
                                onClick={onSubmit} 
                                disabled={loading}
                                className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 transform active:scale-95"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Submit Exam
                            </button>
                        ) : (
                            <button 
                                onClick={onNext}
                                className="px-10 py-4 bg-primary text-white hover:bg-primary-dark rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                            >
                                Next Question
                            </button>
                        )}
                    </div>
                </main>

                {/* Right Sidebar (Navigation Palette & Timer) */}
                <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/5 bg-[#0d0d0f]/80 flex flex-col shrink-0 lg:h-[calc(100vh-64px)] lg:sticky lg:top-16">
                    
                    {/* Timer Block */}
                    <div className={`p-8 border-b border-white/5 flex flex-col items-center justify-center transition-colors ${timeLeft < 60 ? 'bg-red-500/10' : 'bg-white/[0.01]'}`}>
                        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-3">Time Remaining</span>
                        <div className={`text-4xl lg:text-5xl font-mono font-bold flex items-center gap-3 tracking-tight ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            <Clock className="w-8 h-8 opacity-50 block lg:hidden" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Question Nav Palette */}
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                        <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-4 block">Question Palette</span>
                        
                        <div className="grid grid-cols-5 gap-2.5 mb-8">
                            {allQuestions.map((_, i) => {
                                const active = i === currentQ;
                                const answered = isAnswered(i);
                                return (
                                    <button
                                        key={i}
                                        onClick={() => jumpToQuestion(i)}
                                        className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                                            active
                                                ? 'bg-white text-black ring-2 ring-white ring-offset-2 ring-offset-[#0d0d0f] shadow-lg shadow-white/20'
                                                : answered
                                                    ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                                                    : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                <div className="w-3.5 h-3.5 rounded bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] leading-none" /> Current
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                                <div className="w-3.5 h-3.5 rounded bg-primary/20 border border-primary/30" /> Answered
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                <div className="w-3.5 h-3.5 rounded bg-white/5 border border-white/5" /> Unanswered
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Toasts Container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
                <AnimatePresence>
                    {adminWarnings.map((warning) => (
                        <motion.div
                            key={warning.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className="bg-[#1a0f0f] backdrop-blur-xl border border-red-500/30 rounded-2xl p-4 shadow-2xl flex items-start gap-3 pointer-events-auto"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-red-500 font-bold text-sm mb-1 uppercase tracking-wider">Admin Notice</h4>
                                <p className="text-red-100 text-sm leading-relaxed">{warning.msg}</p>
                            </div>
                            <button 
                                onClick={() => clearWarning?.(warning.id)}
                                className="text-red-500/50 hover:text-red-500 transition-colors p-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
};
