import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, ArrowRight, Sparkles, Upload, FileText, Check } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { api } from '../lib/api';

const Recruit: React.FC = () => {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<{
        name: string; email: string; phone: string; rollNo: string; branch: string; batch: string;
        interests: string[]; esportsGame: string;
        whyJoin: string;
        resume: string;
    }>({
        name: '', email: '', phone: '', rollNo: '', branch: '', batch: '2025',
        interests: [], esportsGame: '',
        whyJoin: '',
        resume: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (value: string) => {
        setForm(prev => {
            const interests = prev.interests.includes(value)
                ? prev.interests.filter(i => i !== value)
                : [...prev.interests, value];
            return { ...prev, interests };
        });
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step !== 3) return; // Prevent submission on earlier steps (e.g., Enter key)

        if (form.interests.length === 0) {
            setError('Please select at least one interest (Ignite Club or BITP Esports).');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (key === 'interests') {
                    // Send interests as individual entries or handled by backend as array
                    (value as string[]).forEach(interest => formData.append('interests[]', interest)); // Matches common array handling
                    // Also simple append mostly works with multiple values for same key
                    // But let's append each one. Express urlencoded extended handles this, multer handles fields.
                    // For multer/body-parser to see it as array, usually repeating name works.
                    // Let's just append normally.
                } else if (key === 'resume' && value) {
                    formData.append('resume', value as File);
                } else if (value !== null && value !== undefined && key !== 'interests') {
                    formData.append(key, value as string);
                }
            });
            // Fix: Re-appending interests correctly for Express/Multer if needed, 
            // but formData.append('interests', 'val1'); formData.append('interests', 'val2') creates an array.
            // Let's clear previous loop logic and do it cleanly.

            const finalFormData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (key === 'interests') {
                    (value as string[]).forEach(v => finalFormData.append('interests', v));
                } else if (key === 'resume') {
                    if (value) finalFormData.append('resume', value as File);
                } else {
                    finalFormData.append(key, value as string);
                }
            });

            await api.submitApplication(finalFormData);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md mx-auto p-8">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-display font-bold mb-4">Application Submitted!</h2>
                    <p className="text-gray-400">Thank you for applying to IGNITE. We'll review your application and get back to you soon.</p>
                </motion.div>
            </div>
        );
    }

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all";

    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-6 max-w-2xl">
                <SectionWrapper>
                    <div className="text-center mb-12">
                        <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary uppercase tracking-[0.2em] inline-block mb-6">
                            <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" /> Recruitment 2025
                        </span>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Join IGNITE</h1>
                        <p className="text-gray-400">Be part of the premier tech community at BIT Mesra</p>
                    </div>
                </SectionWrapper>

                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-primary text-white' : 'bg-white/5 text-gray-500'}`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`w-10 h-0.5 ${step > s ? 'bg-primary' : 'bg-white/10'}`} />}
                        </div>
                    ))}
                </div>

                <motion.form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <h3 className="text-xl font-bold mb-4">Personal Details</h3>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name *" required className={inputClass} />
                            <input name="email" value={form.email} onChange={handleChange} placeholder="Email *" type="email" required className={inputClass} />
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number *" required className={inputClass} />
                            <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <h3 className="text-xl font-bold mb-4">Academic & Interests</h3>
                            <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="Roll Number (e.g., BTECH/15XXX/2X) *" required className={inputClass} />
                            <input name="branch" value={form.branch} onChange={handleChange} placeholder="Branch (e.g., CSE OR ECE or BCA) *" required className={inputClass} />

                            <div className="space-y-3 pt-2">
                                <label className="text-sm text-gray-400 block mb-2">I want to join: *</label>
                                <div className="flex gap-4">
                                    {['Ignite Club', 'BITP Esports'].map(interest => (
                                        <div
                                            key={interest}
                                            onClick={() => handleCheckboxChange(interest)}
                                            className={`flex-1 p-4 rounded-xl border border-white/10 cursor-pointer transition-all flex items-center gap-3 ${form.interests.includes(interest) ? 'bg-primary/20 border-primary' : 'bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.interests.includes(interest) ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                                                {form.interests.includes(interest) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="font-medium">{interest}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {form.interests.includes('BITP Esports') && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <input
                                        name="esportsGame"
                                        value={form.esportsGame}
                                        onChange={handleChange}
                                        placeholder="Which game do you play? (e.g., Valorant, BGMI) *"
                                        required
                                        className={inputClass}
                                    />
                                </motion.div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors">Back</button>
                                <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                                    Next <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <h3 className="text-xl font-bold mb-4">Final Step</h3>
                            <textarea name="whyJoin" value={form.whyJoin} onChange={handleChange} placeholder="Why do you want to join IGNITE? *" required rows={4} className={inputClass} />


                            <div className="pt-2">
                                <label className="text-sm text-gray-400 block mb-2">Resume Link (Drive) *</label>
                                <input
                                    name="resume"
                                    value={form.resume}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    required
                                    className={inputClass}
                                />
                                <p className="text-xs text-gray-500 mt-1">Make sure the link is publicly accessible.</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-white/20 text-white rounded-xl hover:bg-white/5 transition-colors">Back</button>
                                <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Application</>}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.form>
            </div>
        </div>
    );
};

export default Recruit;
