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
            <motion.div key={question._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto">
                <h2 className="text-xl font-bold mb-8 leading-relaxed">{question.question}</h2>
                <div className="space-y-3 mb-8">
                    {question.type === 'input' ? (
                        <textarea
                            value={answers[question._id] || ''}
                            onChange={(e) => setAnswer(question._id, e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-all h-32"
                            placeholder="Type your answer here..."
                        />
                    ) : (
                        question.options.map((option, i) => (
                            <button
                                key={i}
                                onClick={() => setAnswer(question._id, i)}
                                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${answers[question._id] === i
                                    ? 'bg-primary/10 border-primary/50 text-white'
                                    : 'bg-white/[0.02] border-white/5 text-gray-300 hover:border-white/15 hover:bg-white/[0.04]'
                                    }`}
                            >
                                <span className={`inline-block w-8 h-8 rounded-lg text-center leading-8 mr-3 text-sm font-bold ${answers[question._id] === i ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'
                                    }`}>
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {option}
                            </button>
                        ))
                    )}
                </div>
            </motion.div>

            {/* Navigation */}
            <div className="max-w-3xl mx-auto flex justify-between items-center">
                <button onClick={onPrev} disabled={currentQ === 0}
                    className="px-5 py-2 border border-white/10 rounded-xl text-sm hover:bg-white/5 disabled:opacity-30 transition-all">
                    Previous
                </button>

                {/* Question dots */}
                <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
                    {allQuestions.map((_, i) => (
                        <button key={i} onClick={() => jumpToQuestion(i)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${i === currentQ ? 'bg-primary text-white' : answers[allQuestions[i]._id] !== undefined ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-500'
                                }`}>
                            {i + 1}
                        </button>
                    ))}
                </div>

                {currentQ === totalQ - 1 ? (
                    <button onClick={onSubmit} disabled={loading}
                        className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-all">
                        Submit Exam
                    </button>
                ) : (
                    <button onClick={onNext}
                        className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all">
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};
