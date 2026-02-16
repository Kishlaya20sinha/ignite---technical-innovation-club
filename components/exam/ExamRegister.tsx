import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Eye, AlertTriangle } from 'lucide-react';

interface ExamRegisterProps {
    email: string;
    setEmail: (email: string) => void;
    handleStart: (e: React.FormEvent) => void;
    loading: boolean;
    error: string;
    maxViolations: number;
}

export const ExamRegister: React.FC<ExamRegisterProps> = ({ email, setEmail, handleStart, loading, error, maxViolations }) => {
    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all";

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
                        <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /> {maxViolations} violations = auto-submit</div>
                    </div>
                    <form onSubmit={handleStart} className="space-y-4">
                        <input name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *" type="email" required className={inputClass} />
                        {error && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                            {loading ? 'Loading...' : 'Start Exam'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
