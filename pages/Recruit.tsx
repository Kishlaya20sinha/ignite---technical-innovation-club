import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, ArrowRight, Sparkles, Check, X, MessageCircle } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { api } from '../lib/api';

// WhatsApp Popup Modal
const WhatsAppModal: React.FC<{ link: string; onClose: () => void }> = ({ link, onClose }) => (
    <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative bg-[#111] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>

                {/* WhatsApp Icon */}
                <div className="w-20 h-20 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#25D366]/20">
                    <MessageCircle className="w-10 h-10 text-[#25D366]" />
                </div>

                <h2 className="text-2xl font-bold mb-2">You're In! 🎉</h2>
                <p className="text-gray-400 mb-2">
                    Your application has been submitted successfully.
                </p>
                <p className="text-gray-400 mb-6">
                    Join our <strong className="text-white">WhatsApp Group</strong> to stay updated with recruitment news & announcements!
                </p>

                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#25D366] hover:bg-[#22c35e] text-white font-bold rounded-xl transition-colors text-base mb-3"
                >
                    <MessageCircle className="w-5 h-5" />
                    Join WhatsApp Group
                </a>

                <button
                    onClick={onClose}
                    className="w-full py-3 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-xl transition-colors text-sm"
                >
                    Skip for now
                </button>
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

const Recruit: React.FC = () => {
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [showWhatsApp, setShowWhatsApp] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState('https://chat.whatsapp.com/G8Ds9PBrIlpFV5lpvClOVV?mode=gi_t');
    const [recruitmentOpen, setRecruitmentOpen] = useState<boolean | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeBatches, setActiveBatches] = useState<string[]>([]);
    const [form, setForm] = useState<{
        name: string; email: string; phone: string; rollNo: string; branch: string; batch: string;
        interests: string[]; esportsGame: string;
        whyJoin: string;
    }>({
        name: '', email: '', phone: '', rollNo: '', branch: '', batch: '2025',
        interests: [], esportsGame: '',
        whyJoin: '',
    });

    useEffect(() => {
        // Auto-set batch to Current Year - 1
        const currentYear = new Date().getFullYear();
        const targetBatch = (currentYear - 1).toString();
        setForm(f => ({ ...f, batch: targetBatch }));
        setActiveBatches([targetBatch]);

        // Fetch configs
        api.getConfig('whatsappGroupLink')
            .then((link: string | null) => { if (link) setWhatsappLink(link); })
            .catch(() => { });
        api.getConfig('recruitmentOpen')
            .then((val: boolean | null) => setRecruitmentOpen(val !== false))
            .catch(() => setRecruitmentOpen(true));
    }, []);

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
        if (step !== 3) return;

        if (form.interests.length === 0) {
            setError('Please select at least one interest (Ignite Club or BITP Esports).');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.submitApplication(form);
            // Use whatsapp link from response if backend returns it
            if (res?.whatsappLink) setWhatsappLink(res.whatsappLink);
            setShowWhatsApp(true);
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleWhatsAppClose = () => {
        setShowWhatsApp(false);
        setSubmitted(true);
    };

    // Loading config
    if (recruitmentOpen === null) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-gray-500 animate-pulse">Loading...</div>
            </div>
        );
    }

    // Recruitment closed
    if (!recruitmentOpen) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-4">Recruitment Closed</h2>
                    <p className="text-gray-400">Recruitment is not open right now. Check back later or follow our announcements for updates.</p>
                </motion.div>
            </div>
        );
    }

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
            {/* WhatsApp Popup */}
            {showWhatsApp && (
                <WhatsAppModal link={whatsappLink} onClose={handleWhatsAppClose} />
            )}

            <div className="container mx-auto px-6 max-w-2xl">
                <SectionWrapper>
                    <div className="text-center mb-12">
                        <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary uppercase tracking-[0.2em] inline-block mb-6">
                            <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" /> Recruitment {activeBatches.join(' / ') || 'open'}
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
                            <h3 className="text-xl font-bold mb-4">Academic &amp; Interests</h3>
                            <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="Roll Number (e.g., BTECH/15XXX/2X) *" required className={inputClass} />

                            <div className="relative">
                                <input
                                    name="batch"
                                    type="number"
                                    value={form.batch}
                                    readOnly
                                    className={`${inputClass} opacity-50 cursor-not-allowed`}
                                />
                                <p className="text-gray-500 text-xs mt-1 absolute right-2 top-3">
                                    Auto-set for {new Date().getFullYear() - 1} Batch
                                </p>
                            </div>

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
