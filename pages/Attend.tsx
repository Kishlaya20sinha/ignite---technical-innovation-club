import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { CheckCircle, AlertCircle, Scan } from 'lucide-react';

const Attend: React.FC = () => {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get('event');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedEmail = localStorage.getItem('student_email');
        if (savedEmail) setEmail(savedEmail);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventId) return;

        setStatus('loading');
        try {
            const res = await api.markAttendance({ eventId, email });
            localStorage.setItem('student_email', email);
            setStatus('success');
            setMessage(res.message);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Failed to mark attendance');
        }
    };

    if (!eventId) {
        return (
            <div className="pt-32 pb-20 container mx-auto px-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Invalid Attendance Link</h1>
                <p className="text-gray-400">Please scan a valid workshop QR code.</p>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 min-h-screen container mx-auto px-6">
            <div className="max-w-md mx-auto bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Scan className="w-8 h-8 text-primary" />
                </div>

                <h1 className="text-3xl font-display font-bold mb-2">Mark Attendance</h1>
                <p className="text-gray-500 mb-8 text-sm">Please enter the email you used for registration.</p>

                {status === 'success' ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Done!</h2>
                        <p className="text-gray-400">{message}</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all text-center"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Marking...' : 'Confirm Attendance'}
                        </button>
                        {status === 'error' && (
                            <p className="text-red-400 text-sm mt-2">{message}</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default Attend;
