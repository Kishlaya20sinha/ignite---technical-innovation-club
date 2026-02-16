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
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-display font-bold mb-4">Exam Complete!</h2>
                <div className="text-6xl font-display font-bold text-primary mb-2">{score}/{total}</div>
                <p className="text-gray-400 mb-2">{Math.round((score / Math.max(total, 1)) * 100)}% correct</p>
                {violations > 0 && <p className="text-yellow-400 text-sm">⚠ {violations} violation(s) recorded</p>}
            </motion.div>
        </div>
    );
};
