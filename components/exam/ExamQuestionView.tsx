import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

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
}

export const ExamQuestionView: React.FC<ExamQuestionViewProps> = ({
    currentQ, totalQ, question, answers, setAnswer, timeLeft,
    violations, maxViolations, onNext, onPrev, onSubmit, loading,
    allQuestions, jumpToQuestion
}) => {
    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-4 select-none" style={{ userSelect: 'none' }}>
            {/* Top bar */}
            <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 mb-6">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">Q {currentQ + 1}/{totalQ}</span>
                    {violations > 0 && (
                        <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {violations}/{maxViolations} warnings
                        </span>
                    )}
                </div>
                <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-primary'}`}>
                    <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                </div>
            </div>

            {/* Question */}
            <motion.div key={question._id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto px-4 py-8 bg-white/[0.02] border border-white/5 rounded-3xl shadow-2xl mb-12">
                <div className="flex justify-between items-start mb-10 gap-6">
                    <h2 className="text-2xl font-bold leading-relaxed text-white">
                        <span className="text-primary mr-3 italic opacity-50"># {currentQ + 1}</span>
                        {question.question}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {question.options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => setAnswer(question._id, i)}
                            className={`group relative flex items-center p-6 rounded-2xl border transition-all duration-300 ${answers[question._id] === i
                                ? 'bg-primary/20 border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]'
                                : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mr-4 transition-all duration-300 ${answers[question._id] === i
                                ? 'bg-primary text-white scale-110 shadow-lg'
                                : 'bg-white/10 text-gray-500 group-hover:text-gray-300'
                                }`}>
                                {String.fromCharCode(65 + i)}
                            </div>
                            <span className={`text-lg transition-colors ${answers[question._id] === i ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                {option}
                            </span>
                            {answers[question._id] === i && (
                                <motion.div layoutId="selection-glow" className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none" />
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Navigation & Palette Container */}
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Controls */}
                    <div className="lg:col-span-1 flex flex-col gap-4 order-2 lg:order-1">
                        <div className="flex justify-between gap-3">
                            <button onClick={onPrev} disabled={currentQ === 0}
                                className="flex-1 px-6 py-4 border border-white/10 rounded-2xl text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-20 transition-all">
                                Previous
                            </button>
                            {currentQ === totalQ - 1 ? (
                                <button onClick={onSubmit} disabled={loading}
                                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-2xl text-sm font-extrabold hover:bg-green-700 disabled:opacity-50 transition-all shadow-xl shadow-green-600/20 active:scale-95">
                                    Final Submit
                                </button>
                            ) : (
                                <button onClick={onNext}
                                    className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-sm font-extrabold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95">
                                    Next Question
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Palette */}
                    <div className="lg:col-span-2 order-1 lg:order-2 bg-white/[0.01] border border-white/5 p-4 rounded-3xl">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Quick Navigation</span>
                            <div className="flex gap-4 text-[10px] font-bold">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Current</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500/50" /> Answered</div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/10" /> Pending</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allQuestions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => jumpToQuestion(i)}
                                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all duration-300 relative ${i === currentQ
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10'
                                        : answers[allQuestions[i]._id] !== undefined
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                                            : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/20 hover:text-gray-300'
                                        }`}
                                >
                                    {i + 1}
                                    {i === currentQ && (
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
