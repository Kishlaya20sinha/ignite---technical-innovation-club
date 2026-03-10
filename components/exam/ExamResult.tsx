import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface ExamResultProps {
    score: number;
    total: number;
    violations: number;
}

export const ExamResult: React.FC<ExamResultProps> = ({ score, total, violations }) => {
    return (
        <div className="min-h-screen pt-24 flex items-center justify-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md mx-auto p-8">
                <CheckCircle className="w-20 h-20 text-primary mx-auto mb-8 shadow-lg shadow-primary/20 rounded-full" />
                <h2 className="text-4xl font-display font-bold mb-4 text-white">Exam Submitted!</h2>
                <p className="text-gray-400 mb-8 text-lg">Your responses have been recorded successfully. You may now close this window.</p>
                {violations > 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 inline-block">
                        <p className="text-yellow-500 font-semibold text-sm">⚠ {violations} violation(s) recorded during the exam</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
